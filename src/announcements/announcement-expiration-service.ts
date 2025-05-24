// announcements/announcement-expiration.service.ts

import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';

import { AnnouncementsService } from './announcements.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from 'src/mail/mail.service';
import { StatusTypes } from 'src/public/enums/statusTypes.enum';
import { differenceInCalendarDays } from 'date-fns';

@Injectable()
export class AnnouncementExpirationService {
  private readonly logger = new Logger(AnnouncementExpirationService.name);

  constructor(
    private readonly announcementsService: AnnouncementsService,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleExpirations() {
    this.logger.log('🕑 Checking announcements for upcoming expiration…');
    const announcements = await this.announcementsService.findAllActive();
    const now = new Date();
    const frontUrl = this.config.get<string>('FRONTEND_URL');

    for (const ann of announcements) {
      // pick the last payment
      const lastPayment = ann.payments
        .filter(p => p.packageEndDate)
        .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())[0];
      if (!lastPayment || !lastPayment.packageEndDate) continue;

      const daysLeft = differenceInCalendarDays(
        new Date(lastPayment.packageEndDate),
        now,
      );
      const renewLink = `${frontUrl}/payment-packages?announcementId=${ann.id}`;

      if ([3, 2, 1].includes(daysLeft)) {
        await this.mailService.sendExpirationReminder(
          ann.user.email,
          ann.user.firstName,
          renewLink,
          daysLeft,
        );
      }

      if (daysLeft === 0) {
        // mark pending *and* notify
        await this.announcementsService.setStatus(ann.id, StatusTypes.pending);
        await this.mailService.sendExpiredNotice(
          ann.user.email,
          ann.user.firstName,
          renewLink,
        );
      }

      if (daysLeft < 0 && ann.status === StatusTypes.active) {
        // catch any stragglers
        await this.announcementsService.setStatus(ann.id, StatusTypes.pending);
      }
    }

    this.logger.log('✔️ Announcement expiration check complete.');
  }
}
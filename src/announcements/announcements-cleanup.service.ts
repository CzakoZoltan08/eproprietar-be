import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';

import { AnnouncementsService } from './announcements.service';

@Injectable()
export class AnnouncementsCleanupService {
  private readonly logger = new Logger(AnnouncementsCleanupService.name);

  constructor(private readonly announcementsService: AnnouncementsService) {}

  // Run this job every hour to remove old pending announcements
  @Cron(CronExpression.EVERY_WEEK)
  async deleteExpiredPendingAnnouncements() {
    this.logger.log('Running cleanup for expired pending announcements...');

    const deletedCount = await this.announcementsService.removeByStatusAndTime();

    this.logger.log(`Deleted ${deletedCount} expired announcements.`);
  }
}
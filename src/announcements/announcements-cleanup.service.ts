import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';

import { AnnouncementsService } from './announcements.service';

@Injectable()
export class AnnouncementsCleanupService {
  private readonly logger = new Logger(AnnouncementsCleanupService.name);

  constructor(private readonly announcementsService: AnnouncementsService) {}

  // Run this job every hour to remove old pending announcements
  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async deleteExpiredPendingAnnouncements() {
    this.logger.log('Running cleanup for expired pending announcements...');

    const deletedCount = await this.announcementsService.removeByStatusAndTime();

    this.logger.log(`Deleted ${deletedCount} expired announcements.`);
  }
}
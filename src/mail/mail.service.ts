import { Injectable, Logger } from '@nestjs/common';

import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private mailerService: MailerService) {}

  async sendAnnouncementConfirmation(to: string, name: string, announcementUrl: string) {
    try {
      const result = await this.mailerService.sendMail({
        to,
        subject: 'Your announcement is live!',
        template: 'announcement-creation',
        context: {
          name,
          url: announcementUrl,
        },
      });
      this.logger.log(`Announcement email sent to ${to}: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(`Failed to send announcement email to ${to}: ${(error as Error).message}`);
    }
  }

  async sendNewsletter(to: string, name: string, content: string) {
    try {
      const result = await this.mailerService.sendMail({
        to,
        subject: 'Stay Updated with Our Latest News!',
        template: 'newsletter',
        context: {
          name,
          content,
        },
      });
      this.logger.log(`Newsletter email sent to ${to}: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(`Failed to send newsletter email to ${to}: ${(error as Error).message}`);
    }
  }

  async sendUserCredentials(to: string, name: string, username: string, password: string) {
    try {
      const result = await this.mailerService.sendMail({
        to,
        subject: 'Your New Account Details',
        template: 'new-user-notification',
        context: {
          name,
          username,
          password,
        },
      });
      this.logger.log(`User credentials email sent to ${to}: ${JSON.stringify(result)}`);
    } catch (error) {
      this.logger.error(`Failed to send user credentials email to ${to}: ${(error as Error).message}`);
    }
  }
}
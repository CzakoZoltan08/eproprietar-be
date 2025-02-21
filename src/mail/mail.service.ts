import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendAnnouncementConfirmation(to: string, name: string, state: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Annoucement Created Successfully!',
      template: 'announcement-creation', // templates/announcement-creation.hbs
      context: {
        name,
        state,
      },
    });
  }

  async sendNewsletter(to: string, name: string, content: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Stay Updated with Our Latest News!',
      template: 'newsletter', // templates/newsletter.hbs
      context: {
        name,
        content,
      },
    });
  }
}
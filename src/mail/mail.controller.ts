import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MailService } from './mail.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('mail')
export class MailController {
  constructor(private mailService: MailService) {}

  @Post('annnouncement-confirmation')
  async orderConfirmation(@Body() body: { to: string; name: string; announcementState: string }) {
    await this.mailService.sendAnnouncementConfirmation(body.to, body.name, body.announcementState);
    return { message: 'Announcement confirmation email sent' };
  }

  @Post('newsletter')
  async newsletter(@Body() body: { to: string; name: string; content: string }) {
    await this.mailService.sendNewsletter(body.to, body.name, body.content);
    return { message: 'Newsletter email sent' };
  }
}
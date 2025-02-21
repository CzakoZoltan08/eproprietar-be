import { ConfigService } from '@nestjs/config';
import { IConfig } from 'src/public/configuration';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<IConfig>) => ({
        transport: {
          host: 'smtp.sendgrid.net',
          port: 587,
          auth: {
            user: 'apikey', // Always use 'apikey' for SendGrid
            pass: configService.get<string>('SENDGRID_API_KEY'),
          },
        },
        defaults: {
          from: configService.get<string>('SENDGRID_FROM_EMAIL'),
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new (require('@nestjs-modules/mailer/dist/adapters/handlebars.adapter')).HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
  controllers: [MailController],
})
export class MailModule {}
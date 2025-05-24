import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { IConfig } from 'src/public/configuration';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<IConfig>) => ({
        transport: {
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: 'apikey',
            pass: config.get<string>('SENDGRID_API_KEY'),
          },
          tls: { rejectUnauthorized: false },
        },
        defaults: {
          from: config.get<string>('SENDGRID_FROM_EMAIL'),
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(
            {
              // register eq at top‐level
              eq: (v1: any, v2: any) => v1 === v2,
            }
          ),
          options: {
            // compile‐time strict mode lives here
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  controllers: [MailController],
  exports: [MailService],
})
export class MailModule {}
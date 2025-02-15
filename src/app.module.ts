import { ConfigModule, ConfigService } from '@nestjs/config';
import { IConfig, configuration, validate } from './public/configuration';
import { MiddlewareConsumer, Module } from '@nestjs/common';

import { Agency } from './agency/entities/agency.entity';
import { AgencyModule } from './agency/agency.module';
import { Announcement } from './announcements/entities/announcement.entity';
import { AnnouncementsCleanupService } from './announcements/announcements-cleanup.service';
import { AnnouncementsModule } from './announcements/announcements.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { PassportModule } from '@nestjs/passport';
import { PaymentModule } from './payment/payment.module';
import { RequestLoggerMiddleware } from './public/middlewares/request_logger.middleware';
import { ScheduleModule } from '@nestjs/schedule';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Subscription } from './subscription/entities/subscription.entity';
import { SubscriptionModule } from './subscription/subscription.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadModule } from './upload/upload.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';

// todo: add all entities here
const ENTITIES = [User, Announcement, Subscription, Agency];

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'config/.env',
      load: [configuration],
      isGlobal: true,
      cache: true
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async (config: ConfigService<IConfig>) => {
        return {
          type: 'postgres',
          host: config.get('DB_HOST'),
          port: config.get('DB_PORT'),
          username: config.get('DB_USERNAME'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_DATABASE'),
          entities: ENTITIES,
          synchronize: true,
          namingStrategy: new SnakeNamingStrategy(),
        };
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(), // Enables scheduling
    PaymentModule,
    HealthModule,
    UsersModule,
    AuthModule,
    AnnouncementsModule,
    SubscriptionModule,
    PassportModule,
    AgencyModule,
    UploadModule
  ],
  controllers: [AppController],
  providers: [AppService, AnnouncementsCleanupService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}

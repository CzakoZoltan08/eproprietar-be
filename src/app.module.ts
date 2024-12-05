import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { configuration, IConfig, validate } from './public/configuration';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { Announcement } from './announcements/entities/announcement.entity';
import { AnnouncementsModule } from './announcements/announcements.module';
import { Subscription } from './subscription/entities/subscription.entity';
import { SubscriptionModule } from './subscription/subscription.module';
import { FirebaseAuthStrategy } from './public/strategies/firebase-auth.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './auth/auth.module';
import { AgencyModule } from './agency/agency.module';
import { Agency } from './agency/entities/agency.entity';

// todo: add all entities here
const ENTITIES = [User, Announcement, Subscription, Agency];

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        `config/${process.env.NODE_ENV || 'development'}.env`,
        '.env',
      ],
      load: [configuration],
      isGlobal: true,
      cache: true,
      validate,
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
    HealthModule,
    UsersModule,
    AuthModule,
    AnnouncementsModule,
    SubscriptionModule,
    PassportModule,
    AgencyModule,
  ],
  controllers: [AppController],
  providers: [AppService, FirebaseAuthStrategy],
})
export class AppModule {}

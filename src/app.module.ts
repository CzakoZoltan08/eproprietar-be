import { ConfigModule, ConfigService } from '@nestjs/config';
import { IConfig, configuration, validate } from './public/configuration';

import { Agency } from './agency/entities/agency.entity';
import { AgencyModule } from './agency/agency.module';
import { Announcement } from './announcements/entities/announcement.entity';
import { AnnouncementsModule } from './announcements/announcements.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Subscription } from './subscription/entities/subscription.entity';
import { SubscriptionModule } from './subscription/subscription.module';
import { TypeOrmModule } from '@nestjs/typeorm';
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
          host: 'aws-0-eu-central-1.pooler.supabase.com',
          port: 6543,
          username: 'postgres.blnamwnthkhmglhkdiwo',
          password: 'eproprietar_2024',
          database: 'postgres',
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
  providers: [AppService],
})
export class AppModule {}

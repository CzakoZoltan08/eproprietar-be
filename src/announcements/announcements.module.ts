import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { Announcement } from './entities/announcement.entity';
import { UsersModule } from '../users/users.module';
import { AgencyModule } from '../agency/agency.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Announcement]),
    forwardRef(() => UsersModule),
    forwardRef(() => AgencyModule),
  ],

  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
  exports: [AnnouncementsService],
})
export class AnnouncementsModule {}

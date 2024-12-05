import { forwardRef, Module } from '@nestjs/common';
import { AgencyService } from './agency.service';
import { AgencyController } from './agency.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnnouncementsModule } from '../announcements/announcements.module';
import { Agency } from './entities/agency.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Agency]),
    forwardRef(() => AnnouncementsModule),
  ],
  controllers: [AgencyController],
  providers: [AgencyService],
  exports: [AgencyService],
})
export class AgencyModule {}

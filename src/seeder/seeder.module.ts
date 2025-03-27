import { AnnouncementPackage } from 'src/payment/entities/announcement-package.entity';
import { AnnouncementPayment } from 'src/payment/entities/announcement-payment.entity';
import { Discount } from 'src/payment/entities/discount.entity';
import { Module } from '@nestjs/common';
import { PromotionPackage } from 'src/payment/entities/promotion-package.entity';
import { SeederService } from './seeder.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AnnouncementPackage, AnnouncementPayment, Discount, PromotionPackage])],
  providers: [SeederService],
})
export class SeederModule {}
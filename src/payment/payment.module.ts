import { Announcement } from 'src/announcements/entities/announcement.entity';
import { AnnouncementPackage } from './entities/announcement-package.entity';
import { AnnouncementPayment } from './entities/announcement-payment.entity';
import { AnnouncementPaymentService } from './services/announcement-payment.service';
import { AnnouncementsModule } from 'src/announcements/announcements.module';
import { Discount } from './entities/discount.entity';
import { MailModule } from 'src/mail/mail.module';
import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PricingService } from './services/pricing.service';
import { PromotionPackage } from './entities/promotion-package.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [PaymentService, AnnouncementPaymentService, PricingService],
  controllers: [PaymentController],
  exports: [PaymentService, AnnouncementPaymentService, PricingService], // If used in other modules
  imports: [
    AnnouncementsModule,
    MailModule,
    TypeOrmModule.forFeature([
      AnnouncementPayment,
      Announcement,
      AnnouncementPackage,
      Discount,
      PromotionPackage
    ]),
  ], // Import other modules here 
})
export class PaymentModule {}
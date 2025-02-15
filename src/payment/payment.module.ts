import { AnnouncementsModule } from 'src/announcements/announcements.module';
import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService], // If used in other modules
  imports: [AnnouncementsModule], // Import other modules here 
})
export class PaymentModule {}
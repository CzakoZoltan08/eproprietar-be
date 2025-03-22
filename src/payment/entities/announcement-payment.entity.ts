import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentPackageType, PromotionPackageType } from '../enums/announcement-payment.enums';

import { Announcement } from '../../announcements/entities/announcement.entity';
import { CurrencyType } from '../../public/enums/currencyTypes.enum';
import { Discount } from './discount.entity';

@Entity()
export class AnnouncementPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: CurrencyType })
  currency: CurrencyType;

  @Column({ type: 'decimal' })
  amount: number;

  @Column({ type: 'decimal', nullable: true })
  originalAmount?: number;

  @Column({ type: 'decimal', nullable: true })
  discountAmount?: number;

  @Column({ type: 'enum', enum: PaymentPackageType, nullable: true })
  packageType?: PaymentPackageType;

  @Column({ type: 'enum', enum: PromotionPackageType, nullable: true })
  promotionType?: PromotionPackageType;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @ManyToOne(() => Announcement, (a) => a.payments)
  announcement: Announcement;

  @ManyToOne(() => Discount, { nullable: true })
  discount?: Discount;

  @CreateDateColumn()
  createdAt: Date;
}
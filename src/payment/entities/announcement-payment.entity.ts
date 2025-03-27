import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PaymentPackageType, PromotionPackageType } from '../enums/announcement-payment.enums';

import { Announcement } from '../../announcements/entities/announcement.entity';
import { AnnouncementPackage } from './announcement-package.entity';
import { CurrencyType } from '../../public/enums/currencyTypes.enum';
import { Discount } from './discount.entity';
import { PromotionPackage } from './promotion-package.entity';

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

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  packageEndDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  promotionEndDate?: Date;

  @ManyToOne(() => Announcement, (a) => a.payments)
  announcement: Announcement;

  @ManyToOne(() => AnnouncementPackage, { eager: true })
  package: AnnouncementPackage;

  @ManyToOne(() => PromotionPackage, { nullable: true })
  promotion?: PromotionPackage;

  @ManyToOne(() => Discount, { nullable: true })
  discount?: Discount;

  @CreateDateColumn()
  createdAt: Date;
}
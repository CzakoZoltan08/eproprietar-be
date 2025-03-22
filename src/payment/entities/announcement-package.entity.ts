import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { PaymentPackageType, PromotionPackageType } from '../enums/announcement-payment.enums';

import { CurrencyType } from '../../public/enums/currencyTypes.enum';

@Entity()
  export class AnnouncementPackage {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'enum', enum: CurrencyType, default: CurrencyType.EURO })
    currency: CurrencyType;
  
    @Column()
    label: string;
  
    @Column({ type: 'decimal' })
    price: number;
  
    @Column({ type: 'int', nullable: true })
    durationDays?: number;
  
    @Column({ type: 'enum', enum: PaymentPackageType, nullable: true })
    packageType?: PaymentPackageType;
  
    @Column({ type: 'enum', enum: PromotionPackageType, nullable: true })
    promotionType?: PromotionPackageType;
  
    @Column({ default: true })
    active: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
}
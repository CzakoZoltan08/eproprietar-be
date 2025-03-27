import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { PaymentPackageType, PromotionPackageType } from '../enums/announcement-payment.enums';

@Entity()
  export class Discount {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true })
    code: string;
  
    @Column({ nullable: true })
    description: string;
  
    @Column({ type: 'decimal', nullable: true })
    fixedAmount?: number;
  
    @Column({ type: 'decimal', nullable: true })
    percentage?: number;
  
    @Column({ type: 'timestamp', nullable: true })
    validFrom?: Date;
  
    @Column({ type: 'timestamp', nullable: true })
    validTo?: Date;
  
    @Column({ type: 'int', nullable: true })
    usageLimit?: number;
  
    @Column({ type: 'int', nullable: true })
    usagePerUserLimit?: number;
  
    @Column("text", { array: true, nullable: true })
    allowedUserIds?: string[];
  
    @Column("text", { array: true, nullable: true })
    applicablePackageTypes?: PaymentPackageType[];

    @Column("text", { array: true, nullable: true })
    applicablePromotionTypes?: PromotionPackageType[];
  
    @Column({ default: true })
    active: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
}
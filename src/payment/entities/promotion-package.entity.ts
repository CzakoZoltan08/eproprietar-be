import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { CurrencyType } from "src/public/enums/currencyTypes.enum";
import { PromotionPackageType } from "../enums/announcement-payment.enums";

@Entity()
export class PromotionPackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  label: string;

  @Column({ type: 'decimal' })
  price: number;

  @Column({ type: 'int' })
  durationDays: number;

  @Column({ type: 'enum', enum: PromotionPackageType })
  promotionType: PromotionPackageType;

  @Column({ type: 'enum', enum: CurrencyType })
  currency: CurrencyType;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
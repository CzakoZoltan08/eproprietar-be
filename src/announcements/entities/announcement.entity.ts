import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {
  AnnouncementType,
  ApartamentPartitionings,
  BalconyTypes,
  ParkingTypes,
} from '../../public/enums/announcementTypes.enum';
import { AnnouncementProviderType } from '../../public/enums/providerTypes.enum';
import { TransactionType } from '../../public/enums/transactionTypes.enum';
import { CurrencyType } from '../../public/enums/currencyTypes.enum';
import { User } from '../../users/entities/user.entity';
import { StatusTypes } from '../../public/enums/statusTypes.enum';
import { Agency } from '../../agency/entities/agency.entity';

@Entity()
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'enum', enum: AnnouncementType })
  announcementType: string;

  @Column({ nullable: false, type: 'enum', enum: AnnouncementProviderType })
  providerType: string;

  @Column({ nullable: false, type: 'enum', enum: TransactionType })
  transactionType: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  city: string;

  @Column({ nullable: true })
  street: string;

  @Column({ nullable: false })
  price: number;

  @Column({ default: false })
  deleted: boolean;

  @Column({
    nullable: true,
    type: 'enum',
    enum: CurrencyType,
    default: CurrencyType.EURO,
  })
  currency: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: ApartamentPartitionings,
  })
  apartamentPartitioning: string;

  @Column({
    type: 'enum',
    enum: StatusTypes,
    default: StatusTypes.active,
  })
  status: string;

  @Column({ nullable: true })
  comfortLevel: string;

  @Column({ nullable: false })
  rooms: number;

  @Column({ nullable: true })
  numberOfKitchens: number;

  @Column({ nullable: false })
  surface: number;

  @Column({ nullable: true })
  schema: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  partitioning: string;

  @Column({ nullable: true })
  baths: number;

  @Column({ nullable: true })
  floor: number;

  @Column({ nullable: true })
  isNew: boolean;

  @Column({ nullable: true, enum: BalconyTypes })
  balcony: string;

  @Column({ nullable: true, enum: ParkingTypes })
  parking: string;

  @Column({ nullable: true })
  stage: string;

  @Column({ nullable: true })
  endDate: string;

  @Column({ nullable: true })
  isExclusivity: boolean;

  @ManyToOne(() => User, (user) => user.announcements, {
    nullable: true,
  })
  user: User;

  @ManyToOne(() => Agency, (agency) => agency.announcements, {
    nullable: true,
  })
  agency: Agency;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

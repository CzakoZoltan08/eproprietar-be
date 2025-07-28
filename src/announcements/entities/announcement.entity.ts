import {
  AnnouncementType,
  ApartamentPartitionings,
  BalconyTypes,
  ParkingTypes,
} from '../../public/enums/announcementTypes.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Agency } from '../../agency/entities/agency.entity';
import { AnnouncementPayment } from 'src/payment/entities/announcement-payment.entity';
import { AnnouncementProviderType } from '../../public/enums/providerTypes.enum';
import { CurrencyType } from '../../public/enums/currencyTypes.enum';
import { StatusTypes } from '../../public/enums/statusTypes.enum';
import { TransactionType } from '../../public/enums/transactionTypes.enum';
import { User } from '../../users/entities/user.entity';

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

  @Column({ nullable: false, default: 'Cluj' })
  county: string;

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
  landSurface: number;

  @Column({ nullable: true })
  schema: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  apartmentTypeOther: string;

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

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  sketchUrl: string;

  @Column({ nullable: true })
  developerName: string;
  
  @Column({ nullable: true })
  phoneContact: string;

  @ManyToOne(() => User, (user) => user.announcements, {
    nullable: true,
  })
  user: User;

  @ManyToOne(() => Agency, (agency) => agency.announcements, {
    nullable: true,
  })
  agency: Agency;

  @OneToMany(() => AnnouncementPayment, (payment) => payment.announcement, {
    cascade: true,
  })
  payments: AnnouncementPayment[];

  @Column({ default: false })
  isPromoted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true, default: false })
  streetFront: boolean;

  @Column("simple-array", { nullable: true })
  heightRegime: string[];

  @Column({ nullable: true })
  streetFrontLength: number;

  @Column({ nullable: true })
  landType: string;

  @Column({ nullable: true })
  landPlacement: string;

  @Column("simple-array", { nullable: true })
  urbanismDocuments: string[];

  @Column("simple-json", { nullable: true })
  utilities: {
    curent: boolean | null;
    apa: boolean | null;
    canalizare: boolean | null;
    gaz: boolean | null;
  };

  // === Spatii comerciale ===
  @Column({ nullable: true })
  commercialSpaceType: string; // Tip spațiu: comercial, birouri, industrial

  @Column({ nullable: true })
  usableSurface: number; // Suprafață utilă (mp)

  @Column({ nullable: true })
  builtSurface: number; // Suprafață construită (mp)

  @Column({ nullable: true })
  spaceHeight: number; // Înălțime spațiu (m)

  @Column({ nullable: true })
  hasStreetWindow: boolean; // Vitrină la stradă: Da / Nu

  @Column({ nullable: true })
  streetWindowLength: number; // Front vitrină la stradă (ml)

  @Column({ nullable: true })
  hasStreetEntrance: boolean; // Intrare din stradă: Da / Nu

  @Column({ nullable: true })
  hasLift: boolean; // Lift: Da / Nu

  @Column("simple-array", { nullable: true })
  vehicleAccess: string[]; // Acces auto: TIR, Autocar, Camioane, Autoturism
}

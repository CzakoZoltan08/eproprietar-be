import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Announcement } from '../../announcements/entities/announcement.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';

export enum AuthProvider {
  GOOGLE = 'google.com',
  EMAIL = 'email',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  firebaseId: string;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  role: string;

  @Column({ nullable: false, unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ enum: AuthProvider, type: 'enum' })
  authProvider: AuthProvider;

  @OneToMany(() => Announcement, (announcement) => announcement.user, {
    nullable: true,
  })
  announcements: Announcement[];

  @OneToOne(() => Subscription, (subscription) => subscription.user)
  @JoinColumn()
  subscription: Subscription;

  @Column({ type: 'json', nullable: true })
  favourites: string[];
}

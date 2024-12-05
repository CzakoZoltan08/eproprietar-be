import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity()
export class Subscription {
  @PrimaryColumn()
  stripeId: string;

  @Column({ nullable: false })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  shippingAddress: string;

  @Column({ nullable: true })
  price: number;

  @Column({ nullable: true })
  discount: number;

  //Relations

  @OneToOne(() => User, (user) => user.subscription)
  user: User;
}

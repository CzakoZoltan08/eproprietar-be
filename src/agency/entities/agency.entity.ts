import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Announcement } from '../../announcements/entities/announcement.entity';

@Entity()
export class Agency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  link: string;

  @OneToMany(() => Announcement, (announcement) => announcement.agency, {
    nullable: true,
  })
  announcements?: Announcement[];
}

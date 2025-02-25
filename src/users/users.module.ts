import { Module, forwardRef } from '@nestjs/common';

import { AnnouncementsModule } from '../announcements/announcements.module';
import { FirebaseModule } from 'config/firebase/firebase.module';
import { MailModule } from 'src/mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AnnouncementsModule),
    FirebaseModule,
    MailModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

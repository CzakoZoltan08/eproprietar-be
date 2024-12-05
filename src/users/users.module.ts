import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AnnouncementsModule } from '../announcements/announcements.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AnnouncementsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

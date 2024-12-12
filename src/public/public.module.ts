// import { LocalStrategy } from '../auth/local.strategy';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Module({
  providers: [],
  imports: [TypeOrmModule.forFeature([User])],
})
export class PublicModule {}

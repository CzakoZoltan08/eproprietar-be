import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { FirebaseAuthStrategy } from './strategies/firebase-auth.strategy';
import { LocalStrategy } from '../auth/local.strategy';

@Module({
  providers: [FirebaseAuthStrategy, LocalStrategy],
  imports: [TypeOrmModule.forFeature([User])],
})
export class PublicModule {}

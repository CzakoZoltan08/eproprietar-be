import { AuthProvider, User } from '../users/entities/user.entity';
import { AuthRequestDto, RegisterResponseDto } from './dto/register.dto';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';

import { UsersService } from '../users/users.service';
import admin from 'firebase-admin';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  private get app(): admin.app.App {
    return admin.app();
  }

  async register(user: AuthRequestDto): Promise<RegisterResponseDto> {
    const newUser = new User();
    newUser.email = user.email;
    newUser.firstName = user.firstName;
    newUser.lastName = user.lastName;
    newUser.authProvider = AuthProvider.EMAIL;
    try {
      const res = await this.app.auth().createUser({
        email: user.email,
        emailVerified: false,
        password: user.password,
        displayName: user.firstName + ' ' + user.lastName,
      });
      newUser.firebaseId = res.uid;

      const savedUser = await this.usersService.create(newUser);
      await this.app.auth().generateEmailVerificationLink(user.email);

      return { userId: savedUser.id, firebaseId: res.uid };
    } catch (err) {
      throw err;
    }
  }
}

// src/users/dto/create-firebase-user.dto.ts

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateFirebaseUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}
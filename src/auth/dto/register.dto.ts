import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

import { IsValidPassword } from '../../public/decorators/password-validate.decorator';

export class AuthRequestDto {
  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @IsString()
  @IsValidPassword()
  readonly password: string;

  @IsNotEmpty()
  @ApiProperty()
  readonly firstName: string;

  @IsNotEmpty()
  @ApiProperty()
  readonly lastName: string;
}

@Exclude()
export class RegisterResponseDto {
  @Expose()
  @ApiProperty()
  readonly userId: string;

  @Expose()
  @ApiProperty()
  readonly firebaseId: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AuthProvider } from '../entities/user.entity';

export class CreateUserRequestDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsOptional()
  authProvider: AuthProvider;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firebaseId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phoneNumber: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsOptional()
  favourites: string[];
}

@Exclude()
export class CreateUserResponseDto {
  @Expose()
  @ApiProperty()
  displayName: string;

  @Expose()
  @ApiProperty()
  phoneNumber: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  firebaseId: string;
}

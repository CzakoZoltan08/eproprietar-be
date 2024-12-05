import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordRequestDto {
  @IsEmail()
  @ApiProperty()
  email: string;
}

export class ForgotPasswordResponseDto {
  @ApiProperty()
  message: string;
}

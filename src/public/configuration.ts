import {
  IsEnum,
  IsInt,
  IsNumber,
  IsString,
  validateSync,
} from 'class-validator';

import { InternalServerErrorException } from '@nestjs/common/exceptions/internal-server-error.exception';
import { plainToClass } from 'class-transformer';

export const configuration = () => 
  {
    console.log('Environment Variables:', process.env);

    return {
      NODE_ENV: process.env.NODE_ENV || Environment.Development,
      PORT: parseInt(process.env.PORT, 10) || 3000,

      TEST: process.env.NODE_ENV === 'test',

      DB_HOST: process.env.DB_HOST,
      DB_USERNAME: process.env.DB_USERNAME,
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_DATABASE: process.env.DB_DATABASE,
      DB_PORT: process.env.DB_PORT,

      JWT_SECRET: process.env.JWT_SECRET,

      FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  }
};

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class IConfig {
  @IsEnum(Environment)
  NODE_ENV: string;

  @IsNumber()
  PORT: number;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  DB_HOST: string;
  @IsString()
  DB_USERNAME: string;
  @IsString()
  DB_PASSWORD: string;
  @IsString()
  DB_DATABASE: string;
  @IsInt()
  DB_PORT: number;
  FIREBASE_CLIENT_EMAIL: string;
  @IsString()
  FIREBASE_PRIVATE_KEY: string;
  @IsString()
  FIREBASE_PROJECT_ID: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(IConfig, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    throw new InternalServerErrorException(errors.toString());
  }
  return validatedConfig;
}

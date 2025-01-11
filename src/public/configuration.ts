import { InternalServerErrorException } from '@nestjs/common/exceptions/internal-server-error.exception';
import { plainToClass } from 'class-transformer';
import {
  validateSync,
} from 'class-validator';

export const configuration = () => 
  {
    return {
      NODE_ENV: process.env.NODE_ENV || Environment.Development,
      PORT: parseInt(process.env.PORT, 10) || 3000,

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
  NODE_ENV: string;
  PORT: number;
  TEST: boolean;
  JWT_SECRET: string;
  DB_HOST: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  DB_PORT: number;
  FIREBASE_CLIENT_EMAIL: string;
  FIREBASE_PRIVATE_KEY: string;
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

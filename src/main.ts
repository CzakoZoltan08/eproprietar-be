import { AppModule } from './app.module';
import { ConfigOptions } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import admin from 'firebase-admin';
import { v2 as cloudinary } from 'cloudinary';
import express from 'express';

let server: (req: any, res: any, next: any) => void | null = null;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bodyParser: false,
  });

  app.enableCors({
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    allowedHeaders: '*',
    origin: '*',
    credentials: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove unknown properties
      transform: true, // Automatically transform to DTO
    }),
  );

  // Custom body parsers
  app.use(express.json()); // Parse application/json
  app.use(express.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded

  // app.use(helmet({
  //   crossOriginEmbedderPolicy: false,
  // }));

  const configService = app.get(ConfigService);

  admin.initializeApp({
    credential: admin.credential.cert({
      clientEmail: configService.get('FIREBASE_CLIENT_EMAIL'),
      privateKey: configService.get<string>('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
      projectId: configService.get('FIREBASE_PROJECT_ID'),
    }),
  });

  const cloudinaryConfig: ConfigOptions = {
    cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
    api_key: configService.get('CLOUDINARY_API_KEY'),
    api_secret: configService.get('CLOUDINARY_API_SECRET'),
  };

  cloudinary.config(cloudinaryConfig);

  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();

  server = (req, res, next) => expressApp(req, res, next);

  app.listen(3001)
}

const bootstrapPromise = bootstrap();

export default async function handler(req, res, next) {
  if (!server) {
    await bootstrapPromise;
    if (!server) {
      throw new Error('Server not initialized.');
    }
  }
  return server(req, res, next);
}

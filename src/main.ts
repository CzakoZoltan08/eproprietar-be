import * as bodyParser from 'body-parser';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Handler, NextFunction, Request, Response, json, urlencoded } from 'express';
import { ValidationPipe, VersioningType } from '@nestjs/common';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { IConfig } from './public/configuration';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import admin from 'firebase-admin';
import helmet from 'helmet';

let server: Handler | null = null;

async function bootstrap() {
  console.log('Starting application...');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204,
      maxAge: 600,
    },
    bodyParser: false,
  });
  console.log('Application created...');

  app.use(helmet());
  app.use(json({ limit: '30mb' }));
  app.use(urlencoded({ extended: true, limit: '30mb' }));

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService: ConfigService<IConfig> = app.get(ConfigService);

  admin.initializeApp({
    credential: admin.credential.cert({
      clientEmail: configService.get('FIREBASE_CLIENT_EMAIL'),
      privateKey: configService.get<string>('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
      projectId: configService.get('FIREBASE_PROJECT_ID'),
    }),
  });

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Skriptr API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.use((req: any, res: any, next: any) => {
    if (!req.originalUrl.includes('stripe')) {
      return bodyParser.json({ limit: '50mb' })(req, res, next);
    }
    return next();
  });

  app.enableCors();
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  server = (req: Request, res: Response, next: NextFunction) => {
    expressApp(req, res, next);
  };
}

const bootstrapPromise = bootstrap();

// Export the Express server as the default export for Vercel
export default async function handler(req: Request, res: Response, next: NextFunction) {
  if (!server) {
    await bootstrapPromise; // Ensure `bootstrap` is completed before using the server.
    if (!server) {
      throw new Error('Server is still not initialized after bootstrap.');
    }
  }
  return server(req, res, next);
}

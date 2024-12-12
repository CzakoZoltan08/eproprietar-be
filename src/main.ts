import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import admin from 'firebase-admin';
import helmet from 'helmet';

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

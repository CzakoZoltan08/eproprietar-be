import { Handler, NextFunction, Request, Response } from 'express';

import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';

let server: Handler;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors(); // Enable CORS for cross-origin requests
  await app.init();

  // Extract the Express instance
  const expressApp = app.getHttpAdapter().getInstance();
  server = (req: Request, res: Response, next: NextFunction) => {
    expressApp(req, res, next);
  };
}

bootstrap();

// Export the Express server as the default export for Vercel
export default function handler(req: Request, res: Response, next: NextFunction) {
  if (!server) {
    throw new Error('Server is not initialized.');
  }
  return server(req, res, next);
}

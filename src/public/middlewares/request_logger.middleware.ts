import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Incoming Request:', {
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
    });

    // Add custom logic here, if needed
    next(); // Pass control to the next middleware or route handler
  }
}

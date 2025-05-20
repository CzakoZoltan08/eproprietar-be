// auth/firebase-auth.guard.ts

import * as admin from 'firebase-admin';

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const authHeader = req.headers['authorization'];
    if (!authHeader) return false;

    const token = authHeader.split(' ')[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      return true;
    } catch (err) {
      console.error('Firebase token invalid:', (err as any)?.message);
      return false;
    }
  }
}
// src/config/firebase/firebase-admin.provider.ts

import { ConfigService } from '@nestjs/config';
import { initializeFirebaseAdmin } from './firebaseAdmin';

export const firebaseAdminProvider = {
  provide: 'FIREBASE_ADMIN',
  useFactory: (configService: ConfigService) => {
    return initializeFirebaseAdmin({
      projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
      privateKey: configService.get<string>('FIREBASE_PRIVATE_KEY'),
      clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
    });
  },
  inject: [ConfigService],
};
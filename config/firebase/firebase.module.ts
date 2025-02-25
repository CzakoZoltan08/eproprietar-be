// src/firebase/firebase.module.ts

import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { firebaseAdminProvider } from './firebase-admin.provider';

@Module({
  imports: [ConfigModule],
  providers: [firebaseAdminProvider],
  exports: [firebaseAdminProvider],
})
export class FirebaseModule {}
// src/config/firebase/firebaseAdmin.ts

import * as admin from 'firebase-admin';

export const initializeFirebaseAdmin = (config: {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}): typeof admin => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.projectId,
        privateKey: config.privateKey.replace(/\\n/g, '\n'),
        clientEmail: config.clientEmail,
      }),
      // Optionally add databaseURL if needed:
      // databaseURL: config.databaseURL,
    });
  }
  return admin;
};
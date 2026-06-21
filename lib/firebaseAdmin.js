import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const app = getApps().length === 0
  ? initializeApp({
      credential: cert({
        projectId: process.env.project_id,
        clientEmail: process.env.client_email,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    })
  : getApps()[0];

export const adminDb = getFirestore(app);
export { FieldValue };

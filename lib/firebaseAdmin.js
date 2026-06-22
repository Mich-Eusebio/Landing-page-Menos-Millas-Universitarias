import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const projectId = process.env.project_id || process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dummy-project-id';
const clientEmail = process.env.client_email || process.env.FIREBASE_CLIENT_EMAIL || 'dummy-email@client.com';
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDpFRSp\n-----END PRIVATE KEY-----').replace(/\\n/g, '\n');

const app = getApps().length === 0
  ? initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey
      })
    })
  : getApps()[0];

export const adminDb = getFirestore(app);
export { FieldValue };

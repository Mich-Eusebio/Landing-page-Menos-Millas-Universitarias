import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

let dbInstance = null;

function getAdminDb() {
  if (dbInstance) return dbInstance;

  const projectId = process.env.project_id || process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dummy-project-id';
  const clientEmail = process.env.client_email || process.env.FIREBASE_CLIENT_EMAIL || 'dummy-email@client.com';
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';

  if (!privateKey || privateKey.includes('MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDpFRSp')) {
    console.warn("⚠️ No valid private key found for Firebase Admin. Returning mock DB.");
    return new Proxy({}, {
      get(target, prop) {
        return () => {
          throw new Error(`Firebase Admin not fully configured for method: ${String(prop)}`);
        };
      }
    });
  }

  privateKey = privateKey.replace(/\\n/g, '\n');

  const app = getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey
        })
      })
    : getApps()[0];

  dbInstance = getFirestore(app);
  return dbInstance;
}

export const adminDb = new Proxy({}, {
  get(target, prop) {
    const db = getAdminDb();
    const value = db[prop];
    if (typeof value === 'function') {
      return value.bind(db);
    }
    return value;
  }
});

export { FieldValue };

import { redirect } from 'next/navigation';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import { socialNetworks } from '@/lib/social_networks';
import HomeClient from './HomeClient';

export const metadata = {
  verification: {
    other: {
      'impact-site-verification': ['16fde907-4de3-49d8-aaf9-e03523d00349'],
    },
  },
};

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const channel = params.channel;

  if (channel && channel !== '0') {
    const staticUrl = socialNetworks[channel.toLowerCase()];
    if (staticUrl) {
      redirect(staticUrl);
    }

    try {
      const docRef = adminDb.collection('company-sponsors').doc(channel.toLowerCase());
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        const data = docSnap.data();
        if (data.active !== false && data.url) {
          // Atomic click count increment to prevent race conditions
          docRef.update({
            clicks: FieldValue.increment(1)
          }).catch(err => console.error('Error actualizando clics:', err));
          
          redirect(data.url);
        }
      }
    } catch (error) {
      console.error('Error en redirección raíz (sponsors):', error);
    }
  }

  return <HomeClient />;
}
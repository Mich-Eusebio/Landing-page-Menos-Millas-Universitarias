import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import { socialNetworks } from '@/lib/social_networks';
import { calculateCampaignProgress } from '@/lib/campaignProgress';
import { getRequestLocale, HOME_COPY } from '@/lib/homeTranslations';
import HomeClient from './HomeClient';

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = getRequestLocale(requestHeaders.get('accept-language'));
  const copy = HOME_COPY[locale];

  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
    verification: {
      other: {
        'impact-site-verification': ['16fde907-4de3-49d8-aaf9-e03523d00349'],
      },
    },
  };
}

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const channel = params.channel;

  if (channel && channel !== '0') {
    const staticUrl = socialNetworks[channel.toLowerCase()];
    if (staticUrl) {
      redirect(staticUrl);
    }

    let dynamicUrl = null;

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

          dynamicUrl = data.url;
        }
      }
    } catch (error) {
      console.error('Error en redirección raíz (sponsors):', error);
    }

    // redirect() throws an internal Next.js signal, so it must stay outside
    // the try/catch used for Firestore errors.
    if (dynamicUrl) {
      redirect(dynamicUrl);
    }
  }

  const campaignProgress = calculateCampaignProgress();
  const requestHeaders = await headers();
  const locale = getRequestLocale(requestHeaders.get('accept-language'));

  return <HomeClient campaignProgress={campaignProgress} locale={locale} />;
}

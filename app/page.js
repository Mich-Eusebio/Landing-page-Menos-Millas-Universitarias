import { redirect } from 'next/navigation';
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
    const target = socialNetworks[channel];
    if (target) {
      redirect(target);
    }
  }
  return <HomeClient />;
}
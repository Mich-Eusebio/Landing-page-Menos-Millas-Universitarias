import { NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import { socialNetworks } from '@/lib/social_networks';

export async function GET(request, { params }) {
  const { slug } = await params;
  const code = slug.toLowerCase();

  // 1. Check local static network urls
  const staticUrl = socialNetworks[code];
  if (staticUrl) {
    return NextResponse.redirect(staticUrl);
  }

  // 2. Query company-sponsors collection in Firestore
  try {
    const docRef = adminDb.collection('company-sponsors').doc(code);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      const data = docSnap.data();
      if (data.active !== false && data.url) {
        // Atomic clicks increment
        docRef.update({
          clicks: FieldValue.increment(1)
        }).catch(err => console.error('Error actualizando clics:', err));

        return NextResponse.redirect(data.url);
      }
    }
  } catch (error) {
    console.error('Error en redirección corta /r/:', error);
  }

  // Fallback redirect to home if sponsor not active/found
  return NextResponse.redirect(new URL('/', request.url));
}

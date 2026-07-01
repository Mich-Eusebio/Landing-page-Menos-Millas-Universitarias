import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const url = searchParams.get('url');
  const name = searchParams.get('name');
  const secret = searchParams.get('secret');
  const activeParam = searchParams.get('active');

  // Verify secret
  if (!secret || secret !== process.env.ADMIN_REDIRECT_SECRET) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  // Validate parameters
  if (!code || !url || !name) {
    return NextResponse.json({ success: false, error: 'Parámetros "code", "url" y "name" requeridos' }, { status: 400 });
  }

  const active = activeParam !== 'false';
  const slug = code.toLowerCase();

  try {
    const docRef = adminDb.collection('company-sponsors').doc(slug);
    const docSnap = await docRef.get();
    
    const payload = {
      name,
      url,
      active,
      updatedAt: new Date().toISOString()
    };

    if (!docSnap.exists) {
      payload.clicks = 0;
      payload.createdAt = new Date().toISOString();
    }

    await docRef.set(payload, { merge: true });

    return NextResponse.json({
      success: true,
      message: `Sponsor "${name}" (${slug}) guardado con éxito en la colección company-sponsors.`,
      redirectUrl: `https://millasmichael.do/r/${slug}`,
      active
    });

  } catch (error) {
    console.error('Error creando sponsor dinámico:', error);
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 });
  }
}

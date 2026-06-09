import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/FirebaseConfig';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { sendRifaConfirmation } from '@/lib/apis/WhatsAppService';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-webhook-signature');
    const event = request.headers.get('x-webhook-event');
    
    console.log('📨 Webhook recibido:', event);
    console.log('📦 Payload:', rawBody);
    
    if (!signature) {
      console.error('❌ Firma faltante');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }
    
    if (process.env.WHATSAPP_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.WHATSAPP_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');
      
      if (signature.length !== expectedSignature.length || 
          !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        console.error('❌ Firma inválida');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);

    if (event === 'whatsapp.message.received') {
      await handleIncomingMessage(payload);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Error en webhook:', error);
    return NextResponse.json({ received: true });
  }
}

async function handleIncomingMessage(payload) {
  try {
    const message = payload.messages?.[0];
    if (!message) {
      console.log('⚠️ No hay mensaje en el payload');
      return;
    }

    const from = message.from;
    const text = message.text?.body || '';
    const textLower = text.toLowerCase();
    
    console.log(`📱 Mensaje de ${from}: ${text}`);

    if (textLower.includes('recuérdame') || textLower.includes('recuerdame') || textLower.includes('tickets')) {
      const uidMatch = text.match(/\[([a-f0-9-]+)\]/i);
      const uid = uidMatch ? uidMatch[1] : null;
      
      console.log(`🔍 UID extraído: ${uid || 'ninguno'}`);
      
      await sendTicketsReminder(from, uid);
    }
  } catch (error) {
    console.error('❌ Error procesando mensaje:', error);
  }
}

async function sendTicketsReminder(phoneNumber, uid) {
  try {
    console.log(`🔍 Buscando datos para ${phoneNumber}${uid ? ` con UID: ${uid}` : ''}...`);

    const allTickets = [];
    let planName = '';
    let submissionId = uid || '';
    let nombre = '';

    if (uid) {
      const generalDocRef = doc(db, 'rifas/v2/general_registrations', `${uid}_general`);
      const premiumDocRef = doc(db, 'rifas/v2/premium_registrations', `${uid}_premium`);

      const [generalSnap, premiumSnap] = await Promise.all([
        getDoc(generalDocRef),
        getDoc(premiumDocRef)
      ]);

      if (!generalSnap.exists() && !premiumSnap.exists()) {
        console.log('⚠️ No se encontraron registros para UID:', uid);
        return;
      }

      if (generalSnap.exists()) {
        const data = generalSnap.data();
        nombre = data.owner_name;
        planName = data.plan_name || 'Plan General';
        
        if (data.general_raffle_tickets) {
          allTickets.push(...data.general_raffle_tickets.map(t => `general-${t.toString().padStart(4, '0')}`));
        }
      }

      if (premiumSnap.exists()) {
        const data = premiumSnap.data();
        if (!nombre) {
          nombre = data.owner_name;
        }
        planName = data.plan_name || planName;
        
        if (data.premium_raffle_tickets) {
          allTickets.push(...data.premium_raffle_tickets.map(t => `premium-${t.toString().padStart(4, '0')}`));
        }
      }
    } else {
      console.log('⚠️ No se proporcionó UID, búsqueda por teléfono no implementada');
      return;
    }

    console.log(`✅ Datos encontrados: ${nombre}, ${allTickets.length} tickets`);

    await sendRifaConfirmation({
      nombre,
      telefono: phoneNumber,
      plan: planName,
      ticketsPremium: allTickets.filter(t => t.startsWith('premium-')),
      ticketsGeneral: allTickets.filter(t => t.startsWith('general-'))
    });

    console.log(`✅ Mensaje enviado a ${phoneNumber}`);
  } catch (error) {
    console.error('❌ Error enviando recordatorio:', error);
  }
}

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ Webhook verificado');
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/FirebaseConfig';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { sendRifaConfirmation } from '@/lib/apis/WhatsAppService';

export async function POST(request) {
  try {
    const payload = await request.json();
    const signature = request.headers.get('x-webhook-signature');
    const event = request.headers.get('x-webhook-event');
    
    console.log('📨 Webhook recibido:', event);
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    
    if (process.env.WHATSAPP_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.WHATSAPP_WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        console.error('❌ Firma inválida');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

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
    const text = message.text?.body?.toLowerCase() || '';
    
    console.log(`📱 Mensaje de ${from}: ${text}`);

    if (text.includes('recuérdame') || text.includes('recuerdame') || text.includes('tickets')) {
      await sendTicketsReminder(from);
    }
  } catch (error) {
    console.error('❌ Error procesando mensaje:', error);
  }
}

async function sendTicketsReminder(phoneNumber) {
  try {
    console.log(`🔍 Buscando datos para ${phoneNumber}...`);

    const phoneFormatted = phoneNumber.replace(/\D/g, '');
    
    const generalQuery = query(
      collection(db, 'general_registrations'),
      where('phone1', '==', phoneFormatted),
      orderBy('created_at', 'desc'),
      limit(1)
    );
    
    const premiumQuery = query(
      collection(db, 'premium_registrations'),
      where('phone1', '==', phoneFormatted),
      orderBy('created_at', 'desc'),
      limit(1)
    );

    const [generalSnap, premiumSnap] = await Promise.all([
      getDocs(generalQuery),
      getDocs(premiumQuery)
    ]);

    if (generalSnap.empty && premiumSnap.empty) {
      console.log('⚠️ No se encontraron registros para', phoneNumber);
      return;
    }

    const allTickets = [];
    let planName = '';
    let submissionId = '';
    let nombre = '';

    if (!generalSnap.empty) {
      const doc = generalSnap.docs[0];
      const data = doc.data();
      submissionId = doc.id.split('_')[0];
      nombre = data.owner_name;
      planName = data.plan_name || 'Plan General';
      
      if (data.general_raffle_tickets) {
        allTickets.push(...data.general_raffle_tickets.map(t => `general-${t.toString().padStart(4, '0')}`));
      }
    }

    if (!premiumSnap.empty) {
      const doc = premiumSnap.docs[0];
      const data = doc.data();
      if (!submissionId) {
        submissionId = doc.id.split('_')[0];
        nombre = data.owner_name;
      }
      planName = data.plan_name || planName;
      
      if (data.premium_raffle_tickets) {
        allTickets.push(...data.premium_raffle_tickets.map(t => `premium-${t.toString().padStart(4, '0')}`));
      }
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

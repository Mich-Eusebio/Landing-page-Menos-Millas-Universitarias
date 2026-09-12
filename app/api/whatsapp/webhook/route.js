import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminDb } from '@/lib/firebaseAdmin';
import { sendRifaConfirmation, sendGenericText, sendLeadUpdateTemplate } from '@/lib/apis/WhatsAppService';

// Safety lock: while enabled, /broadcast only sends the template back to the
// configured admin number. Change this only after validating the Meta template.
const BROADCAST_TEST_MODE = true;
const BROADCAST_TEST_NAME = 'Michael Eusebio';

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
    const message = payload.message || payload.messages?.[0];
    if (!message) {
      console.log('⚠️ No hay mensaje en el payload');
      return;
    }

    const from = message.from;
    const text = message.text?.body || '';
    const textLower = text.toLowerCase();
    
    console.log(`📱 Mensaje de ${from}: ${text}`);

    // Check if message is from Admin (Michael)
    const cleanFrom = from.replace(/\D/g, '');
    const personalNumber = process.env.PERSONAL_NUMER || process.env.PERSONAL_NUMBER;
    const cleanAdmin = personalNumber ? personalNumber.replace(/\D/g, '') : '';
    const isFromAdmin = cleanAdmin && (cleanFrom === cleanAdmin || cleanFrom === `1${cleanAdmin}` || `1${cleanFrom}` === cleanAdmin);

    if (isFromAdmin && text.startsWith('/broadcast ')) {
      const broadcastText = text.substring(11).trim();
      await handleBroadcast(from, broadcastText);
      return;
    }

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
      const generalSnap = await adminDb.doc(`rifas/v2/general_registrations/${uid}_general`).get();

      if (!generalSnap.exists) {
        console.log('⚠️ No se encontraron registros para UID:', uid);
        await sendGenericText({
          telefono: phoneNumber,
          texto: 'Parece que tu ticket no apareció en la base de datos automáticamente.\nTranquilo/a, esto pasa a veces.\nYa pasamos tu caso a validación manual y recibirás la confirmación tan pronto la revisemos.\nGracias por tu apoyo y por confiar en el proyecto.'
        });
        return;
      }

      const data = generalSnap.data();
      nombre = data.owner_name;
      planName = data.plan_name || 'Plan General';
      
      if (data.general_raffle_tickets) {
        allTickets.push(...data.general_raffle_tickets.map(t => `general-${t.toString().padStart(4, '0')}`));
      }
    } else {
      console.log('⚠️ No se proporcionó UID, enviando mensaje de validación manual');
      await sendGenericText({
        telefono: phoneNumber,
        texto: 'Parece que tu ticket no apareció en la base de datos automáticamente.\nTranquilo/a, esto pasa a veces.\nYa pasamos tu caso a validación manual y recibirás la confirmación tan pronto la revisemos.\nGracias por tu apoyo y por confiar en el proyecto.'
      });
      return;
    }

    console.log(`✅ Datos encontrados: ${nombre}, ${allTickets.length} tickets`);

    await sendRifaConfirmation({
      nombre,
      telefono: phoneNumber,
      plan: planName,
      ticketsPremium: [],
      ticketsGeneral: allTickets,
      submissionId: uid ? `${uid}_general` : ''
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

async function handleBroadcast(adminPhone, rawBroadcastText) {
  try {
    const parts = rawBroadcastText.split('|');
    if (parts.length < 3) {
      await sendGenericText({
        telefono: adminPhone,
        texto: '❌ Formato inválido. Debe ser: /broadcast [acción] | [canal] | [descripción] | [slug opcional del botón]'
      });
      return;
    }

    const action = parts[0].trim();
    const channelCode = parts[1].trim();
    const description = parts[2].trim();
    const buttonParam = parts[3]?.trim() || channelCode;

    const channelNames = {
      ig: 'Instagram',
      yt: 'YouTube',
      lk: 'LinkedIn',
      gh: 'GitHub',
      '0': 'nuestra web'
    };
    const channelText = channelNames[channelCode.toLowerCase()] || channelCode;

    console.log(`📣 Iniciando difusión. Acción: "${action}", Canal: "${channelText}", Desc: "${description}", Botón Param: "${buttonParam}"`);

    const contacts = [];

    if (BROADCAST_TEST_MODE) {
      const personalNumber = process.env.PERSONAL_NUMER || process.env.PERSONAL_NUMBER;
      const testPhone = personalNumber?.replace(/\D/g, '');

      if (!testPhone) {
        throw new Error('Falta PERSONAL_NUMER o PERSONAL_NUMBER para ejecutar la prueba.');
      }

      contacts.push({ phone: testPhone, name: BROADCAST_TEST_NAME });
      console.log(`🧪 Modo prueba activo: la difusión solo se enviará a ${testPhone}.`);
    } else {
      const snapshot = await adminDb.collection('lead-capture').get();
      if (snapshot.empty) {
        await sendGenericText({
          telefono: adminPhone,
          texto: '⚠️ No hay contactos registrados en la colección lead-capture.'
        });
        return;
      }

      for (const doc of snapshot.docs) {
        const data = doc.data();
        contacts.push({ phone: data.phone, name: data.name || 'Aliado' });
      }
    }

    let successCount = 0;
    let failCount = 0;

    for (const contact of contacts) {
      const rawPhone = contact.phone;
      const nombre = contact.name;

      if (!rawPhone) continue;

      const cleanPhone = rawPhone.replace(/\D/g, '');

      const result = await sendLeadUpdateTemplate({
        telefono: cleanPhone,
        nombre,
        action,
        channel: channelText,
        description,
        buttonParam
      });

      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    await sendGenericText({
      telefono: adminPhone,
      texto: `${BROADCAST_TEST_MODE ? '🧪 Prueba' : '✅ Difusión'} completada.\nEnviados con éxito: ${successCount}\nFallidos: ${failCount}`
    });

  } catch (error) {
    console.error('❌ Error en handleBroadcast:', error);
    await sendGenericText({
      telefono: adminPhone,
      texto: `❌ Error al ejecutar la difusión: ${error.message}`
    });
  }
}

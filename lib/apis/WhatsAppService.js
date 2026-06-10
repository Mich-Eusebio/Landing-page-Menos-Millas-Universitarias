import { WhatsAppClient } from '@kapso/whatsapp-cloud-api';

function getClient() {
  return new WhatsAppClient({
    baseUrl: 'https://api.kapso.ai/meta/whatsapp',
    kapsoApiKey: process.env.MILLAS_MICHAEL_KAPSO_API_KEY
  });
}

function getPhoneNumberId() {
  return process.env.MILLAS_MICHAEL_WHATSAPP_PHONE_NUMBER_ID;
}

export async function sendRifaConfirmation({ nombre, telefono, plan, ticketsPremium, ticketsGeneral }) {
  const client = getClient();
  const PHONE_NUMBER_ID = getPhoneNumberId();
  
  const premiumText = ticketsPremium.length > 0 
    ? `🎁 Tickets Premium: ${ticketsPremium.map(t => t.replace('premium-', '')).join(', ')}\n` 
    : '';
  
  const generalText = ticketsGeneral.length > 0
    ? `🎫 Tickets General: ${ticketsGeneral.map(t => t.replace('general-', '')).join(', ')}`
    : '';

  const message = `¡Hola ${nombre}! Tu participación en Menos Millas Universitarias fue confirmada 🎉

📋 Plan: ${plan}

${premiumText}${generalText}

Te recordaremos antes del live del sorteo. ¡Gracias por apoyar! 🙏`;

  try {
    const response = await client.messages.sendText({
      phoneNumberId: PHONE_NUMBER_ID,
      to: telefono,
      body: message
    });
    
    return { success: true, messageId: response.messages?.[0]?.id };
  } catch (error) {
    console.error('Error enviando WhatsApp:', error);
    return { success: false, error: error.message };
  }
}

export async function sendGenericText({ telefono, texto }) {
  const client = getClient();
  const PHONE_NUMBER_ID = getPhoneNumberId();
  
  try {
    const response = await client.messages.sendText({
      phoneNumberId: PHONE_NUMBER_ID,
      to: telefono,
      body: texto
    });
    
    return { success: true, messageId: response.messages?.[0]?.id };
  } catch (error) {
    console.error('Error enviando texto genérico:', error);
    return { success: false, error: error.message };
  }
}

export async function sendTemplateMessage({ nombre, telefono, plan, ticketsPremium, ticketsGeneral }) {
  const client = getClient();
  const PHONE_NUMBER_ID = getPhoneNumberId();
  
  try {
    const response = await client.messages.sendTemplate({
      phoneNumberId: PHONE_NUMBER_ID,
      to: telefono,
      template: {
        name: 'rifa_confirmacion',
        language: { code: 'es' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', parameter_name: 'nombre', text: nombre },
              { type: 'text', parameter_name: 'plan', text: plan },
              { type: 'text', parameter_name: 'tickets', text: [...ticketsPremium, ...ticketsGeneral].map(t => t.split('-')[1]).join(', ') }
            ]
          }
        ]
      }
    });
    
    return { success: true, messageId: response.messages?.[0]?.id };
  } catch (error) {
    console.error('Error enviando template:', error);
    return { success: false, error: error.message };
  }
}

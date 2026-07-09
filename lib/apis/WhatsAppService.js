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

export async function sendRifaConfirmation({ nombre, telefono, plan, ticketsPremium = [], ticketsGeneral = [], submissionId }) {
  const client = getClient();
  const PHONE_NUMBER_ID = getPhoneNumberId();
  
  const allTickets = [...ticketsPremium, ...ticketsGeneral]
    .map(t => typeof t === 'string' ? t.replace(/^(general-|premium-)/, '') : t);
  const ticketsText = allTickets.join(', ') || 'Sin boletos';
  const referenceId = submissionId || `MMU-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  try {
    const response = await client.messages.sendTemplate({
      phoneNumberId: PHONE_NUMBER_ID,
      to: telefono,
      template: {
        name: 'order_confirmation',
        language: { code: 'en_US' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', parameter_name: 'nombre', text: nombre },
              { type: 'text', parameter_name: 'numeros', text: ticketsText },
              { type: 'text', parameter_name: 'nivel_inversion', text: plan },
              { type: 'text', parameter_name: 'uid', text: referenceId }
            ]
          }
        ]
      }
    });
    
    return { success: true, messageId: response.messages?.[0]?.id };
  } catch (error) {
    console.error('Error enviando WhatsApp (order_confirmation):', error);
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

export async function sendNewLeadNotification({ telefono, nombre }) {
  const client = getClient();
  const PHONE_NUMBER_ID = getPhoneNumberId();
  
  try {
    const response = await client.messages.sendTemplate({
      phoneNumberId: PHONE_NUMBER_ID,
      to: telefono,
      template: {
        name: 'new_lead_notification',
        language: { code: 'en_US' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', parameter_name: 'name', text: nombre }
            ]
          }
        ]
      }
    });
    
    return { success: true, messageId: response.messages?.[0]?.id };
  } catch (error) {
    console.error('Error enviando template de nuevo lead:', error);
    return { success: false, error: error.message };
  }
}

export async function sendLeadUpdateTemplate({ telefono, nombre, action, channel, description, buttonParam }) {
  const client = getClient();
  const PHONE_NUMBER_ID = getPhoneNumberId();
  
  try {
    const response = await client.messages.sendTemplate({
      phoneNumberId: PHONE_NUMBER_ID,
      to: telefono,
      template: {
        name: 'lead_update',
        language: { code: 'es' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', parameter_name: 'name', text: nombre },
              { type: 'text', parameter_name: 'action', text: action },
              { type: 'text', parameter_name: 'channel', text: channel },
              { type: 'text', parameter_name: 'description', text: description }
            ]
          },
          {
            type: 'button',
            index: '0',
            sub_type: 'url',
            parameters: [
              { type: 'text', text: buttonParam }
            ]
          }
        ]
      }
    });
    
    return { success: true, messageId: response.messages?.[0]?.id };
  } catch (error) {
    console.error('Error enviando plantilla lead_update:', error);
    return { success: false, error: error.message };
  }
}

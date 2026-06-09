const fs = require('fs');
const path = require('path');
const { WhatsAppClient } = require('@kapso/whatsapp-cloud-api');

// Leer .env.local manualmente
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

async function testWhatsApp() {
  console.log('🧪 Probando servicio de WhatsApp...\n');

  // Verificar variables de entorno
  if (!process.env.MILLAS_MICHAEL_KAPSO_API_KEY) {
    console.error('❌ Falta MILLAS_MICHAEL_KAPSO_API_KEY en .env.local');
    return;
  }

  if (!process.env.MILLAS_MICHAEL_WHATSAPP_PHONE_NUMBER_ID) {
    console.error('❌ Falta MILLAS_MICHAEL_WHATSAPP_PHONE_NUMBER_ID en .env.local');
    return;
  }

  console.log('✓ Variables de entorno cargadas');
  console.log(`  API Key: ${process.env.MILLAS_MICHAEL_KAPSO_API_KEY.substring(0, 10)}...`);
  console.log(`  Phone Number ID: ${process.env.MILLAS_MICHAEL_WHATSAPP_PHONE_NUMBER_ID}\n`);

  const client = new WhatsAppClient({
    baseUrl: 'https://api.kapso.ai/meta/whatsapp',
    kapsoApiKey: process.env.MILLAS_MICHAEL_KAPSO_API_KEY
  });

  const PHONE_NUMBER_ID = process.env.MILLAS_MICHAEL_WHATSAPP_PHONE_NUMBER_ID;
  
  // Número de prueba (cámbialo por tu número real)
  const TEST_PHONE = '18095705985'; // Tu número

  console.log(`📤 Enviando mensaje de prueba a ${TEST_PHONE}...\n`);

  try {
    const response = await client.messages.sendText({
      phoneNumberId: PHONE_NUMBER_ID,
      to: TEST_PHONE,
      body: '🧪 ¡Prueba exitosa! El servicio de WhatsApp de Menos Millas está funcionando correctamente.'
    });

    console.log('✅ Mensaje enviado exitosamente!');
    console.log('Response:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('❌ Error al enviar mensaje:');
    console.error('Message:', error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testWhatsApp();

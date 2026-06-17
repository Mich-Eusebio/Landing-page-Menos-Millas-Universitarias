import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Configurar __dirname en formato ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno del archivo .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✓ Variables de entorno cargadas desde .env.local');
} else {
  console.error('❌ Error: No se encontró el archivo .env.local. Por favor ejecuta vercel env pull primero.');
  process.exit(1);
}

// Verificar credenciales necesarias de Firebase Admin
if (!process.env.project_id || !process.env.client_email || !process.env.FIREBASE_PRIVATE_KEY) {
  console.error('❌ Error: Faltan las credenciales de Firebase Admin (project_id, client_email o FIREBASE_PRIVATE_KEY) en las variables de entorno.');
  process.exit(1);
}

// Inicializar Firebase Admin SDK
const app = getApps().length === 0
  ? initializeApp({
      credential: cert({
        projectId: process.env.project_id,
        clientEmail: process.env.client_email,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    })
  : getApps()[0];

const adminDb = getFirestore(app);
console.log('✓ Conexión con Firestore (Admin) inicializada correctamente.');

async function run() {
  try {
    // IMPORTACIÓN DINÁMICA: Importar el generador de assets DESPUÉS de haber configurado dotenv
    // Esto es crítico para que Cloudinary lea las variables de entorno antes de inicializarse.
    console.log('📦 Cargando módulo de generación de assets...');
    const { generateSocialPost } = await import('../lib/generate-asset.js');
    console.log('✓ Módulo de generación cargado.');

    console.log('🔍 Obteniendo documentos de la colección "sold-days"...');
    const querySnapshot = await adminDb.collection('sold-days').get();
    console.log(`✓ Encontrados ${querySnapshot.size} días patrocinados.`);

    const outputDir = path.join(__dirname, '..', 'app', 'gracias', 'production-assets');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`✓ Creada carpeta de salida: ${outputDir}`);
    }

    for (const docSnapshot of querySnapshot.docs) {
      const dateStr = docSnapshot.id; // Formato esperado: "YYYY-MM-DD"
      const dayParts = dateStr.split('-');
      const dayNum = dayParts.length === 3 ? parseInt(dayParts[2], 10) : parseInt(dateStr, 10);

      if (isNaN(dayNum)) {
        console.log(`⚠️ Saltando documento con ID inválido: ${dateStr}`);
        continue;
      }

      const data = docSnapshot.data();
      const sponsorsToProcess = [];

      // Soporte para días divididos en turnos (morning / afternoon)
      if (data.morning) {
        sponsorsToProcess.push({
          slot: 'morning',
          nombre: data.morning.nombre,
          foto_url: data.morning.foto_url
        });
      }
      if (data.afternoon) {
        sponsorsToProcess.push({
          slot: 'afternoon',
          nombre: data.afternoon.nombre,
          foto_url: data.afternoon.foto_url
        });
      }

      // Soporte para día completo (diseño normal)
      if (sponsorsToProcess.length === 0) {
        sponsorsToProcess.push({
          slot: 'full',
          nombre: data.nombre || 'Sponsor',
          foto_url: data.foto_url || ''
        });
      }

      for (const sponsor of sponsorsToProcess) {
        // Filtrar y omitir aquellos que no tengan una foto_url válida
        if (!sponsor.foto_url || sponsor.foto_url === '' || sponsor.foto_url === 'null' || sponsor.foto_url === 'undefined') {
          console.log(`  ℹ️ Saltando Día ${dayNum} (${sponsor.slot}) - no tiene foto_url.`);
          continue;
        }

        let fileName = `dia_${dayNum}.png`;
        if (sponsor.slot !== 'full') {
          fileName = `dia_${dayNum}_${sponsor.slot}.png`;
        }

        const outputPath = path.join(outputDir, fileName);
        console.log(`🎨 Generando asset: Día ${dayNum} (${sponsor.slot}) -> ${fileName}...`);

        try {
          const buffer = await generateSocialPost({
            day: String(dayNum),
            sponsorPhotoUrl: sponsor.foto_url
          });

          fs.writeFileSync(outputPath, buffer);
          console.log(`  ✅ Guardado: ${fileName}`);
        } catch (err) {
          console.error(`  ❌ Error al generar el asset del día ${dayNum}:`, err.message);
        }
      }
    }

    console.log('\n🎉 ¡Proceso finalizado con éxito! Todos los assets generados se encuentran en: app/gracias/production-assets/');
  } catch (error) {
    console.error('🔥 Error crítico durante la ejecución:', error);
  }
}

run();

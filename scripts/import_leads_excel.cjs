const dotenv = require('dotenv');
const path = require('path');
const XLSX = require('xlsx');
const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
dotenv.config({ path: envPath });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function normalizePhone(rawPhone) {
  if (!rawPhone) return null;
  
  // Clean all non-digit characters
  const cleaned = rawPhone.toString().replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    // Standard Dominican Republic / US number (e.g. 8298059554)
    return `+1 ${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // Number already has country code 1 (e.g. 18298059554)
    return `+1 ${cleaned.substring(1)}`;
  } else if (cleaned.length > 10) {
    // Other international formats, prepend +
    return `+${cleaned}`;
  }
  
  return null;
}

async function runMigration() {
  try {
    console.log('--- Iniciando Migración de Leads ---');

    // 1. Initialize Firebase Client
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log('Iniciando sesión anónima en Firebase...');
    await signInAnonymously(auth);
    console.log('Autenticación completada.');

    // 2. Read Excel File
    const xlsxPath = path.resolve(__dirname, '../old_raffle_data/general_registrations_backup.xlsx');
    console.log('Leyendo archivo Excel:', xlsxPath);
    const workbook = XLSX.readFile(xlsxPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Parse as JSON objects with headers
    const rows = XLSX.utils.sheet_to_json(worksheet);
    console.log(`Se encontraron ${rows.length} filas en el Excel.`);

    // 3. Extract and filter valid leads
    const leadsToImport = [];
    const seenPhones = new Set();

    for (const row of rows) {
      const name = row['owner_name'] ? row['owner_name'].toString().trim() : '';
      const rawPhone = row['phone1'] ? row['phone1'].toString().trim() : '';
      
      if (!name || !rawPhone || rawPhone.toLowerCase() === 'none') {
        continue;
      }

      const formattedPhone = normalizePhone(rawPhone);
      if (!formattedPhone) {
        continue;
      }

      // De-duplicate based on formatted phone number to avoid importing duplicates
      if (seenPhones.has(formattedPhone)) {
        continue;
      }

      seenPhones.add(formattedPhone);
      leadsToImport.push({
        name,
        phone: formattedPhone,
        createdAt: new Date().toISOString()
      });
    }

    console.log(`Leads válidos y depurados a importar: ${leadsToImport.length}`);

    // 4. Import to Firestore collection 'lead-capture'
    const leadsCollection = collection(db, 'lead-capture');
    let count = 0;

    // Process in batches of 20 parallel requests to be fast but respect rate-limits
    const batchSize = 20;
    for (let i = 0; i < leadsToImport.length; i += batchSize) {
      const batch = leadsToImport.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (lead) => {
          try {
            await addDoc(leadsCollection, lead);
            count++;
          } catch (err) {
            console.error(`❌ Error al importar a ${lead.name} (${lead.phone}):`, err.message);
          }
        })
      );
      console.log(`Progreso: ${count} / ${leadsToImport.length} importados...`);
    }

    console.log(`\n🎉 Migración finalizada con éxito. Total importados: ${count}`);

  } catch (error) {
    console.error('🔥 Error crítico durante la migración:', error);
  }
}

runMigration();

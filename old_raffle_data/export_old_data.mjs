import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuración de rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Importación dinámica de Firebase
import { signInAnonymously } from 'firebase/auth';
const firebaseModule = await import('../lib/FirebaseConfig.js'); 
const { db, auth } = firebaseModule; 
const { collection, getDocs } = await import('firebase/firestore');
const XLSX = await import('xlsx');

async function exportCollection(collectionName, outputFilename) {
    try {
        await signInAnonymously(auth);
        console.log(`\n📊 Conectando a Firestore...`);
        console.log(`📂 Leyendo colección: ${collectionName}`);
        
        const querySnapshot = await getDocs(collection(db, collectionName));
        
        if (querySnapshot.empty) {
            console.log(`⚠️  La colección ${collectionName} está vacía`);
            return;
        }
        
        const data = [];
        querySnapshot.forEach((doc) => {
            const docData = doc.data();
            
            // Convertir timestamps a strings legibles
            const processedData = {
                doc_id: doc.id,
                ...docData
            };
            
            // Manejar timestamps de Firestore
            if (docData.created_at?.toDate) {
                processedData.created_at = docData.created_at.toDate().toISOString();
            }
            if (docData.timestamp?.toDate) {
                processedData.timestamp = docData.timestamp.toDate().toISOString();
            }
            
            // Convertir arrays a strings
            if (Array.isArray(docData.general_raffle_tickets)) {
                processedData.general_raffle_tickets = docData.general_raffle_tickets.join(', ');
            }
            if (Array.isArray(docData.premium_raffle_tickets)) {
                processedData.premium_raffle_tickets = docData.premium_raffle_tickets.join(', ');
            }
            
            data.push(processedData);
        });
        
        console.log(`✅ ${data.length} documentos encontrados`);
        
        // Crear archivo Excel
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, collectionName);
        
        const outputPath = path.join(__dirname, outputFilename);
        XLSX.writeFile(workbook, outputPath);
        
        console.log(`💾 Archivo guardado: ${outputPath}`);
        
    } catch (error) {
        console.error(`❌ Error exportando ${collectionName}:`, error);
    }
}

async function main() {
  console.log('🚀 Iniciando exportación de datos antiguos...\n');
  
  // Exportar general_registrations
  await exportCollection('rifa2/main/general_registrations', 'general_registrations_backup.xlsx');
  
  // Exportar premium_registrations
  await exportCollection('rifa2/main/premium_registrations', 'premium_registrations_backup.xlsx');
  
  console.log('\n✨ Exportación completada');
}

main();

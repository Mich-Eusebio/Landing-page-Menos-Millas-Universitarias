import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Configuración de rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Cargar variables de entorno PRIMERO
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

// 3. Verificación inmediata
console.log("Verificando API KEY antes de cargar Firebase:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

// importación DINÁMICA 
// Usamos 'await import' para que no se ejecute hasta que lo anterior esté listo
import { signInAnonymously } from 'firebase/auth';

// Nota: Importamos el módulo completo y desestructuramos sus exportaciones
const firebaseModule = await import('../../lib/FirebaseConfig.js'); 
const { db, auth } = firebaseModule; 
const { collection, getDocs } = await import('firebase/firestore');
const XLSX = await import('xlsx');


async function exportData() {
    try {
        await signInAnonymously(auth);
        console.log("Conectando a Firestore...");
        const querySnapshot = await getDocs(collection(db, 'rifas/v2/general_registrations'));

        // Aquí pones toda tu lógica de agrupación (owner_name.toLowerCase(), etc.)
        const aggregation = {};
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const nameKey = data.owner_name ? String(data.owner_name).trim().toLowerCase() : data.owner_name;
            
            if (aggregation[nameKey]) {
                aggregation[nameKey].cantidad += 1;
            } else {
                aggregation[nameKey] = { owner_name: nameKey, cantidad: 1 };
            }
        });

        const finalData = Object.values(aggregation);
        const worksheet = XLSX.utils.json_to_sheet(finalData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Resumen');
        XLSX.writeFile(workbook, 'low_tickets.xlsx');

        console.log("✅ ¡Éxito! Archivo generado.");
    } catch (error) {
        console.error("Error en la ejecución:", error);
    }
}

exportData();

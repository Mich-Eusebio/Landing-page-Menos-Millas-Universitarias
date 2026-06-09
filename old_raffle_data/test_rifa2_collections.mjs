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
const { collection, doc, setDoc, getDoc, deleteDoc } = await import('firebase/firestore');

// ID único para las pruebas
const testId = `test-${Date.now()}`;

async function testCollection(collectionPath, testDocId, testData) {
  console.log(`\n📝 Probando: ${collectionPath}`);
  
  try {
    // 1. Escribir documento
    console.log(`   ✍️  Escribiendo documento...`);
    const docRef = doc(db, collectionPath, testDocId);
    await setDoc(docRef, testData);
    console.log(`   ✅ Documento escrito exitosamente`);
    
    // 2. Leer documento
    console.log(`   👀 Leyendo documento...`);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log(`   ❌ ERROR: No se pudo leer el documento`);
      return false;
    }
    
    const readData = docSnap.data();
    console.log(`   ✅ Documento leído exitosamente`);
    
    // 3. Validar datos
    console.log(`   🔍 Validando datos...`);
    let valid = true;
    for (const [key, value] of Object.entries(testData)) {
      if (JSON.stringify(readData[key]) !== JSON.stringify(value)) {
        console.log(`   ❌ Mismatch en campo "${key}": esperado ${JSON.stringify(value)}, obtenido ${JSON.stringify(readData[key])}`);
        valid = false;
      }
    }
    
    if (valid) {
      console.log(`   ✅ Todos los datos coinciden`);
    }
    
    // 4. Limpiar documento de prueba
    console.log(`   🗑️  Eliminando documento de prueba...`);
    await deleteDoc(docRef);
    console.log(`   ✅ Documento eliminado`);
    
    return valid;
    
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando pruebas de lectura/escritura en colecciones rifa2/\n');
  console.log(`📋 ID de prueba: ${testId}`);
  
  try {
    // Autenticarse
    console.log('\n🔐 Autenticando con Firebase...');
    await signInAnonymously(auth);
    console.log('✅ Autenticación exitosa');
    
    // Crear documento padre "rifas/v2" si no existe
    console.log('\n📁 Verificando/creando documento padre "rifas/v2"...');
    const rifasV2Ref = doc(db, 'rifas', 'v2');
    const rifasV2Snap = await getDoc(rifasV2Ref);
    
    if (!rifasV2Snap.exists()) {
      await setDoc(rifasV2Ref, {
        name: 'Rifa v2',
        created_at: new Date().toISOString(),
        description: 'Segunda rifa - Menos Millas Universitarias'
      });
      console.log('✅ Documento "rifas/v2" creado');
    } else {
      console.log('✅ Documento "rifas/v2" ya existe');
    }
    
    const results = [];
    
    // Test 1: rifas/v2/tickets_sold_general
    results.push(await testCollection(
      'rifas/v2/tickets_sold_general',
      `general-${testId}`,
      {
        status: 'test',
        reservedBy: 'Test User',
        uid: testId,
        timestamp: new Date().toISOString()
      }
    ));
    
    // Test 2: rifas/v2/tickets_sold_premium
    results.push(await testCollection(
      'rifas/v2/tickets_sold_premium',
      `premium-${testId}`,
      {
        status: 'test',
        reservedBy: 'Test User',
        uid: testId,
        timestamp: new Date().toISOString()
      }
    ));
    
    // Test 3: rifas/v2/general_registrations
    results.push(await testCollection(
      'rifas/v2/general_registrations',
      `${testId}_general`,
      {
        owner_name: 'Test User',
        phone1: '18091234567',
        email: 'test@example.com',
        plan_name: 'Test Plan',
        plan_amount: 1000,
        submission_id: `${testId}_general`,
        created_at: new Date().toISOString(),
        uid: testId
      }
    ));
    
    // Test 4: rifas/v2/premium_registrations
    results.push(await testCollection(
      'rifas/v2/premium_registrations',
      `${testId}_premium`,
      {
        owner_name: 'Test User',
        phone1: '18091234567',
        email: 'test@example.com',
        plan_name: 'Test Plan',
        plan_amount: 1000,
        submission_id: `${testId}_premium`,
        created_at: new Date().toISOString(),
        uid: testId
      }
    ));
    
    // Resumen
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DE PRUEBAS');
    console.log('='.repeat(50));
    console.log(`✅ Colecciones exitosas: ${results.filter(r => r).length}/${results.length}`);
    
    if (results.every(r => r)) {
      console.log('\n🎉 ¡Todas las pruebas pasaron! Las colecciones están funcionando correctamente.');
    } else {
      console.log('\n⚠️  Algunas pruebas fallaron. Revisa los errores arriba.');
    }
    
  } catch (error) {
    console.error('\n❌ Error general:', error.message);
  }
}

main();

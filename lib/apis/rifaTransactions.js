import { doc } from 'firebase/firestore';
const { default: FirebaseVars } = await import("../FirebaseConfig.js");
const { db } = FirebaseVars;

/**
 * Valida disponibilidad y reserva tickets dentro de una transacción
 * @param {Object} transaction - La transacción de Firestore
 * @param {Array} tickets - Array de IDs de tickets (ej: ['general-0001', 'general-0002'])
 * @param {string} collectionName - Nombre de la colección ('tickets_sold_general' o 'tickets_sold_premium')
 * @param {string} reservedBy - Nombre de quien reserva
 */
export async function validateAndReserveTickets(transaction, tickets, collectionName, reservedBy) {
  // Validar disponibilidad
  for (const tid of tickets) {
    const tSnap = await transaction.get(doc(db, collectionName, tid));
    if (tSnap.exists() && (tSnap.data().status === 'sold' || tSnap.data().status === 'reserved')) {
      throw new Error(`El ticket ${tid} ya no está disponible.`);
    }
  }
  
  // Marcar como reserved
  tickets.forEach((tid) => {
    transaction.set(doc(db, collectionName, tid), { 
      status: 'reserved', 
      reservedBy, 
      timestamp: Date.now() 
    });
  });
}

/**
 * Guarda el registro de un participante dentro de una transacción
 * @param {Object} transaction - La transacción de Firestore
 * @param {string} firestorePath - Path de la colección ('general_registrations' o 'premium_registrations')
 * @param {Object} payload - Datos del participante
 */
export async function saveParticipant(transaction, firestorePath, payload) {
  const docRef = doc(db, firestorePath, payload.submission_id);
  transaction.set(docRef, payload);
  return { success: true, id: docRef.id };
}

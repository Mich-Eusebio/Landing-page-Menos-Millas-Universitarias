import { doc } from 'firebase/firestore';
const { default: FirebaseVars } = await import("../FirebaseConfig.js");
const { db } = FirebaseVars;

/**
 * Formatea la fecha actual como yyyy-MM-dd-HH:mm
 */
function formatTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}-${hours}:${minutes}`;
}

/**
 * Valida disponibilidad y reserva tickets dentro de una transacción
 * @param {Object} transaction - La transacción de Firestore
 * @param {Array} tickets - Array de IDs de tickets (ej: ['general-0001', 'general-0002'])
 * @param {string} collectionName - Nombre de la colección ('rifa2/tickets_sold_general' o 'rifa2/tickets_sold_premium')
 * @param {string} reservedBy - Nombre de quien reserva
 * @param {string} uid - UID único de la transacción
 */
export async function validateAndReserveTickets(transaction, tickets, collectionName, reservedBy, uid) {
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
      uid,
      timestamp: formatTimestamp()
    });
  });
}

/**
 * Guarda el registro de un participante dentro de una transacción
 * @param {Object} transaction - La transacción de Firestore
 * @param {string} firestorePath - Path de la colección ('rifa2/general_registrations' o 'rifa2/premium_registrations')
 * @param {Object} payload - Datos del participante
 */
export async function saveParticipant(transaction, firestorePath, payload) {
  const docRef = doc(db, firestorePath, payload.submission_id);
  transaction.set(docRef, payload);
  return { success: true, id: docRef.id };
}

'use server'
import { randomInt } from 'crypto'; 
import { collection, query, where, limit, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth'; 
const { default: FirebaseVars } = await import("../FirebaseConfig.js");
const { db, appId, auth } = FirebaseVars;

/**
 * Función para traer los boletos vendidos de Firebase
 */
export async function getTicketsFrom(collectionName) {
    await signInAnonymously(auth);
    const ticketsRef = collection(db, collectionName);
    const snapshot = await getDocs(ticketsRef);
    
    if (snapshot.empty) return [];

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

/**
 * Lógica matemática del sorteo
 */
export async function elegirGanador(tickets, nombreSorteo) {
    console.log("Cantidad de tickets recibidos:", tickets?.length);
    if (tickets.length === 0) return null;

    const indiceGanador = randomInt(0, tickets.length); 
    const ganador = tickets[indiceGanador];
    console.log("✅ Ganador seleccionado (raw):", ganador);
    
    return ganador;
}

/**
 * Busca los datos del dueño del ticket ganador
 */
export async function expandirDatosGanador(ganador, coleccionRegistros) {
    console.log("Objeto ganador recibido:", ganador);
    try {
        await signInAnonymously(auth);

        // Extraer número (ej: de "general-0413" a 413)
        const numeroTicket = parseInt(ganador.id.split('-')[1]);
        
        const campoBusqueda = coleccionRegistros === 'general_registrations' 
            ? 'general_raffle_tickets' 
            : 'premium_raffle_tickets';

        const q = query(
            collection(db, coleccionRegistros),
            where(campoBusqueda, "array-contains", numeroTicket),
            limit(1)
        );

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;
        console.log("imprimiendo el response del query");
        const data = querySnapshot.docs[0].data();
        console.log(data);
        return {
            ...data,
            timestamp: data.timestamp?.toMillis?.() || data.timestamp || null,
            created_at: data.created_at?.toDate().toISOString() || null,
        };
        
    } catch (error) {
        console.error("🔥 Error en expandirDatosGanador:", error);
        return null;
    }
}

/**
 * Acción principal que llamarás desde el botón del frontend
 */
export async function realizarSorteoCompleto() {
    const resultados = { general: null, premium: null };

    // Sorteo General
    const ticketsG = await getTicketsFrom('tickets_sold_general');
    const ganadorG = elegirGanador(ticketsG, "General");
    if (ganadorG) {
        resultados.general = await expandirDatosGanador(ganadorG, 'general_registrations');
        resultados.general.ticketId = ganadorG.id; // Para mostrar el número ganado
    }

    // Sorteo Premium
    const ticketsP = await getTicketsFrom('tickets_sold_premium');
    const ganadorP = elegirGanador(ticketsP, "Premium");
    if (ganadorP) {
        resultados.premium = await expandirDatosGanador(ganadorP, 'premium_registrations');
        resultados.premium.ticketId = ganadorP.id;
    }

    return resultados;
}

/**
 * Guarda un documento en la colección de winners.
 * @param {Object} payload - El objeto completo con todos los datos a guardar.
 */
export async function saveWinner(payload) {
    try {
        // Importante: Asegúrate de que 'db' esté correctamente inicializado aquí
        const winnersRef = collection(db, 'artifacts', appId, 'public', 'data', 'winners');
        
        const docRef = await addDoc(winnersRef, payload);
        
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("🔥 Error al guardar el payload en winners:", error);
        throw error;
    }
}

export async function eliminarTicketGanador(ticketId, coleccion) {
    const ticketRef = doc(db, coleccion, ticketId);
    await deleteDoc(ticketRef);
}

/**
 * Trae los nombres y motivos de apoyo de los registros generales
 */
export async function getSupporters() {
    try {
        await signInAnonymously(auth);
        const registrationsRef = collection(db, 'general_registrations');
        const snapshot = await getDocs(registrationsRef);
        
        if (snapshot.empty) return [];

        const blockedNames = ["Verkis Montero"];

        return snapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    owner_name: data.owner_name?.trim(),
                    support_reason: data.support_reason?.trim()
                };
            })
            .filter(item => {
                if (!item.support_reason || item.support_reason === "" || item.support_reason === " ") return false;
                if (blockedNames.includes(item.owner_name)) return false;
                const reasonLower = item.support_reason.toLowerCase();
                if (reasonLower.includes("@gmail.com") || reasonLower.includes("@")) return false; // Bloquear cualquier correo
                return true;
            });
    } catch (error) {
        console.error("🔥 Error en getSupporters:", error);
        return [];
    }
}

/**
 * Retorna el progreso actual de la campaña
 * Basado en 14,000 recaudados de 80,000 meta total (17.5% total)
 */
export async function getCampaignProgress() {
    // Por ahora hardcoded para configurar Firestore luego
    return {
        totalPercentage: 17.5, // 17.5% del total de 4 años (14/80 = 0.175)
        currentYearLabel: "Freshman",
        currentYearProgress: 70, // 70% del primer año
        totalRaised: 14000,
        totalGoal: 80000
    };
}

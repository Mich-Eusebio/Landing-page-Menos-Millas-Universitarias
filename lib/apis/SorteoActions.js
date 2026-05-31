'use server'
import { randomInt } from 'crypto';
import { collection, query, where, limit, getDocs, addDoc, deleteDoc, doc, getDoc, setDoc, writeBatch } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
const { default: FirebaseVars } = await import("../FirebaseConfig.js");
const { db, appId, auth, storage } = FirebaseVars;

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

/**
 * Guarda el formulario de "Cómprame un día"
 */
export async function saveComprameUnDia(payload) {
    try {
        await signInAnonymously(auth);
        const ref = collection(db, 'comprame-un-dia');
        const docRef = await addDoc(ref, {
            ...payload,
            createdAt: new Date().toISOString()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("🔥 Error al guardar comprame un dia:", error);
        throw error;
    }
}

/**
 * Obtiene los días vendidos de la subcolección comprame-un-dia/sold-days/
 * Retorna un array de objetos { dateStr, nombre, foto_url, plan_seleccionado }
 */
export async function getSoldDays() {
    try {
        await signInAnonymously(auth);
        const soldDaysRef = collection(db, 'sold-days');
        const snapshot = await getDocs(soldDaysRef);

        if (snapshot.empty) return [];

        return snapshot.docs.map(document => ({
            dateStr: document.id,
            nombre: document.data().nombre || document.data().sponsor_name || null,
            foto_url: document.data().foto_url || document.data().sponsor_photo_url || null,
            plan_seleccionado: document.data().plan_seleccionado || null,
        }));
    } catch (error) {
        console.error('🔥 Error al obtener sold-days:', error);
        return [];
    }
}

/**
 * Marca los días seleccionados como vendidos en la colección pública `sold-days`.
 * Usa setDoc con el dateStr como ID para que sea idempotente.
 * @param {Object} payload       - Datos del patrocinio
 */
export async function saveSoldDays(params) {
    try {
        await signInAnonymously(auth);
        const batch = writeBatch(db);

        const rawDates = params.dates || params.selections;
        const nombre = params.nombre || params.sponsor_name;
        const foto_url = params.foto_url || params.sponsor_photo_url;
        const message = params.message || params.custom_message;
        const link = params.link;
        const is_anonymous = params.is_anonymous;
        const tooltip_message = params.tooltip_message;
        const phone = params.phone;
        const email = params.email;
        const instagram = params.instagram;
        const uid = params.uid;
        const plan = params.plan;

        rawDates.forEach(item => {
            const dateKey = typeof item === 'object' ? item.dateStr : item;
            const docRef = doc(db, 'sold-days', dateKey);
            batch.set(docRef, {
                nombre: is_anonymous ? "Anonymous" : (nombre || "Sponsor"),
                foto_url: is_anonymous ? null : (foto_url || null),
                message: message || null,
                link: link || null,
                is_anonymous: !!is_anonymous,
                tooltip_message: tooltip_message || null,
                phone: phone || null,
                email: email || null,
                instagram: instagram || null,
                uid: uid || null,
                plan_seleccionado: plan || 'dia seleccionado',
                createdAt: new Date().toISOString()
            });
        });

        await batch.commit();
        return { success: true };
    } catch (error) {
        console.error('🔥 Error al guardar sold-days:', error);
        throw error;
    }
}

/**
 * Sube un archivo a Firebase Storage y retorna la URL
 */
export async function uploadFile(formData) {
  try {
    const file = formData.get('file');
    const path = formData.get('path');

    if (!file || !path) {
      throw new Error("File or path missing");
    }

    // Aseguramos auth antes de subir
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }

    const storageRef = ref(storage, path);
    
    // Subimos el archivo directamente (más rápido y menos memoria)
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
    });

    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error("🔥 Error al subir archivo:", error);
    throw error;
  }
}

/**
 * Guarda una suscripción al newsletter "En Primera Fila"
 */
export async function saveNewsletterSubscription(payload) {
    try {
        const { email, monthsSubscribed, name, comprobante_url, founder_photo_url } = payload;
        
        if (!email || !email.includes('@')) {
            throw new Error("Email inválido");
        }

        await signInAnonymously(auth);
        
        const now = new Date();
        // Format YYYY-MM-DD HH:mm
        const joinedOn = now.toISOString().split('T')[0] + ' ' + now.toTimeString().split(' ')[0].substring(0, 5);
        
        // Calculate expiration
        const expirationDate = new Date(now);
        expirationDate.setMonth(expirationDate.getMonth() + parseInt(monthsSubscribed));
        const expiredAt = expirationDate.toISOString().split('T')[0] + ' ' + expirationDate.toTimeString().split(' ')[0].substring(0, 5);

        const subscriptionData = {
            name,
            email,
            monthsSubscribed: parseInt(monthsSubscribed),
            joined_on: joinedOn,
            expired_at: expiredAt,
            status: "pending_verification",
            comprobante_url: comprobante_url || null,
            founder_photo_url: founder_photo_url || null,
            total_price: parseInt(monthsSubscribed) * 2000
        };

        const docRef = doc(db, 'en-primera-fila', email);
        await setDoc(docRef, subscriptionData);
        
        return { success: true };
    } catch (error) {
        console.error("🔥 Error al guardar suscripción newsletter:", error);
        throw error;
    }
}

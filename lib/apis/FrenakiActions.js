'use server'
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
const { default: FirebaseVars } = await import("../FirebaseConfig.js");
const { db, auth, storage } = FirebaseVars;

/**
 * Genera un UID corto de 7 caracteres (alfanumérico)
 */
function generateShortUID(length = 7) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Sube el comprobante de Frenaki a Storage
 * Ruta: /frenaki/usuarios/<filename>
 * @param {FormData} formData - contiene "file" (File) y opcionalmente "userId" (string)
 * @returns {string} URL pública del archivo
 */
export async function uploadFrenakiComprobante(formData) {
  try {
    const file = formData.get('file');
    const userId = formData.get('userId') || generateShortUID();

    if (!file) throw new Error('No se encontró el archivo.');

    if (!auth.currentUser) await signInAnonymously(auth);

    const ext = file.name.split('.').pop();
    const storagePath = `frenaki/usuarios/${userId}_comprobante.${ext}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file, { contentType: file.type });
    const downloadURL = await getDownloadURL(snapshot.ref);

    return { success: true, url: downloadURL, userId };
  } catch (error) {
    console.error('🔥 Error al subir comprobante Frenaki:', error);
    throw error;
  }
}

/**
 * Guarda el registro de un usuario en Firestore
 * Colección: frenaki-app/usuarios/<uid>
 * @param {{ userId: string, nombre: string, correo: string, celular: string, comprobante_url: string }} payload
 */
export async function saveFrenakiUsuario(payload) {
  try {
    const { userId, nombre, correo, celular, comprobante_url } = payload;

    if (!userId || !nombre || !correo) {
      throw new Error('Faltan campos requeridos.');
    }

    if (!auth.currentUser) await signInAnonymously(auth);

    const docRef = doc(db, 'frenaki-app', 'usuarios', userId);
    await setDoc(docRef, {
      nombre: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      celular: celular?.trim() || null,
      comprobante_url: comprobante_url || null,
      status: 'pending_verification',
      createdAt: new Date().toISOString(),
    });

    return { success: true, id: userId };
  } catch (error) {
    console.error('🔥 Error al guardar usuario Frenaki:', error);
    throw error;
  }
}

/**
 * Sube el comprobante de negocio Frenaki a Storage
 * Ruta: /frenaki/businesses/<filename>
 */
export async function uploadFrenakiBusinessComprobante(formData) {
  try {
    const file = formData.get('file');
    const businessId = formData.get('businessId') || generateShortUID();

    if (!file) throw new Error('No se encontró el archivo.');
    if (!auth.currentUser) await signInAnonymously(auth);

    const ext = file.name.split('.').pop();
    const storagePath = `frenaki/businesses/${businessId}_comprobante.${ext}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file, { contentType: file.type });
    const downloadURL = await getDownloadURL(snapshot.ref);

    return { success: true, url: downloadURL, businessId };
  } catch (error) {
    console.error('🔥 Error al subir comprobante negocio Frenaki:', error);
    throw error;
  }
}

/**
 * Guarda el registro de un negocio en Firestore
 * Colección: frenaki-app/businesses/<uid>
 */
export async function saveFrenakiBusiness(payload) {
  try {
    const { businessId, ownerName, correo, celular, businessName, addressUrl, comprobante_url } = payload;

    if (!businessId || !ownerName || !businessName) {
      throw new Error('Faltan campos requeridos.');
    }

    if (!auth.currentUser) await signInAnonymously(auth);

    const docRef = doc(db, 'frenaki-app', 'businesses', businessId);
    await setDoc(docRef, {
      ownerName: ownerName.trim(),
      correo: correo.trim().toLowerCase(),
      celular: celular?.trim() || null,
      businessName: businessName.trim(),
      addressUrl: addressUrl.trim(),
      comprobante_url: comprobante_url || null,
      status: 'pending_verification',
      createdAt: new Date().toISOString(),
    });

    return { success: true, id: businessId };
  } catch (error) {
    console.error('🔥 Error al guardar negocio Frenaki:', error);
    throw error;
  }
}

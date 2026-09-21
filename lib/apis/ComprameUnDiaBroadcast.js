'use server'

import { after } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';
import { sendLeadUpdateTemplate } from '@/lib/apis/WhatsAppService';
import { calculateCampaignProgress } from '@/lib/campaignProgress';

const BUTTON_PARAM = '0';
const SEND_CONCURRENCY = 5;
const BROADCAST_COLLECTION = 'whatsapp-broadcasts';

function firstName(value) {
  const name = String(value || '').trim().split(/\s+/)[0] || 'Amigo';
  return name.charAt(0).toLocaleUpperCase('es-DO') + name.slice(1).toLocaleLowerCase('es-DO');
}

function normalizePhone(value) {
  let phone = String(value || '').replace(/\D/g, '');
  if (phone.length === 10) phone = `1${phone}`;
  return phone.length >= 11 ? phone : null;
}

function countPurchasedDays(purchases) {
  const dates = new Set();

  purchases.forEach((purchase) => {
    const selectedDates = Array.isArray(purchase.selectedDates) ? purchase.selectedDates : [];
    selectedDates.forEach((selection) => {
      const date = typeof selection === 'string' ? selection : selection?.dateStr;
      if (date) dates.add(date);
    });
  });

  return dates.size;
}

function buildTemplateValues({ sponsorName, purchasedDays, totalSponsoredDays }) {
  const dayLabel = purchasedDays === 1 ? 'día' : 'días';
  const progress = calculateCampaignProgress(totalSponsoredDays);
  const formattedPercentage = progress.totalPercentage.toLocaleString('es-DO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const formattedRaised = progress.totalRaised.toLocaleString('en-US');

  return {
    action: `cubrir ${purchasedDays === 1 ? 'otro día' : `${purchasedDays} días`} más de estudios gracias a ${sponsorName}, quien patrocinó ${purchasedDays} ${dayLabel}. Entra`,
    channel: 'la web de Millas Michael',
    description: `alcanzamos USD$${formattedRaised}, equivalente a un ${formattedPercentage}% de la meta de USD$45,000`,
    buttonParam: BUTTON_PARAM,
    progress,
  };
}

function addContacts(target, snapshot) {
  snapshot.forEach((document) => {
    const data = document.data();
    const phone = normalizePhone(data.phone1 || data.phone || data.telefono);
    if (!phone || target.has(phone)) return;

    target.set(phone, {
      phone,
      name: firstName(data.owner_name || data.fullName || data.nombre || data.name),
    });
  });
}

async function sendInBatches(contacts, templateValues) {
  let sent = 0;
  let failed = 0;

  for (let index = 0; index < contacts.length; index += SEND_CONCURRENCY) {
    const batch = contacts.slice(index, index + SEND_CONCURRENCY);
    const results = await Promise.all(batch.map((contact) => sendLeadUpdateTemplate({
      telefono: contact.phone,
      nombre: contact.name,
      ...templateValues,
    })));

    results.forEach((result) => {
      if (result.success) sent += 1;
      else failed += 1;
    });
  }

  return { sent, failed };
}

async function runComprameUnDiaBroadcast(purchaseId) {
  if (!purchaseId) return { success: false, error: 'Missing purchaseId' };

  const logRef = adminDb.collection(BROADCAST_COLLECTION).doc(`comprame-un-dia-${purchaseId}`);

  try {
    const shouldStart = await adminDb.runTransaction(async (transaction) => {
      const existing = await transaction.get(logRef);
      if (existing.exists && ['processing', 'completed'].includes(existing.data()?.status)) {
        return false;
      }

      transaction.set(logRef, {
        type: 'comprame-un-dia',
        purchaseId,
        status: 'processing',
        startedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      return true;
    });

    if (!shouldStart) return { success: true, skipped: true };

    const [purchaseDoc, leadsSnapshot, purchasesSnapshot] = await Promise.all([
      adminDb.collection('comprame-un-dia').doc(purchaseId).get(),
      adminDb.collection('lead-capture').select('name', 'phone', 'phone1').get(),
      adminDb.collection('comprame-un-dia').get(),
    ]);

    if (!purchaseDoc.exists) throw new Error('No se encontró la compra que originó el broadcast.');

    const purchase = purchaseDoc.data();
    const purchasedDays = Array.isArray(purchase.selectedDates) ? purchase.selectedDates.length : 0;
    if (purchasedDays < 1) throw new Error('La compra no contiene días seleccionados.');

    const purchases = purchasesSnapshot.docs.map((document) => document.data());
    const totalSponsoredDays = countPurchasedDays(purchases);
    const sponsorName = purchase.is_anonymous ? 'un patrocinador anónimo' : (purchase.fullName || 'un nuevo patrocinador');
    const templateValues = buildTemplateValues({ sponsorName, purchasedDays, totalSponsoredDays });

    const contacts = new Map();
    addContacts(contacts, leadsSnapshot);

    const summary = await sendInBatches([...contacts.values()], templateValues);

    await logRef.set({
      status: 'completed',
      recipients: contacts.size,
      sent: summary.sent,
      failed: summary.failed,
      totalSponsoredDays,
      totalRaisedUsd: templateValues.progress.totalRaised,
      progressPercentage: templateValues.progress.totalPercentage,
      completedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return { success: true, ...summary, recipients: contacts.size };
  } catch (error) {
    console.error('Error en broadcast de Cómprame un Día:', error);

    try {
      await logRef.set({
        status: 'failed',
        error: error.message,
        failedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    } catch (logError) {
      console.error('No se pudo registrar el error del broadcast:', logError);
    }

    return { success: false, error: error.message };
  }
}

export async function broadcastComprameUnDiaPurchase(purchaseId) {
  if (!purchaseId) return { success: false, error: 'Missing purchaseId' };

  after(async () => {
    await runComprameUnDiaBroadcast(purchaseId);
  });

  return { success: true, queued: true };
}

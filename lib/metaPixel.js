const PURCHASE_STORAGE_PREFIX = 'meta_pixel_purchase:';

/**
 * Registra una compra de la rifa una sola vez por submissionId.
 * Debe invocarse únicamente después de que el backend confirme el registro.
 */
export function trackMetaPurchase({ submissionId, value }) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
    console.warn('Meta Pixel no está disponible; Purchase no fue enviado.');
    return false;
  }

  const amount = Number(value);
  if (!submissionId || !Number.isFinite(amount) || amount <= 0) {
    console.warn('Purchase no fue enviado: submissionId o monto inválido.');
    return false;
  }

  const storageKey = `${PURCHASE_STORAGE_PREFIX}${submissionId}`;
  try {
    if (window.localStorage.getItem(storageKey)) return false;
  } catch (error) {
    console.warn('No se pudo consultar la deduplicación de Meta Pixel:', error);
  }

  window.fbq('track', 'Purchase', {
    value: amount,
    currency: 'DOP',
  });

  try {
    window.localStorage.setItem(storageKey, '1');
  } catch (error) {
    console.warn('Purchase fue enviado, pero no se pudo guardar su deduplicación:', error);
  }

  return true;
}

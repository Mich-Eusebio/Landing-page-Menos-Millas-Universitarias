/**
 * Servicio para gestionar descargas y lead magnets.
 */

export function downloadResilienceGuide() {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('a');
  link.href = '/guia_resciliencia.pdf';
  link.download = 'Guia_de_Resiliencia_Michael_Eusebio.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

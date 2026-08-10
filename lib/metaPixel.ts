// Helper para disparar eventos del Pixel de Meta desde el navegador.
// El script base se carga en components/MetaPixel.tsx (root layout).

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

// IDs unicos para deduplicar el mismo evento entre el pixel del navegador y
// el Conversions API del backend (Meta descarta el duplicado si comparten
// event_name + event_id).
export function generarEventId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export function trackMetaEvent(eventName: string, params?: Record<string, any>, eventId?: string) {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  try {
    if (eventId) {
      window.fbq('track', eventName, params || {}, { eventID: eventId });
    } else {
      window.fbq('track', eventName, params || {});
    }
  } catch (err) {
    console.warn('No se pudo registrar evento de Meta Pixel:', err);
  }
}

// Datos del navegador utiles para que el backend haga match de calidad en
// el Conversions API (cookies _fbp/_fbc que Meta genera automaticamente).
export function datosMetaParaPedido() {
  return {
    fbp: getCookie('_fbp'),
    fbc: getCookie('_fbc'),
  };
}

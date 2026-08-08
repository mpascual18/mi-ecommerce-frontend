// Centraliza la URL base del backend.
// En producción (Vercel / pyr-store.com), si no se define NEXT_PUBLIC_API_URL,
// cae automáticamente a la URL del backend en producción (Railway).
// En desarrollo local (localhost), cae a http://localhost:4000.

export function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return 'https://pyrstore-backend.up.railway.app';
    }
  }
  return 'http://localhost:4000';
}

export const API_URL = getApiUrl();


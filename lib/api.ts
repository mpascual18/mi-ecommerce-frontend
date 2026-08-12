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
      return 'https://pyr-store-backend-production.up.railway.app';
    }
  }
  return 'http://localhost:4000';
}

export const API_URL = getApiUrl();

// Envoltorio de fetch para las páginas del panel (CRM/ERP): agrega
// automáticamente el token de sesión guardado al iniciar sesión, y si el
// backend responde 401 (sesión vencida/inválida) limpia la sesión y manda
// al usuario de vuelta a /login. La tienda pública (catálogo, checkout)
// no usa esto — sigue con fetch normal, sin sesión.
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pyr_token') : null;

  const headers = new Headers(init.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('pyr_user');
    localStorage.removeItem('pyr_token');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  return res;
}


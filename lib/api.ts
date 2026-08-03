// Centraliza la URL base del backend.
// En producción (Vercel) define NEXT_PUBLIC_API_URL en las variables de entorno
// del proyecto apuntando a donde esté desplegado el backend (Railway/Render/etc).
// En desarrollo local, si no se define, cae a localhost:4000.
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

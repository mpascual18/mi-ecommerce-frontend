export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1570197788417-0e82375c9371?q=80&w=800&auto=format&fit=crop';

export type Producto = {
  id: number | string;
  nombre: string;
  categoria?: string;
  price_soles: number;
  price_oferta?: number | null;
  stock?: number;
  badge?: string;
  imagen_url?: string;
  descripcion?: string;
  hook_titulo?: string;
  beneficios?: string;
  galeria_urls?: string;
  gif_url?: string;
};

/**
 * Saneo básico del HTML de la descripción enriquecida (viene del editor del ERP).
 * No es un sanitizador exhaustivo, pero evita el vector de XSS más obvio (scripts,
 * iframes y atributos on*) por si algún día se filtra contenido no confiable.
 */
export function sanearDescripcionHtml(html?: string): string {
  if (!html) return '';
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

/** Convierte el textarea "uno por línea" en un array limpio, sin líneas vacías */
export function lineasA(texto?: string): string[] {
  return (texto || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Todas las imágenes de un producto: principal + galería + gif (el gif anima solo por ser <img>) */
export function galeriaCompleta(p: Producto): string[] {
  const imgs = [p.imagen_url, ...lineasA(p.galeria_urls)].filter(Boolean) as string[];
  if (p.gif_url) imgs.push(p.gif_url);
  return imgs.length > 0 ? imgs : [FALLBACK_IMAGE];
}

export function precioDe(p: Producto) {
  return Number(p.price_oferta || p.price_soles || 0);
}

export function precioAnteriorDe(p: Producto) {
  return p.price_oferta ? Number(p.price_soles) : null;
}

function quitarTildes(texto: string): string {
  // Recorre los caracteres del texto normalizado (NFD) y descarta los diacríticos
  // combinantes (rango Unicode 0x0300–0x036F: acentos, virgulilla de la ñ, etc.)
  let resultado = '';
  for (const ch of texto) {
    const code = ch.codePointAt(0) || 0;
    if (code < 0x0300 || code > 0x036f) {
      resultado += ch;
    }
  }
  return resultado;
}

/** Convierte "Vaso Yogurera Portable 'Yogurt To Go'" en "vaso-yogurera-portable-yogurt-to-go" */
export function slugify(texto: string): string {
  return quitarTildes((texto || '').toString().normalize('NFD'))
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function productoHref(p: Producto): string {
  const slug = slugify(p.nombre);
  return slug ? `/${slug}` : `/producto/${p.id}`;
}

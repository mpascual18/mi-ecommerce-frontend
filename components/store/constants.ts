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
};

export function precioDe(p: Producto) {
  return Number(p.price_oferta || p.price_soles || 0);
}

export function precioAnteriorDe(p: Producto) {
  return p.price_oferta ? Number(p.price_soles) : null;
}

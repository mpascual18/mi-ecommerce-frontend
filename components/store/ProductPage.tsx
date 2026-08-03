'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { useCart, soles } from './CartContext';
import { FALLBACK_IMAGE, Producto, precioDe, precioAnteriorDe } from './constants';
import { IconChevronLeft, IconBag, IconBolt, IconShieldCheck, IconTruck } from './Icons';

export default function ProductPage({ id }: { id: string }) {
  const { addToCart, setCartOpen } = useCart();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [relacionados, setRelacionados] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setCargando(true);
    setNoEncontrado(false);
    (async () => {
      try {
        const [resProd, resLista] = await Promise.all([
          fetch(`${API_URL}/api/productos/${id}`),
          fetch(`${API_URL}/api/productos`),
        ]);

        if (resProd.ok) {
          const data = await resProd.json();
          setProducto(data);

          if (resLista.ok) {
            const lista = await resLista.json();
            if (Array.isArray(lista)) {
              setRelacionados(
                lista.filter((p: Producto) => String(p.id) !== String(id) && (p.categoria || 'General') === (data.categoria || 'General')).slice(0, 4)
              );
            }
          }
        } else {
          setNoEncontrado(true);
        }
      } catch (err) {
        console.warn('No se pudo cargar el producto:', err);
        setNoEncontrado(true);
      }
      setCargando(false);
    })();
  }, [id]);

  if (cargando) {
    return <main className="max-w-5xl mx-auto px-4 py-24 text-center text-sm font-bold text-slate-400">Cargando producto...</main>;
  }

  if (noEncontrado || !producto) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-24 text-center space-y-4">
        <p className="text-sm font-bold text-slate-500">No encontramos este producto.</p>
        <Link href="/" className="inline-flex items-center gap-1.5 text-brand-red font-bold text-xs">
          <IconChevronLeft className="w-4 h-4" /> Volver al catálogo
        </Link>
      </main>
    );
  }

  const precio = precioDe(producto);
  const anterior = precioAnteriorDe(producto);
  const descuento = anterior ? Math.round(((anterior - precio) / anterior) * 100) : 0;
  const precioCombo = qty === 1 ? precio : qty === 2 ? precio * 1.8 : precio * 2.4;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 flex-1 w-full space-y-12">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-brand-red transition">Tienda</Link>
        <span>/</span>
        <Link href={`/?q=${encodeURIComponent(producto.categoria || 'General')}`} className="hover:text-brand-red transition">
          {producto.categoria || 'General'}
        </Link>
        <span>/</span>
        <span className="text-brand-grafito line-clamp-1">{producto.nombre}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* IMAGEN */}
        <div className="space-y-3">
          <div className="rounded-3xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
            <img src={producto.imagen_url || FALLBACK_IMAGE} alt={producto.nombre} className="w-full h-80 md:h-[26rem] object-cover" />
          </div>
        </div>

        {/* INFO */}
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {producto.badge && producto.badge !== 'SIN BADGE' && (
                <span className="bg-brand-red text-white text-[10px] font-heading font-extrabold px-2.5 py-1 rounded-md uppercase">{producto.badge}</span>
              )}
              {descuento > 0 && <span className="bg-brand-gold text-brand-grafito text-[10px] font-heading font-black px-2.5 py-1 rounded-md">-{descuento}% OFF</span>}
              <span className="text-xs font-bold text-brand-red uppercase tracking-wider">{producto.categoria || 'General'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-black text-brand-grafito leading-tight">{producto.nombre}</h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-3xl font-heading font-black text-brand-red">{soles(precio)}</span>
            {anterior && <span className="text-base text-slate-400 line-through">{soles(anterior)}</span>}
            {typeof producto.stock === 'number' && (
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-0.5 rounded-full border border-emerald-200">En Stock ({producto.stock} unids)</span>
            )}
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">{producto.descripcion || 'Producto importado de alta calidad.'}</p>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 border-y border-slate-100 py-3">
            <span className="flex items-center gap-1.5"><IconShieldCheck className="w-4 h-4 text-brand-red" /> Calidad garantizada</span>
            <span className="flex items-center gap-1.5"><IconTruck className="w-4 h-4 text-brand-red" /> Envíos a todo el país</span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-heading font-bold text-brand-grafito">Selecciona Cantidad / Combo:</label>
            <select
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-brand-red"
            >
              <option value={1}>1 Unidad - {soles(precio * 1)}</option>
              <option value={2}>2 Unidades (Combo Pareja) - {soles(precio * 1.8)}</option>
              <option value={3}>3 Unidades (Pack Familiar) - {soles(precio * 2.4)}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => addToCart({ id: producto.id, title: producto.nombre, price: precioCombo / qty, image: producto.imagen_url || FALLBACK_IMAGE }, qty)}
              className="w-full bg-brand-grafito hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2"
            >
              <IconBag className="w-4 h-4 text-brand-gold" />
              Agregar al Carrito
            </button>
            <button
              onClick={() => {
                addToCart({ id: producto.id, title: producto.nombre, price: precioCombo / qty, image: producto.imagen_url || FALLBACK_IMAGE }, qty);
                setCartOpen(true);
              }}
              className="w-full bg-brand-red hover:bg-brand-darkred text-white font-heading font-extrabold py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2"
            >
              <IconBolt className="w-4 h-4" />
              Comprar Ahora
            </button>
          </div>

          <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-brand-red font-bold text-xs pt-2">
            <IconChevronLeft className="w-4 h-4" /> Seguir viendo el catálogo
          </Link>
        </div>
      </div>

      {/* RELACIONADOS */}
      {relacionados.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-heading font-black text-brand-grafito">También te puede interesar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {relacionados.map((p) => {
              const pPrecio = precioDe(p);
              const pAnterior = precioAnteriorDe(p);
              return (
                <Link key={p.id} href={`/producto/${p.id}`} className="store-luxury-card bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs block">
                  <img src={p.imagen_url || FALLBACK_IMAGE} alt={p.nombre} className="store-img-zoom w-full h-36 object-cover" />
                  <div className="p-3 space-y-1">
                    <h3 className="font-heading font-bold text-brand-grafito text-xs line-clamp-2">{p.nombre}</h3>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-heading font-black text-brand-red">{soles(pPrecio)}</span>
                      {pAnterior && <span className="text-[10px] text-slate-400 line-through">{soles(pAnterior)}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}

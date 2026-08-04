'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { useCart, soles } from './CartContext';
import {
  FALLBACK_IMAGE,
  Producto,
  precioDe,
  precioAnteriorDe,
  productoHref,
  galeriaCompleta,
  sanearDescripcionHtml,
  calcularEnvio,
  COSTO_ENVIO,
} from './constants';
import {
  IconChevronLeft,
  IconBolt,
  IconShieldCheck,
  IconTruck,
  IconChevronDown,
  IconWhatsapp,
  IconLock,
} from './Icons';

const FAQS = [
  {
    q: '¿Cómo funciona el pago?',
    a: 'Pago contra entrega en Lima Metropolitana (efectivo, Yape o Plin al recibir). Para envíos a provincia trabajamos con Yape, Plin o depósito previo antes del despacho.',
  },
  {
    q: '¿Cuánto demora el envío?',
    a: 'En Lima coordinamos la entrega por WhatsApp apenas confirmamos tu pedido. A provincia enviamos por Shalom u Olva Courier.',
  },
  {
    q: '¿Cómo hago mi pedido?',
    a: 'Agrega el producto al carrito, completa tus datos de contacto y entrega, y un asesor te escribe por WhatsApp para confirmar todo antes de despachar.',
  },
  {
    q: '¿Los productos son de calidad?',
    a: 'Sí. Seleccionamos e importamos cada producto verificando su calidad antes de ofrecerlo en la tienda.',
  },
];

function Faq() {
  const [abierto, setAbierto] = useState<number | null>(0);
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-heading font-black text-brand-grafito">Preguntas Frecuentes</h2>
      <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden bg-white">
        {FAQS.map((item, i) => (
          <div key={item.q}>
            <button
              onClick={() => setAbierto(abierto === i ? null : i)}
              className="w-full flex items-center justify-between gap-3 text-left px-4 py-3.5 text-sm font-bold text-brand-grafito hover:bg-slate-50 transition"
            >
              <span>{item.q}</span>
              <IconChevronDown className={`w-4 h-4 text-brand-red shrink-0 transition-transform ${abierto === i ? 'rotate-180' : ''}`} />
            </button>
            {abierto === i && <p className="px-4 pb-4 text-xs text-slate-600 leading-relaxed">{item.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ProductPage({ slug }: { slug: string }) {
  const { addToCart, setCartOpen } = useCart();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [relacionados, setRelacionados] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [qty, setQty] = useState(1);
  const [imagenActiva, setImagenActiva] = useState(0);

  useEffect(() => {
    setCargando(true);
    setNoEncontrado(false);
    setImagenActiva(0);
    (async () => {
      try {
        const resLista = await fetch(`${API_URL}/api/productos`);
        if (resLista.ok) {
          const lista = await resLista.json();
          const data = Array.isArray(lista) ? lista.find((p: Producto) => productoHref(p) === `/${slug}`) : null;

          if (data) {
            setProducto(data);
            setRelacionados(
              lista.filter((p: Producto) => String(p.id) !== String(data.id) && (p.categoria || 'General') === (data.categoria || 'General')).slice(0, 4)
            );
          } else {
            setNoEncontrado(true);
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
  }, [slug]);

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

  // Oferta manual por cantidad (configurada en el ERP). Si el admin la definió,
  // tiene prioridad sobre el cálculo automático (precio * 1.8 / * 2.4). El precio
  // "antes" tachado siempre se calcula con el precio NORMAL (price_soles), no con
  // el de oferta unitaria.
  const oferta2u =
    producto.oferta_2u_precio !== undefined && producto.oferta_2u_precio !== null && producto.oferta_2u_precio !== ''
      ? Number(producto.oferta_2u_precio)
      : null;
  const oferta3u =
    producto.oferta_3u_precio !== undefined && producto.oferta_3u_precio !== null && producto.oferta_3u_precio !== ''
      ? Number(producto.oferta_3u_precio)
      : null;
  const precioNormalUnitario = Number(producto.price_soles) || precio;
  const antes2u = precioNormalUnitario * 2;
  const antes3u = precioNormalUnitario * 3;

  const precioCombo = qty === 1 ? precio : qty === 2 ? oferta2u ?? precio * 1.8 : oferta3u ?? precio * 2.4;
  const galeria = galeriaCompleta(producto);
  const envio = calcularEnvio(precioCombo);

  function agregarYAbrir() {
    if (!producto) return;
    addToCart({ id: producto.id, title: producto.nombre, price: precioCombo / qty, image: producto.imagen_url || FALLBACK_IMAGE }, qty);
    setCartOpen(true);
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 flex-1 w-full space-y-14 pb-28 md:pb-14">
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
        {/* GALERIA */}
        <div className="space-y-3 md:sticky md:top-24">
          <div className="rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xs aspect-square flex items-center justify-center">
            <img src={galeria[imagenActiva] || FALLBACK_IMAGE} alt={producto.nombre} className="w-full h-full object-contain" />
          </div>
          {galeria.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {galeria.map((url, i) => (
                <button
                  key={`${url}-${i}`}
                  onClick={() => setImagenActiva(i)}
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 bg-white flex items-center justify-center transition ${
                    imagenActiva === i ? 'border-brand-red' : 'border-slate-200 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`${producto.nombre} vista ${i + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO / HOOK */}
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {producto.badge && producto.badge !== 'SIN BADGE' && (
                <span className="bg-brand-red text-white text-[10px] font-heading font-extrabold px-2.5 py-1 rounded-md uppercase">{producto.badge}</span>
              )}
              {descuento > 0 && <span className="bg-brand-gold text-brand-grafito text-[10px] font-heading font-black px-2.5 py-1 rounded-md">-{descuento}% OFF</span>}
              <span className="text-xs font-bold text-brand-red uppercase tracking-wider">{producto.categoria || 'General'}</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-heading font-black text-brand-grafito leading-tight">{producto.nombre}</h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-3xl font-heading font-black text-brand-red">{soles(precio)}</span>
            {anterior && <span className="text-base text-slate-400 line-through">{soles(anterior)}</span>}
            {typeof producto.stock === 'number' && (
              <span
                className={`text-xs font-bold px-3 py-0.5 rounded-full border ${
                  producto.stock > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
                }`}
              >
                {producto.stock > 0 ? `En Stock (${producto.stock} unids)` : 'Agotado'}
              </span>
            )}
          </div>

          <div
            className="text-sm text-slate-600 leading-relaxed whitespace-pre-line [&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-2"
            dangerouslySetInnerHTML={{
              __html: producto.descripcion ? sanearDescripcionHtml(producto.descripcion) : 'Producto importado de alta calidad.',
            }}
          />

          <div className="flex items-center gap-4 text-sm font-semibold text-slate-500 border-y border-slate-100 py-3 flex-wrap">
            <span className="flex items-center gap-1.5"><IconShieldCheck className="w-[18px] h-[18px] text-brand-red" /> Calidad garantizada</span>
            <span className="flex items-center gap-1.5"><IconTruck className="w-[18px] h-[18px] text-brand-red" /> Envíos a todo el país</span>
            <span className="flex items-center gap-1.5"><IconLock className="w-[18px] h-[18px] text-brand-red" /> Pago contra entrega</span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-heading font-bold text-brand-grafito">Selecciona Cantidad / Combo:</label>
            <select
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-brand-red"
            >
              <option value={1}>1 Unidad - {soles(precio * 1)}</option>
              <option value={2}>
                2 Unidades (Combo Pareja) - {soles(oferta2u ?? precio * 1.8)}
                {oferta2u ? ` (antes ${soles(antes2u)})` : ''}
              </option>
              <option value={3}>
                3 Unidades (Pack Familiar) - {soles(oferta3u ?? precio * 2.4)}
                {oferta3u ? ` (antes ${soles(antes3u)})` : ''}
              </option>
            </select>

            {envio.gratis ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-bold px-3.5 py-2 rounded-full">
                <IconTruck className="w-4 h-4" /> Envío GRATIS 🎉
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 border border-slate-200 text-sm font-bold px-3.5 py-2 rounded-full">
                <IconTruck className="w-4 h-4" /> Costo de envío: {soles(COSTO_ENVIO)}
              </span>
            )}
          </div>

          <div className="hidden md:block pt-1">
            <button
              onClick={agregarYAbrir}
              className="w-full bg-brand-red hover:bg-brand-darkred text-white font-heading font-extrabold py-4 px-4 rounded-2xl text-base shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
            >
              <IconBolt className="w-5 h-5" />
              Comprar Ahora
            </button>
          </div>

          <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-brand-red font-bold text-xs pt-2">
            <IconChevronLeft className="w-4 h-4" /> Seguir viendo el catálogo
          </Link>
        </div>
      </div>

      <Faq />

      {/* RELACIONADOS */}
      {relacionados.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-heading font-black text-brand-grafito">También te puede interesar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {relacionados.map((p) => {
              const pPrecio = precioDe(p);
              const pAnterior = precioAnteriorDe(p);
              return (
                <Link key={p.id} href={productoHref(p)} className="store-luxury-card bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs block">
                  <div className="w-full h-36 bg-white flex items-center justify-center">
                    <img src={p.imagen_url || FALLBACK_IMAGE} alt={p.nombre} className="store-img-zoom w-full h-full object-contain" />
                  </div>
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

      {/* BARRA CTA FIJA — SOLO MOBILE */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-2xl p-3 flex items-center gap-3">
        <div className="shrink-0">
          <span className="block text-[10px] text-slate-400 font-bold uppercase">Precio</span>
          <span className="text-lg font-heading font-black text-brand-red leading-none">{soles(precio)}</span>
        </div>
        <button
          onClick={agregarYAbrir}
          className="flex-1 bg-brand-red hover:bg-brand-darkred text-white font-heading font-extrabold py-3.5 px-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md"
        >
          <IconWhatsapp className="w-5 h-5" />
          Comprar Ahora
        </button>
      </div>
    </main>
  );
}

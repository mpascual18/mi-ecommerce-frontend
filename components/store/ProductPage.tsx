'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { useCart, soles } from './CartContext';
import DirectOrderModal from './DirectOrderModal';
import {
  FALLBACK_IMAGE,
  Producto,
  precioDe,
  precioAnteriorDe,
  productoHref,
  galeriaCompleta,
  sanearDescripcionHtml,
} from './constants';
import {
  IconChevronLeft,
  IconShieldCheck,
  IconTruck,
  IconChevronDown,
  IconWhatsapp,
  IconLock,
} from './Icons';

const FAQS = [
  {
    q: '¿Cómo funciona el pago contra entrega?',
    a: 'En Lima Metropolitana pagas directamente en efectivo, Yape o Plin cuando el motorizado entrega el paquete en tu puerta.',
  },
  {
    q: '¿Hacen envíos a todo el Perú?',
    a: '¡Sí! Para provincias enviamos diariamente por agencias de carga como Shalom, Olva Courier o Marvisur previo depósito o transferencia.',
  },
  {
    q: '¿El producto tiene garantía?',
    a: 'Todos nuestros productos son importados directamente y pasan por control de calidad. Garantía 100% de cambio o devolución en P&R Store.',
  },
];

function Faq() {
  const [abierto, setAbierto] = useState<number | null>(0);
  return (
    <section className="space-y-4 pt-4 border-t border-slate-200">
      <h2 className="text-xl font-heading font-black text-slate-900">Preguntas Frecuentes</h2>
      <div className="divide-y divide-slate-200 border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-xs">
        {FAQS.map((item, i) => (
          <div key={item.q}>
            <button
              onClick={() => setAbierto(abierto === i ? null : i)}
              className="w-full flex items-center justify-between gap-3 text-left px-5 py-4 text-sm font-bold text-slate-900 hover:bg-slate-50 transition"
            >
              <span>{item.q}</span>
              <IconChevronDown className={`w-4 h-4 text-red-600 shrink-0 transition-transform ${abierto === i ? 'rotate-180' : ''}`} />
            </button>
            {abierto === i && <p className="px-5 pb-4 text-xs text-slate-600 leading-relaxed">{item.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ProductPage({ slug }: { slug: string }) {
  const { config } = useCart();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [relacionados, setRelacionados] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [imagenActiva, setImagenActiva] = useState(0);
  const [modalPedidoOpen, setModalPedidoOpen] = useState(false);

  // Countdown timer para urgencia (14:59)
  const [tiempoRestante, setTiempoRestante] = useState(14 * 60 + 59);

  // Combo seleccionado
  const [selectedPromo, setSelectedPromo] = useState<{ id: string; name: string; price: number }>({
    id: '1',
    name: '1 Unidad',
    price: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTiempoRestante((prev) => (prev > 0 ? prev - 1 : 14 * 60 + 59));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
            const pUnit = precioDe(data);
            const p2u = data.oferta_2u_precio ? Number(data.oferta_2u_precio) : Math.round(pUnit * 1.8);
            setSelectedPromo({ id: '1', name: '1 Unidad', price: pUnit });

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
    return (
      <main className="max-w-5xl mx-auto px-4 py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-bold text-slate-500">Cargando página del producto...</p>
      </main>
    );
  }

  if (noEncontrado || !producto) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-24 text-center space-y-4">
        <p className="text-base font-bold text-slate-600">No encontramos este producto en el catálogo.</p>
        <Link href="/" className="inline-flex items-center gap-1.5 text-red-600 font-black text-sm">
          <IconChevronLeft className="w-4 h-4" /> Volver al catálogo principal
        </Link>
      </main>
    );
  }

  const precio = precioDe(producto);
  const anterior = precioAnteriorDe(producto);
  const descuento = anterior ? Math.round(((anterior - precio) / anterior) * 100) : 0;

  const oferta2u = producto.oferta_2u_precio ? Number(producto.oferta_2u_precio) : Math.round(precio * 1.8);
  const oferta3u = producto.oferta_3u_precio ? Number(producto.oferta_3u_precio) : Math.round(precio * 2.4);

  const min = Math.floor(tiempoRestante / 60);
  const sec = tiempoRestante % 60;
  const timerStr = `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;

  const galeria = galeriaCompleta(producto);

  const abrirModalDirecto = () => {
    setModalPedidoOpen(true);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 flex-1 w-full space-y-12 pb-28 md:pb-14">
      {/* BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <Link href="/" className="hover:text-red-600 transition">Tienda</Link>
        <span>/</span>
        <Link href={`/#catalogo`} className="hover:text-red-600 transition">
          {producto.categoria || 'General'}
        </Link>
        <span>/</span>
        <span className="text-slate-900 line-clamp-1">{producto.nombre}</span>
      </nav>

      {/* DETALLES PRODUCTO LANDING GANADORA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        
        {/* GALERÍA DE IMÁGENES */}
        <div className="space-y-4 md:sticky md:top-24">
          <div className="relative rounded-3xl overflow-hidden border-2 border-slate-200 bg-white shadow-xl aspect-square flex items-center justify-center p-4">
            {producto.badge && producto.badge !== 'SIN BADGE' && (
              <span className="absolute top-4 left-4 bg-red-600 text-white text-xs font-heading font-black px-3 py-1 rounded-full uppercase z-10 shadow-md">
                {producto.badge}
              </span>
            )}
            {descuento > 0 && (
              <span className="absolute top-4 right-4 bg-amber-400 text-slate-950 text-xs font-heading font-black px-3 py-1 rounded-full z-10 shadow-md">
                -{descuento}% OFF
              </span>
            )}
            <img src={galeria[imagenActiva] || FALLBACK_IMAGE} alt={producto.nombre} className="w-full h-full object-contain" />
          </div>

          {galeria.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {galeria.map((url, i) => (
                <button
                  key={`${url}-${i}`}
                  onClick={() => setImagenActiva(i)}
                  className={`shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 bg-white flex items-center justify-center transition p-1 ${
                    imagenActiva === i ? 'border-red-600 shadow-md scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`${producto.nombre} vista ${i + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA - OFERTA DE ALTA CONVERSIÓN */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap text-amber-500 font-bold text-xs">
              <span>★★★★★</span>
              <span className="text-slate-500 font-semibold">4.9/5 (+1,240 clientes satisfechos)</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-900 leading-tight">
              {producto.nombre}
            </h1>
          </div>

          {/* TIMER DE URGENCIA */}
          <div className="bg-gradient-to-r from-amber-500/10 to-red-500/10 border-2 border-amber-400/50 rounded-2xl p-4 flex items-center justify-between text-slate-900">
            <div className="flex items-center gap-2">
              <span className="text-xl">⏰</span>
              <span className="text-xs font-heading font-black uppercase tracking-wider text-red-700">Oferta Especial por Tiempo Limitado:</span>
            </div>
            <div className="font-mono text-base font-black text-red-600 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-xs">
              {timerStr}
            </div>
          </div>

          <div
            className="text-sm text-slate-600 leading-relaxed whitespace-pre-line [&_img]:rounded-xl [&_img]:max-w-full [&_img]:my-2"
            dangerouslySetInnerHTML={{
              __html: producto.descripcion ? sanearDescripcionHtml(producto.descripcion) : 'Producto importado de alta calidad.',
            }}
          />

          {/* COMBOS PROMO DE ALTA CONVERSIÓN */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-heading font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>🎁 Selecciona tu Promo con Descuento:</span>
            </h3>

            <div className="space-y-3">
              {/* Option 1 Unit */}
              <label
                onClick={() => setSelectedPromo({ id: '1', name: '1 Unidad', price: precio })}
                className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition shadow-xs ${
                  selectedPromo.id === '1' ? 'border-red-600 bg-red-50/70 text-slate-900 font-bold' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 border-red-600 flex items-center justify-center`}>
                    {selectedPromo.id === '1' && <div className="w-2.5 h-2.5 rounded-full bg-red-600" />}
                  </div>
                  <div>
                    <span className="font-heading font-bold text-sm block">1 Unidad</span>
                    <span className="text-xs text-slate-500">Uso personal</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-heading font-black text-red-600 block">{soles(precio)}</span>
                  {anterior && <span className="text-xs text-slate-400 line-through">{soles(anterior)}</span>}
                </div>
              </label>

              {/* Option 2 Units */}
              <label
                onClick={() => setSelectedPromo({ id: '2', name: '2 Unidades (Más Vendido)', price: oferta2u })}
                className={`relative flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition shadow-sm ${
                  selectedPromo.id === '2' ? 'border-red-600 bg-red-50/70 text-slate-900 font-bold' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="absolute -top-3 right-4 bg-red-600 text-white text-[10px] font-heading font-black uppercase px-3 py-0.5 rounded-full shadow-xs">
                  ⭐ MÁS VENDIDO
                </span>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 border-red-600 flex items-center justify-center`}>
                    {selectedPromo.id === '2' && <div className="w-2.5 h-2.5 rounded-full bg-red-600" />}
                  </div>
                  <div>
                    <span className="font-heading font-bold text-sm block">2 Unidades</span>
                    <span className="text-xs text-red-700 font-bold">Especial Parejas / Ahorra más</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-heading font-black text-red-600 block">{soles(oferta2u)}</span>
                  <span className="text-xs text-slate-400 line-through">{soles(precio * 2)}</span>
                </div>
              </label>

              {/* Option 3 Units */}
              <label
                onClick={() => setSelectedPromo({ id: '3', name: '3 Unidades (Pack Familiar)', price: oferta3u })}
                className={`relative flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition shadow-xs ${
                  selectedPromo.id === '3' ? 'border-red-600 bg-red-50/70 text-slate-900 font-bold' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="absolute -top-3 right-4 bg-amber-400 text-slate-950 text-[10px] font-heading font-black uppercase px-3 py-0.5 rounded-full shadow-xs">
                  🔥 PACK FAMILIAR
                </span>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 border-red-600 flex items-center justify-center`}>
                    {selectedPromo.id === '3' && <div className="w-2.5 h-2.5 rounded-full bg-red-600" />}
                  </div>
                  <div>
                    <span className="font-heading font-bold text-sm block">3 Unidades</span>
                    <span className="text-xs text-amber-800 font-bold">Máximo Ahorro</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-heading font-black text-red-600 block">{soles(oferta3u)}</span>
                  <span className="text-xs text-slate-400 line-through">{soles(precio * 3)}</span>
                </div>
              </label>
            </div>
          </div>

          {/* TRUST BADGES */}
          <div className="flex items-center gap-3 text-xs font-bold text-slate-600 border-y border-slate-200 py-3.5 flex-wrap">
            <span className="flex items-center gap-1.5"><IconShieldCheck className="w-4 h-4 text-emerald-600" /> Garantía P&R Store</span>
            <span className="flex items-center gap-1.5"><IconTruck className="w-4 h-4 text-red-600" /> Pago Contra Entrega en Lima</span>
          </div>

          {/* BOTÓN PRINCIPAL COMPRAR AHORA -> ABRE MODAL FLOTANTE DIRECTO */}
          <button
            onClick={abrirModalDirecto}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-heading font-black py-4 px-6 rounded-2xl text-base shadow-xl hover:shadow-2xl transition flex items-center justify-center gap-3 transform hover:-translate-y-0.5"
          >
            <span>⚡ ¡PEDIR AHORA - PAGO CONTRA ENTREGA!</span>
          </button>
        </div>
      </div>

      <Faq />

      {/* MODAL DE PEDIDO FLOTANTE DIRECTO SIN CARRITO */}
      {modalPedidoOpen && (
        <DirectOrderModal
          productoNombre={producto.nombre}
          productoId={producto.id}
          precioUnitario={precio}
          promoElegida={selectedPromo}
          onClose={() => setModalPedidoOpen(false)}
          whatsappNumero={config.whatsappNumber}
        />
      )}

      {/* STICKY BOTTOM BUTTON MOVIL */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-2xl p-3 flex items-center justify-between gap-3">
        <div>
          <span className="block text-[10px] text-slate-400 font-bold uppercase">Total Promo</span>
          <span className="text-lg font-heading font-black text-red-600">{soles(selectedPromo.price)}</span>
        </div>
        <button
          onClick={abrirModalDirecto}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-black py-3.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-lg"
        >
          <span>¡PEDIR CONTRA ENTREGA!</span>
        </button>
      </div>
    </main>
  );
}

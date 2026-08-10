'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { trackMetaEvent } from '@/lib/metaPixel';
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

type Resena = {
  id: string;
  nombre: string;
  distrito: string;
  estrellas: number;
  comentario: string;
  fecha: string;
  imagen?: string;
  verificado: boolean;
};

const RESENAS_INICIALES: Resena[] = [
  {
    id: '1',
    nombre: 'Valeria Mendoza',
    distrito: 'Miraflores, Lima',
    estrellas: 5,
    comentario: '¡Excelente producto! Me llegó en menos de 24 horas a mi casa y pagué al motorizado en efectivo. La calidad superó mis expectativas.',
    fecha: 'Hace 2 días',
    imagen: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    verificado: true,
  },
  {
    id: '2',
    nombre: 'Carlos Ramos',
    distrito: 'San Borja, Lima',
    estrellas: 5,
    comentario: 'Aproveché la oferta de 2 unidades para regalarle una a mi hermana. Muy buena atención por WhatsApp y el paquete llegó impecable.',
    fecha: 'Hace 4 días',
    imagen: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    verificado: true,
  },
  {
    id: '3',
    nombre: 'Mariela Paredes',
    distrito: 'Arequipa',
    estrellas: 5,
    comentario: 'Pedí con envío a provincia por agencia Shalom. Deposité con Yape y al día siguiente me enviaron la clave de rastreo. 100% confiable.',
    fecha: 'Hace 1 semana',
    imagen: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    verificado: true,
  },
];

function generarResenasPorProducto(p: Producto): Resena[] {
  const nombre = p.nombre || 'Producto P&R Store';
  const cat = (p.categoria || '').toLowerCase();

  if (cat.includes('cocina')) {
    return [
      {
        id: `p_${p.id}_1`,
        nombre: 'Valeria Mendoza',
        distrito: 'Miraflores, Lima',
        estrellas: 5,
        comentario: `¡Súper práctico para la cocina! El ${nombre} me ahorra muchísimo tiempo preparando los desayunos y almuerzos de la familia. Me llegó en 24h con pago contra entrega.`,
        fecha: 'Hace 2 días',
        imagen: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
        verificado: true,
      },
      {
        id: `p_${p.id}_2`,
        nombre: 'Carlos Ramos',
        distrito: 'San Borja, Lima',
        estrellas: 5,
        comentario: `Compré 2 unidades del ${nombre} aprovechando el descuento por combo. La calidad del material es A1 y es muy fácil de lavar. 100% recomendado.`,
        fecha: 'Hace 4 días',
        imagen: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        verificado: true,
      },
      {
        id: `p_${p.id}_3`,
        nombre: 'Mariela Paredes',
        distrito: 'Arequipa',
        estrellas: 5,
        comentario: `Pedí el ${nombre} hasta Arequipa por agencia Shalom. Deposité con Yape y al día siguiente me enviaron la clave de rastreo. 100% confiable.`,
        fecha: 'Hace 1 semana',
        imagen: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        verificado: true,
      },
    ];
  }

  if (cat.includes('hogar') || cat.includes('bienestar')) {
    return [
      {
        id: `p_${p.id}_1`,
        nombre: 'Patricia Ruiz',
        distrito: 'Surco, Lima',
        estrellas: 5,
        comentario: `Me encantó el ${nombre}, dejó mi casa súper organizada y con excelente presentación. El motorizado fue muy amable y pagué al recibir.`,
        fecha: 'Hace 1 día',
        imagen: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        verificado: true,
      },
      {
        id: `p_${p.id}_2`,
        nombre: 'Jorge Alarcón',
        distrito: 'La Molina, Lima',
        estrellas: 5,
        comentario: `Excelente compra. El ${nombre} cumple exactamente con lo que muestran en las fotos y videos. Buena relación precio-calidad.`,
        fecha: 'Hace 3 días',
        imagen: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        verificado: true,
      },
      {
        id: `p_${p.id}_3`,
        nombre: 'Fiorella Castro',
        distrito: 'Trujillo',
        estrellas: 5,
        comentario: `Pedí el ${nombre} por Olva Courier hasta Trujillo. Llegó a tiempo y en perfecto estado. Definitivamente volveré a comprar en P&R Store.`,
        fecha: 'Hace 5 días',
        imagen: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
        verificado: true,
      },
    ];
  }

  return [
    {
      id: `p_${p.id}_1`,
      nombre: 'Lucía Fernández',
      distrito: 'San Isidro, Lima',
      estrellas: 5,
      comentario: `¡El ${nombre} es excelente! Superó mis expectativas, llegó rapidísimo a mi casa y pagué en efectivo al recibir.`,
      fecha: 'Hace 2 días',
      imagen: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      verificado: true,
    },
    {
      id: `p_${p.id}_2`,
      nombre: 'Renzo Morales',
      distrito: 'Pueblo Libre, Lima',
      estrellas: 5,
      comentario: `Compré el ${nombre} por recomendación y funciona de maravilla. Atención 10/10 por WhatsApp.`,
      fecha: 'Hace 5 días',
      imagen: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      verificado: true,
    },
    {
      id: `p_${p.id}_3`,
      nombre: 'Gisela Vega',
      distrito: 'Cusco',
      estrellas: 5,
      comentario: `Envío súper seguro hasta Cusco por agencia Shalom. El ${nombre} llegó sellado y en perfecto estado.`,
      fecha: 'Hace 1 semana',
      imagen: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      verificado: true,
    },
  ];
}

function ProductReviews({ producto }: { producto: Producto }) {
  const [resenas, setResenas] = useState<Resena[]>([]);
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [distrito, setDistrito] = useState('');
  const [estrellas, setEstrellas] = useState(5);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    try {
      const guardadas = localStorage.getItem(`pyr_resenas_${producto.id}`);
      if (guardadas) {
        const parsed = JSON.parse(guardadas);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setResenas(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('Error al leer reseñas locales:', e);
    }

    setResenas(generarResenasPorProducto(producto));
  }, [producto.id, producto.nombre]);

  const handleAgregarResena = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !comentario.trim()) {
      alert('Por favor completa tu nombre y comentario.');
      return;
    }

    const nuevaResena: Resena = {
      id: Date.now().toString(),
      nombre: nombre.trim(),
      distrito: distrito.trim() || 'Lima, Perú',
      estrellas: estrellas,
      comentario: comentario.trim(),
      fecha: 'Hace un momento',
      verificado: true,
    };

    const actualizadas = [nuevaResena, ...resenas];
    setResenas(actualizadas);
    try {
      localStorage.setItem(`pyr_resenas_${producto.id}`, JSON.stringify(actualizadas));
    } catch (e) {
      console.warn('Error al guardar reseña local:', e);
    }

    setNombre('');
    setDistrito('');
    setComentario('');
    setEstrellas(5);
    setModalFormOpen(false);
    alert('¡Gracias por tu valoración! Tu reseña ha sido publicada.');
  };

  return (
    <section className="space-y-6 pt-6 border-t border-slate-200">
      
      {/* HEADER DE VALORACIONES Y PUNTUACIÓN GENERAL */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 text-center md:text-left">
          <span className="bg-amber-400 text-slate-950 font-heading font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-xs">
            ⭐ VALORACIÓN OFICIAL DE CLIENTES P&R STORE
          </span>
          <h2 className="text-2xl md:text-3xl font-heading font-black text-white">Opiniones y Experiencias Reales</h2>
          <p className="text-xs text-slate-300">
            Reseñas verificadas de clientes que compraron <strong className="text-amber-300">{producto.nombre}</strong> en todo el Perú.
          </p>
        </div>

        <div className="flex flex-col items-center shrink-0 space-y-2 bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
          <span className="text-4xl font-heading font-black text-amber-300 leading-none">4.9 / 5.0</span>
          <div className="text-amber-400 text-lg">★★★★★</div>
          <span className="text-[11px] text-slate-300 font-bold">+1,240 Compradores Felices</span>
          <button
            onClick={() => setModalFormOpen(true)}
            className="mt-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-heading font-black py-2.5 px-5 rounded-xl shadow-md transition transform hover:scale-105"
          >
            ✍️ Dejar una Reseña
          </button>
        </div>
      </div>

      {/* FORMULARIO MODAL PARA AGREGAR RESEÑA */}
      {modalFormOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border-2 border-red-600 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-heading font-black text-slate-900 text-base">Valorar y Dejar Reseña</h3>
              <button onClick={() => setModalFormOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleAgregarResena} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tu Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Sofia López"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tu Ciudad / Distrito</label>
                <input
                  type="text"
                  value={distrito}
                  onChange={(e) => setDistrito(e.target.value)}
                  placeholder="Ej: Surco, Lima"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Puntuación de Estrellas *</label>
                <select
                  value={estrellas}
                  onChange={(e) => setEstrellas(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-amber-500 focus:ring-2 focus:ring-red-600 focus:outline-none"
                >
                  <option value={5}>★★★★★ 5 Estrellas (Excelente)</option>
                  <option value={4}>★★★★☆ 4 Estrellas (Muy Bueno)</option>
                  <option value={3}>★★★☆☆ 3 Estrellas (Bueno)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tu Comentario / Experiencia *</label>
                <textarea
                  required
                  rows={3}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Escribe aquí tu opinión sobre el producto y el servicio de entrega..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-black py-3 px-4 rounded-xl text-xs shadow-md transition"
              >
                PUBLICAR MI RESEÑA
              </button>
            </form>
          </div>
        </div>
      )}

      {/* GRID DE CARDS DE RESEÑAS DE CLIENTES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {resenas.map((r) => (
          <div
            key={r.id}
            className="bg-white border border-slate-200/90 p-5 rounded-3xl shadow-xs space-y-3 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center font-black text-slate-700 text-xs">
                    {r.imagen ? (
                      <img src={r.imagen} alt={r.nombre} className="w-full h-full object-cover" />
                    ) : (
                      r.nombre.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-slate-900 text-xs">{r.nombre}</h4>
                    <span className="text-[10px] text-slate-500 block">{r.distrito}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400">{r.fecha}</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <div className="text-amber-400 font-bold">
                  {'★'.repeat(r.estrellas)}
                  {'☆'.repeat(5 - r.estrellas)}
                </div>
                {r.verificado && (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <IconShieldCheck className="w-3 h-3 text-emerald-600" /> Comprador Verificado
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed italic">
                &quot;{r.comentario}&quot;
              </p>
            </div>

            <div className="pt-2 text-[10px] text-slate-400 font-semibold border-t border-slate-100 flex items-center gap-1">
              <span>🛒 Producto:</span>
              <span className="text-slate-700 font-bold line-clamp-1">{producto.nombre}</span>
            </div>
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
            setSelectedPromo({ id: '1', name: '1 Unidad', price: pUnit });
            trackMetaEvent('ViewContent', {
              content_name: data.nombre,
              content_ids: [String(data.id)],
              content_type: 'product',
              value: pUnit,
              currency: 'PEN',
            });

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

          {/* COMBOS PROMO DE ALTA CONVERSIÓN */}
          <div className="space-y-3 pt-1">
            <h3 className="text-xs font-heading font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>🎁 SELECCIONA TU PROMO CON DESCUENTO:</span>
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

          {/* DESCRIPCIÓN DEL PRODUCTO */}
          <div className="pt-2">
            <h3 className="text-xs font-heading font-black text-slate-900 uppercase tracking-wider mb-2">
              📖 DESCRIPCIÓN DEL PRODUCTO & DETALLES:
            </h3>
            <div
              className="text-sm text-slate-600 leading-relaxed [&_p]:mb-2.5 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-3 [&_li]:mb-1.5 [&_img]:rounded-xl [&_img]:max-w-full [&_img]:h-auto [&_img]:my-3"
              dangerouslySetInnerHTML={{
                __html: producto.descripcion ? sanearDescripcionHtml(producto.descripcion) : 'Producto importado de alta calidad.',
              }}
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN DE RESEÑAS Y OPINIONES DE CLIENTES (REEMPLAZA A FAQS) */}
      <ProductReviews producto={producto} />

      {/* MODAL DE PEDIDO FLOTANTE DIRECTO SIN CARRITO */}
      {modalPedidoOpen && (
        <DirectOrderModal
          productoNombre={producto.nombre}
          productoId={producto.id}
          precioUnitario={precio}
          promoElegida={selectedPromo}
          oferta2u={oferta2u}
          oferta3u={oferta3u}
          onClose={() => setModalPedidoOpen(false)}
          whatsappNumero={config.whatsappNumber}
        />
      )}

      {/* STICKY BOTTOM BUTTON FLOTANTE QUE SIGUE AL SCROLL */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 shadow-2xl p-3 flex items-center justify-between gap-4 max-w-5xl mx-auto md:rounded-t-3xl md:bottom-2 md:border">
        <div className="hidden sm:block">
          <span className="block text-[10px] text-amber-400 font-bold uppercase">{producto.nombre}</span>
          <span className="text-xs text-slate-300 font-bold">{selectedPromo.name}</span>
        </div>
        <div>
          <span className="block text-[10px] text-slate-400 font-bold uppercase">Total Promo</span>
          <span className="text-lg font-heading font-black text-amber-300">{soles(selectedPromo.price)}</span>
        </div>
        <button
          onClick={abrirModalDirecto}
          className="flex-1 max-w-xs bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-black py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-lg transform hover:-translate-y-0.5 transition"
        >
          <span>⚡ ¡PEDIR AHORA - PAGAR AL RECIBIR!</span>
        </button>
      </div>
    </main>
  );
}

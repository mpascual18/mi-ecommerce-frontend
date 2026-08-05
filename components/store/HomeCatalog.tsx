'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { useCart, soles } from './CartContext';
import { FALLBACK_IMAGE, Producto, precioDe, precioAnteriorDe, productoHref } from './constants';
import { IconShieldCheck, IconTag, IconHome, IconLock, IconTruck, IconHeadset, IconPackageSearch, IconWhatsapp } from './Icons';

const TRUST_ITEMS = [
  { Icon: IconTruck, label: 'Pago Contra Entrega', desc: 'Pagas en efectivo, Yape o Plin al recibir en Lima' },
  { Icon: IconShieldCheck, label: 'Garantía 100% P&R', desc: 'Calidad comprobada e importación directa' },
  { Icon: IconPackageSearch, label: 'Envíos a Todo Perú', desc: 'Despachos diarios por Shalom, Olva & Marvisur' },
  { Icon: IconHeadset, label: 'Atención 24/7', desc: 'Soporte personalizado directo en WhatsApp' },
];

const HERO_SLIDES = [
  {
    id: '1',
    image: '/images/hero/hero-family.png',
    tagline: '🔥 TIENDA OFICIAL P&R STORE • LIMA & PROVINCIAS',
    title: 'Calidad premium que transformará tu hogar',
    subtitle: 'Importación directa con garantía comprobada. Los productos más innovadores para cocina, hogar y bienestar con envío express y pago contra entrega.',
  },
  {
    id: '2',
    image: '/images/hero/hero-delivery.png',
    tagline: '🚚 PAGO CONTRA ENTREGA EN LIMA & ENVÍOS NACIONALES',
    title: 'Miles de clientes felices recibiendo sus compras',
    subtitle: 'Compra con total seguridad. Pagas al recibir en tu puerta en Lima, o despacho express a todo el Perú por Shalom, Olva y Marvisur.',
  },
  {
    id: '3',
    image: '/images/hero/hero-kitchen.png',
    tagline: '⭐ GARANTÍA Y SATISFACCIÓN 100% COMPROBADA',
    title: 'Productos de importación directa al mejor precio',
    subtitle: 'Innovación, durabilidad y practicidad para el día a día de tu familia. ¡Haz tu pedido ahora y paga al recibir!',
  },
];

export default function HomeCatalog() {
  const { config, addToCart, setCartOpen } = useCart();
  const searchParams = useSearchParams();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categoria, setCategoria] = useState('Todos');
  const [busqueda, setBusqueda] = useState(searchParams.get('q') || '');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/productos`);
        const data = await res.json();
        if (Array.isArray(data)) setProductos(data);
      } catch (err) {
        console.warn('No se pudo cargar catálogo de productos:', err);
      }
      setCargando(false);
    })();
  }, []);

  useEffect(() => {
    setBusqueda(searchParams.get('q') || '');
  }, [searchParams]);

  const categorias = useMemo(() => {
    const set = new Set<string>();
    productos.forEach((p) => set.add(p.categoria || 'General'));
    return ['Todos', ...Array.from(set)];
  }, [productos]);

  const productosFiltrados = useMemo(() => {
    let lista = productos;
    if (categoria !== 'Todos') {
      lista = lista.filter((p) => (p.categoria || 'General') === categoria);
    }
    const q = busqueda.trim().toLowerCase();
    if (q) {
      lista = lista.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(q) ||
          (p.categoria || '').toLowerCase().includes(q) ||
          (p.descripcion || '').toLowerCase().includes(q)
      );
    }
    return lista;
  }, [productos, categoria, busqueda]);

  const productoDestacado = productos.find((p) => p.badge && p.badge !== 'SIN BADGE') || productos[0];
  const slides = (config.heroSlides && config.heroSlides.length > 0) ? config.heroSlides : HERO_SLIDES;
  const slideActivo = slides[currentSlide % slides.length] || slides[0];

  const opacidadCapas = (config.heroOverlayOpacity !== undefined ? config.heroOverlayOpacity : 40) / 100;
  const estiloDegradado = config.heroOverlayGradient || 'slate';

  return (
    <>
      {/* 🌟 HERO SHOWCASE DINÁMICO CON CARRUSEL DE CLIENTES Y AMBIENTE REAL 🌟 */}
      <section className="relative bg-slate-950 text-white py-14 md:py-24 px-4 shadow-2xl overflow-hidden min-h-[580px] flex items-center">
        
        {/* IMÁGENES DE FONDO DEL CARRUSEL (CROSSFADE TRANSITION) */}
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out bg-cover bg-center ${
              index === (currentSlide % slides.length) ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            style={{ backgroundImage: `url(${slide.image})` }}
          />
        ))}

        {/* OVERLAY GRADIENTE DE OPACIDAD CONFIGURABLE (AJUSTABLE DESDE EL EDITOR) */}
        <div
          className={`absolute inset-0 backdrop-blur-[1px] transition-opacity duration-300 ${
            estiloDegradado === 'red-dark'
              ? 'bg-gradient-to-r from-slate-950 via-red-950/80 to-slate-950/60'
              : estiloDegradado === 'gold-luxury'
              ? 'bg-gradient-to-r from-slate-950 via-amber-950/80 to-slate-950/60'
              : estiloDegradado === 'clear'
              ? 'bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-transparent'
              : 'bg-gradient-to-r from-slate-950 via-slate-950/75 to-slate-950/50'
          }`}
          style={{ opacity: opacidadCapas }}
        />
        
        {/* GLOW ACCENTS */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10 w-full">
          
          {/* TEXTO HERO IZQUIERDO CON TRANSICIÓN */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/30 to-amber-500/30 border border-amber-400/50 text-amber-300 text-xs font-heading font-black uppercase tracking-widest px-4 py-2 rounded-full backdrop-blur-md shadow-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span>{slideActivo.tagline}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-black leading-tight tracking-tight drop-shadow-md">
              {slideActivo.title.includes('transformará') ? (
                <>
                  Calidad premium que <span className="bg-gradient-to-r from-red-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent">transformará tu hogar</span>.
                </>
              ) : (
                slideActivo.title
              )}
            </h1>

            <p className="text-base md:text-lg text-slate-200 max-w-xl font-medium leading-relaxed mx-auto lg:mx-0 drop-shadow-sm">
              {slideActivo.subtitle}
            </p>

            {/* BOTONES ACCIÓN HERO */}
            <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-4">
              <a
                href="#catalogo"
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-heading font-black text-sm py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5"
              >
                <span>⚡ VER CATÁLOGO DE OFERTAS</span>
              </a>
              <a
                href={`https://wa.me/${config.whatsappNumber}?text=Hola%20P%26R%20Store%2C%20quiero%20hacer%20un%20pedido`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600/90 hover:bg-emerald-600 text-white font-heading font-black text-sm py-4 px-7 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-emerald-400/30 flex items-center gap-2.5"
              >
                <IconWhatsapp className="w-5 h-5 text-white" />
                <span>PEDIR POR WHATSAPP</span>
              </a>
            </div>

            {/* CONTROLES / DOTS DEL CARRUSEL */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === (currentSlide % slides.length) ? 'w-8 bg-amber-400' : 'w-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                  title={`Ver imagen ${idx + 1}`}
                />
              ))}
            </div>

            {/* BADGES INFERIORES */}
            <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-3 text-xs font-bold text-slate-200">
              <span className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 flex items-center gap-2 shadow-sm">
                <IconTruck className="w-4 h-4 text-amber-400" /> Contra Entrega Lima
              </span>
              <span className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 flex items-center gap-2 shadow-sm">
                <IconShieldCheck className="w-4 h-4 text-emerald-400" /> Garantía Directa
              </span>
              <span className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 flex items-center gap-2 shadow-sm">
                <IconTag className="w-4 h-4 text-red-400" /> Precios de Importación
              </span>
            </div>
          </div>

          {/* TARJETA PRODUCTO DESTACADO (DERECHA) */}
          {productoDestacado && (
            <div className="lg:col-span-5">
              <div className="relative bg-white/10 backdrop-blur-xl border-2 border-amber-400/40 p-6 rounded-3xl shadow-2xl space-y-4 hover:border-amber-400 transition duration-300">
                <span className="absolute -top-3.5 left-6 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-heading font-black text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                  ⭐ PRODUCTO DESTACADO DEL DÍA
                </span>

                <Link href={productoHref(productoDestacado)} className="block group">
                  <div className="relative w-full h-64 rounded-2xl bg-white/95 overflow-hidden flex items-center justify-center p-4 border border-white/20 shadow-inner">
                    <img
                      src={productoDestacado.imagen_url || FALLBACK_IMAGE}
                      alt={productoDestacado.nombre}
                      className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute bottom-3 right-3 bg-red-600 text-white font-heading font-black text-[11px] px-3 py-1 rounded-full uppercase shadow-md">
                      PAGO CONTRA ENTREGA
                    </span>
                  </div>

                  <div className="pt-3 space-y-1">
                    <h3 className="text-lg font-heading font-black text-white group-hover:text-amber-300 transition line-clamp-1">
                      {productoDestacado.nombre}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2">{productoDestacado.descripcion}</p>
                  </div>
                </Link>

                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <div>
                    <span className="text-3xl font-heading font-black text-amber-300">{soles(precioDe(productoDestacado))}</span>
                    {precioAnteriorDe(productoDestacado) && (
                      <span className="text-xs text-slate-400 line-through ml-2 font-bold">{soles(precioAnteriorDe(productoDestacado)!)}</span>
                    )}
                  </div>

                  <Link
                    href={productoHref(productoDestacado)}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-heading font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-lg transition"
                  >
                    VER DETALLES →
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 🛡️ SECCIÓN DE CONFIANZA / BENEFICIOS */}
      <section className="bg-white border-y border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_ITEMS.map(({ Icon, label, desc }) => (
              <div
                key={label}
                className="p-5 bg-slate-50 rounded-2xl border border-slate-200/90 hover:border-red-500 hover:shadow-lg transition-all duration-300 space-y-2 group"
              >
                <div className="w-12 h-12 bg-red-100 text-brand-red rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-black text-sm text-slate-900">{label}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🛍️ SECCIÓN DEL CATÁLOGO DE PRODUCTOS */}
      <main id="catalogo" className="max-w-7xl mx-auto px-4 py-12 flex-1 w-full space-y-8">
        
        {/* TITULO DE SECCION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <span className="text-xs font-heading font-black text-red-600 uppercase tracking-widest block">CATÁLOGO EXCLUSIVO</span>
            <h2 className="text-2xl md:text-3xl font-heading font-black text-slate-900 mt-1">Explora Nuestros Productos</h2>
          </div>

          {/* BUSCADOR MOVIL */}
          <div className="md:hidden">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full bg-slate-100 border border-slate-300 text-xs rounded-full py-2.5 px-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="text-xs text-slate-500 font-bold hidden md:block">
            Mostrando <span className="text-slate-900 font-black">{productosFiltrados.length}</span> productos seleccionados
          </div>
        </div>

        {/* FILTROS POR CATEGORIA */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              className={`font-heading font-black text-xs px-6 py-3 rounded-full whitespace-nowrap transition-all shadow-2xs ${
                categoria === cat
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-red-500 hover:text-red-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRID DE TARJETAS DE PRODUCTO */}
        {cargando ? (
          <div className="py-20 text-center space-y-3 text-slate-400 font-bold">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p>Cargando productos de P&R Store...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <IconPackageSearch className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-600">No se encontraron productos en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
            {productosFiltrados.map((p) => {
              const precio = precioDe(p);
              const anterior = precioAnteriorDe(p);
              const descuento = anterior ? Math.round(((anterior - precio) / anterior) * 100) : 0;
              const stockRestante = p.stock || 5;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1.5"
                >
                  {/* IMAGEN Y BADGES */}
                  <Link href={productoHref(p)} className="relative overflow-hidden bg-slate-50 block pt-[80%]">
                    {p.badge && p.badge !== 'SIN BADGE' && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-heading font-black px-2.5 py-1 rounded-md uppercase z-10 shadow-xs">
                        {p.badge}
                      </span>
                    )}
                    {descuento > 0 && (
                      <span className="absolute top-3 right-3 bg-amber-400 text-slate-950 text-[10px] font-heading font-black px-2.5 py-1 rounded-md z-10 shadow-xs">
                        -{descuento}% OFF
                      </span>
                    )}
                    <img
                      src={p.imagen_url || FALLBACK_IMAGE}
                      alt={p.nombre}
                      className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* CONTENIDO TARJETA */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>{p.categoria || 'General'}</span>
                        <span className="text-amber-500 font-bold">★ 4.9</span>
                      </div>
                      
                      <Link href={productoHref(p)} className="font-heading font-black text-slate-900 text-xs sm:text-sm line-clamp-2 hover:text-red-600 transition block">
                        {p.nombre}
                      </Link>

                      {/* BARRA DE ESCASEZ DE STOCK */}
                      <div className="pt-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                          <span className="text-red-600 font-black">🔥 Stock Limitado</span>
                          <span className="text-slate-500">{stockRestante} unids quedantes</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(25, stockRestante * 12))}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* PRECIOS Y BOTONES */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-heading font-black text-red-600">{soles(precio)}</span>
                        {anterior && <span className="text-xs text-slate-400 line-through font-semibold">{soles(anterior)}</span>}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => addToCart({ id: p.id, title: p.nombre, price: precio, image: p.imagen_url || FALLBACK_IMAGE }, 1)}
                          className="w-full bg-slate-900 hover:bg-black text-white text-[11px] font-bold py-2.5 px-2 rounded-xl transition flex items-center justify-center gap-1 shadow-2xs"
                        >
                          + Agregar
                        </button>
                        <Link
                          href={productoHref(p)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white text-[11px] font-heading font-extrabold py-2.5 px-2 rounded-xl transition text-center shadow-2xs"
                        >
                          Ver Oferta
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}

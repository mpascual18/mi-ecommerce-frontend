'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import { useCart, soles } from './CartContext';
import { FALLBACK_IMAGE, Producto, precioDe, precioAnteriorDe, productoHref } from './constants';
import { IconShieldCheck, IconTag, IconHome, IconLock, IconTruck, IconHeadset, IconPackageSearch } from './Icons';

const TRUST_ITEMS = [
  { Icon: IconShieldCheck, label: 'Productos de calidad' },
  { Icon: IconTag, label: 'Precios justos' },
  { Icon: IconHome, label: 'Variedad para tu hogar' },
  { Icon: IconLock, label: 'Compra segura' },
  { Icon: IconTruck, label: 'Envíos a todo el país' },
  { Icon: IconHeadset, label: 'Atención cercana' },
];

export default function HomeCatalog() {
  const { config, addToCart } = useCart();
  const searchParams = useSearchParams();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categoria, setCategoria] = useState('Todos');
  const [busqueda, setBusqueda] = useState(searchParams.get('q') || '');

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

  return (
    <>
      {/* HERO */}
      <section
        className="text-white py-12 md:py-16 px-4 shadow-xl relative overflow-hidden"
        style={
          config.heroBannerUrl
            ? { backgroundImage: `linear-gradient(to right, rgba(51,51,51,0.88), rgba(163,50,64,0.82)), url(${config.heroBannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: 'linear-gradient(120deg, #333333, #7D2530, #A33240)' }
        }
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 text-brand-gold text-xs font-heading font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-brand-gold/30">
              <span>✨ IMPORTACIÓN DIRECTA</span>
              <span>•</span>
              <span>PRECIOS JUSTOS</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black leading-tight tracking-tight">{config.heroTitle}</h1>

            <p className="text-sm md:text-base text-slate-200 max-w-xl font-normal leading-relaxed mx-auto lg:mx-0">{config.heroSubtitle}</p>

            <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-2.5 text-xs font-bold text-brand-grafito">
              <span className="bg-white/95 px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1.5"><IconShieldCheck className="w-3.5 h-3.5 text-brand-red" /> Calidad</span>
              <span className="bg-white/95 px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1.5"><IconHome className="w-3.5 h-3.5 text-brand-red" /> Variedad</span>
              <span className="bg-white/95 px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1.5"><IconLock className="w-3.5 h-3.5 text-brand-red" /> Confianza</span>
              <span className="bg-white/95 px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1.5"><IconHeadset className="w-3.5 h-3.5 text-brand-red" /> Cercanía</span>
            </div>
          </div>

          {productoDestacado && (
            <Link
              href={productoHref(productoDestacado)}
              className="lg:col-span-5 bg-white text-brand-grafito p-6 rounded-3xl shadow-2xl border-2 border-brand-gold space-y-4 store-gold-glow block hover:-translate-y-1 transition-transform"
            >
              <div className="flex justify-between items-start gap-2">
                <span className="bg-brand-red text-white text-[10px] font-heading font-black uppercase px-3 py-1 rounded-full shadow-xs">⭐ Producto del Día</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full whitespace-nowrap">Pago Contra Entrega</span>
              </div>

              <div className="flex gap-4 items-center">
                <img src={productoDestacado.imagen_url || FALLBACK_IMAGE} alt={productoDestacado.nombre} className="w-24 h-24 object-cover rounded-2xl border border-slate-200" />
                <div>
                  <h3 className="text-base font-heading font-bold text-brand-grafito line-clamp-2">{productoDestacado.nombre}</h3>
                  <p className="text-xs text-brand-grismedio mt-1 line-clamp-2">{productoDestacado.descripcion}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <div>
                  <span className="text-2xl font-heading font-black text-brand-red">{soles(precioDe(productoDestacado))}</span>
                  {precioAnteriorDe(productoDestacado) && <span className="text-xs text-slate-400 line-through ml-1.5">{soles(precioAnteriorDe(productoDestacado)!)}</span>}
                </div>
                <span className="bg-brand-red text-white font-heading font-extrabold text-xs px-5 py-3 rounded-2xl shadow-md">Ver Producto →</span>
              </div>
            </Link>
          )}
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="bg-white border-y border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          <h3 className="text-center text-xs font-heading font-black text-brand-red uppercase tracking-widest">Lo que ofrecemos en {config.storeName}</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            {TRUST_ITEMS.map(({ Icon, label }) => (
              <div key={label} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-brand-gold transition duration-300 space-y-2">
                <div className="w-11 h-11 bg-red-50 text-brand-red rounded-2xl flex items-center justify-center mx-auto">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-heading font-bold text-xs text-brand-grafito">{label}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATALOGO */}
      <main className="max-w-7xl mx-auto px-4 py-10 flex-1 w-full space-y-8">
        <div className="md:hidden">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="¿Qué buscas?..."
            className="w-full bg-slate-100 border border-slate-200 text-xs rounded-full py-2.5 px-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
        </div>

        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-3 border-b border-slate-200">
          <div className="flex gap-2.5">
            {categorias.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoria(cat)}
                className={`font-heading font-bold text-xs px-5 py-2.5 rounded-full whitespace-nowrap transition ${
                  categoria === cat ? 'bg-brand-red text-white shadow-xs' : 'bg-white border border-slate-200 text-brand-grafito hover:border-brand-red'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="text-xs text-brand-grismedio font-semibold hidden md:block whitespace-nowrap">
            Mostrando <span className="font-bold text-brand-grafito">{productosFiltrados.length}</span> productos
          </div>
        </div>

        {cargando ? (
          <div className="py-16 text-center text-sm font-bold text-slate-400">Cargando catálogo...</div>
        ) : productosFiltrados.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <IconPackageSearch className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-500">No se encontraron productos en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
            {productosFiltrados.map((p) => {
              const precio = precioDe(p);
              const anterior = precioAnteriorDe(p);
              const descuento = anterior ? Math.round(((anterior - precio) / anterior) * 100) : 0;
              return (
                <div key={p.id} className="store-luxury-card bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs flex flex-col justify-between">
                  <Link href={productoHref(p)} className="relative overflow-hidden bg-slate-100 block">
                    {p.badge && p.badge !== 'SIN BADGE' && (
                      <span className="absolute top-3 left-3 bg-brand-red text-white text-[10px] font-heading font-extrabold px-2.5 py-1 rounded-md uppercase z-10 shadow-xs">{p.badge}</span>
                    )}
                    {descuento > 0 && (
                      <span className="absolute top-3 right-3 bg-brand-gold text-brand-grafito text-[10px] font-heading font-black px-2.5 py-1 rounded-md z-10 shadow-xs">-{descuento}% OFF</span>
                    )}
                    <img src={p.imagen_url || FALLBACK_IMAGE} alt={p.nombre} className="store-img-zoom w-full h-52 sm:h-60 object-cover" />
                  </Link>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.categoria || 'General'}</span>
                      <Link href={productoHref(p)} className="font-heading font-bold text-brand-grafito text-xs sm:text-sm line-clamp-2 hover:text-brand-red transition block">
                        {p.nombre}
                      </Link>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-heading font-black text-brand-red">{soles(precio)}</span>
                        {anterior && <span className="text-xs text-slate-400 line-through">{soles(anterior)}</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => addToCart({ id: p.id, title: p.nombre, price: precio, image: p.imagen_url || FALLBACK_IMAGE }, 1)}
                          className="w-full bg-brand-grafito hover:bg-slate-800 text-white text-[11px] font-bold py-2.5 px-2 rounded-xl transition"
                        >
                          + Agregar
                        </button>
                        <Link
                          href={productoHref(p)}
                          className="w-full bg-brand-red hover:bg-brand-darkred text-white text-[11px] font-heading font-extrabold py-2.5 px-2 rounded-xl transition text-center"
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

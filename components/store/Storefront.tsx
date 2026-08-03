'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

type Producto = {
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

type StoreConfig = {
  whatsappNumber: string;
  storeName: string;
  storeSub: string;
  announcementText: string;
  logoUrl: string;
  tickerBgColor: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBannerUrl: string;
};

type CartItem = {
  id: number | string;
  title: string;
  price: number;
  image: string;
  qty: number;
};

const DEFAULT_CONFIG: StoreConfig = {
  whatsappNumber: '51992001002',
  storeName: 'P&R Store',
  storeSub: 'Calidad que te acompaña.',
  announcementText: '🔥 ¡OFERTA POR TIEMPO LIMITADO! PAGO CONTRA ENTREGA EN LIMA Y ENVÍOS A TODO EL PERÚ 🚛',
  logoUrl: '',
  tickerBgColor: '#0F172A',
  heroTitle: 'Calidad que te acompaña en tu día a día.',
  heroSubtitle: 'En P&R Store seleccionamos lo mejor en tendencias para el hogar, cocina, tecnología y bienestar con garantía comprobada.',
  heroBannerUrl: '',
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?q=80&w=800&auto=format&fit=crop';

function soles(n: number) {
  return `S/. ${Number(n || 0).toFixed(2)}`;
}

export default function Storefront() {
  const [config, setConfig] = useState<StoreConfig>(DEFAULT_CONFIG);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categoria, setCategoria] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [modalProducto, setModalProducto] = useState<Producto | null>(null);
  const [modalQty, setModalQty] = useState(1);

  const [checkoutForm, setCheckoutForm] = useState({
    nombre: '',
    celular: '',
    distrito: '',
    direccion: '',
    regionTipo: 'lima' as 'lima' | 'provincia',
    metodoPago: 'contra_entrega',
  });
  const [enviando, setEnviando] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/configuracion`);
        const data = await res.json();
        if (data) setConfig((prev) => ({ ...prev, ...data }));
      } catch (err) {
        console.warn('No se pudo cargar configuración de tienda:', err);
      }
      try {
        const res = await fetch(`${API_URL}/api/productos`);
        const data = await res.json();
        if (Array.isArray(data)) setProductos(data);
      } catch (err) {
        console.warn('No se pudo cargar catálogo de productos:', err);
      }
      setCargando(false);
    })();

    try {
      const savedCart = localStorage.getItem('pyr_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('pyr_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

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

  const totalCarrito = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
  const totalUnidades = cart.reduce((acc, i) => acc + i.qty, 0);

  function precioDe(p: Producto) {
    return Number(p.price_oferta || p.price_soles || 0);
  }
  function precioAnteriorDe(p: Producto) {
    return p.price_oferta ? Number(p.price_soles) : null;
  }

  function agregarAlCarrito(p: Producto, qty = 1) {
    setCart((prev) => {
      const existente = prev.find((i) => String(i.id) === String(p.id));
      if (existente) {
        return prev.map((i) => (String(i.id) === String(p.id) ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { id: p.id, title: p.nombre, price: precioDe(p), image: p.imagen_url || FALLBACK_IMAGE, qty }];
    });
    setCartOpen(true);
  }

  function actualizarCantidad(id: number | string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (String(i.id) === String(id) ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }

  function abrirModal(p: Producto) {
    setModalProducto(p);
    setModalQty(1);
  }

  async function confirmarPedido() {
    if (cart.length === 0) return;
    const { nombre, celular, distrito, direccion, regionTipo, metodoPago } = checkoutForm;
    if (!nombre.trim() || !celular.trim() || !distrito.trim() || !direccion.trim()) {
      alert('Por favor completa nombre, celular, distrito/ciudad y dirección.');
      return;
    }

    setEnviando(true);
    const provincia = regionTipo === 'lima' ? 'Lima' : distrito;

    try {
      await fetch(`${API_URL}/api/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          celular,
          direccion,
          distrito,
          provincia,
          total: totalCarrito,
          origen: 'tienda_web',
          metodo_pago: metodoPago,
          items: cart.map((i) => ({ producto_id: i.id, cantidad: i.qty, precio_unitario: i.price })),
        }),
      });
    } catch (err) {
      console.warn('No se pudo registrar el pedido en el sistema, se continúa por WhatsApp:', err);
    }

    const itemsFormateados = cart.map((i) => `• ${i.title} (x${i.qty}) - ${soles(i.price * i.qty)}`).join('\n');
    const mensaje = `🛒 *NUEVO PEDIDO - P&R STORE*\n----------------------------------------\n📦 *PRODUCTOS:*\n${itemsFormateados}\n\n----------------------------------------\n💰 *TOTAL:* ${soles(totalCarrito)}\n🚚 *ZONA:* ${regionTipo === 'lima' ? 'Lima Metropolitana' : 'Provincia'}\n💳 *MÉTODO DE PAGO:* ${metodoPago}\n\n👤 *DATOS DEL CLIENTE:*\n• Nombre: ${nombre}\n• Teléfono: ${celular}\n• Distrito/Ciudad: ${distrito}\n• Dirección: ${direccion}\n\n----------------------------------------\nPor favor confirmar stock y horario de despacho.`;

    window.open(`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(mensaje)}`, '_blank');

    setPedidoConfirmado(true);
    setCart([]);
    setEnviando(false);
    setTimeout(() => {
      setPedidoConfirmado(false);
      setCartOpen(false);
    }, 2500);
  }

  return (
    <div className="store-root bg-[#F8FAFC] text-brand-grafito min-h-screen flex flex-col font-sans antialiased">
      {/* TICKER */}
      <div style={{ backgroundColor: config.tickerBgColor }} className="text-white text-xs py-2.5 overflow-hidden border-b border-brand-gold/30 relative z-40">
        <div className="store-ticker-track flex whitespace-nowrap font-medium tracking-wider">
          {[0, 1].map((rep) => (
            <span key={rep} className="flex">
              <span className="mx-6 flex items-center gap-2">✦ <strong className="text-brand-gold">{config.storeName}:</strong> {config.storeSub}</span>
              <span className="mx-6 text-gray-300">|</span>
              <span className="mx-6 flex items-center gap-2">{config.announcementText}</span>
              <span className="mx-6 text-gray-300">|</span>
            </span>
          ))}
        </div>
      </div>

      {/* HEADER */}
      <header className="store-glass-header border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-brand-red flex items-center justify-center text-white shadow-md p-2 shrink-0 overflow-hidden">
              {config.logoUrl ? (
                <img src={config.logoUrl} alt={config.storeName} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <span className="font-heading font-black text-lg">P&R</span>
              )}
            </div>
            <div>
              <span className="text-xl md:text-2xl font-heading font-black text-brand-red tracking-tight block leading-none">
                {config.storeName.replace('Store', '').trim()} <span className="text-brand-charcoal">Store</span>
              </span>
              <span className="text-[11px] text-brand-red uppercase tracking-wider block font-semibold mt-1">{config.storeSub}</span>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-6 relative">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="¿Qué buscas para tu hogar o cocina?..."
              className="w-full bg-slate-100 border border-slate-200 text-xs rounded-full py-2.5 pl-4 pr-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red shadow-inner transition"
            />
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-brand-grafito hover:text-brand-red bg-slate-100 hover:bg-slate-200/70 px-4 py-2.5 rounded-full transition border border-slate-200"
            >
              <span>🔑</span>
              <span>Acceso al Sistema</span>
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="relative bg-brand-red hover:bg-brand-darkred text-white p-2.5 md:px-5 md:py-2.5 rounded-full font-bold text-xs md:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition"
            >
              <span>🛍️</span>
              <span className="hidden md:inline font-heading tracking-wide">Carrito</span>
              <span className="bg-brand-gold text-brand-charcoal text-xs font-black px-2 py-0.5 rounded-full shadow-xs">{totalUnidades}</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section
        className="text-white py-12 md:py-16 px-4 shadow-xl relative overflow-hidden"
        style={
          config.heroBannerUrl
            ? { backgroundImage: `linear-gradient(to right, rgba(15,23,42,0.88), rgba(163,50,64,0.82)), url(${config.heroBannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: 'linear-gradient(to right, #0F172A, #721C26, #A33240)' }
        }
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 text-brand-gold text-xs font-heading font-bold uppercase tracking-widest px-4 py-1.5 rounded-full border border-brand-gold/30">
              <span>✨ IMPORTACIÓN DIRECTA</span>
              <span>•</span>
              <span>PRECIOS JUSTOS</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-black leading-tight tracking-tight">
              {config.heroTitle}
            </h1>

            <p className="text-sm md:text-base text-slate-200 max-w-xl font-normal leading-relaxed mx-auto lg:mx-0">
              {config.heroSubtitle}
            </p>

            <div className="pt-2 flex flex-wrap justify-center lg:justify-start gap-2.5 text-xs font-bold text-brand-charcoal">
              <span className="bg-white/95 px-3.5 py-1.5 rounded-full shadow-xs">✅ Calidad</span>
              <span className="bg-white/95 px-3.5 py-1.5 rounded-full shadow-xs">🗂️ Variedad</span>
              <span className="bg-white/95 px-3.5 py-1.5 rounded-full shadow-xs">🛡️ Confianza</span>
              <span className="bg-white/95 px-3.5 py-1.5 rounded-full shadow-xs">❤️ Cercanía</span>
            </div>
          </div>

          {productoDestacado && (
            <div className="lg:col-span-5 bg-white text-brand-grafito p-6 rounded-3xl shadow-2xl border-2 border-brand-gold space-y-4 store-gold-glow">
              <div className="flex justify-between items-start gap-2">
                <span className="bg-brand-red text-white text-[10px] font-heading font-black uppercase px-3 py-1 rounded-full shadow-xs">
                  ⭐ Producto del Día
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  Pago Contra Entrega
                </span>
              </div>

              <div className="flex gap-4 items-center">
                <img
                  src={productoDestacado.imagen_url || FALLBACK_IMAGE}
                  alt={productoDestacado.nombre}
                  className="w-24 h-24 object-cover rounded-2xl border border-slate-200"
                />
                <div>
                  <h3 className="text-base font-heading font-bold text-brand-charcoal line-clamp-2">{productoDestacado.nombre}</h3>
                  <p className="text-xs text-brand-grismedio mt-1 line-clamp-2">{productoDestacado.descripcion}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <div>
                  <span className="text-2xl font-heading font-black text-brand-red">{soles(precioDe(productoDestacado))}</span>
                  {precioAnteriorDe(productoDestacado) && (
                    <span className="text-xs text-slate-400 line-through ml-1.5">{soles(precioAnteriorDe(productoDestacado)!)}</span>
                  )}
                </div>
                <button
                  onClick={() => abrirModal(productoDestacado)}
                  className="bg-brand-red hover:bg-brand-darkred text-white font-heading font-extrabold text-xs px-5 py-3 rounded-2xl transition flex items-center gap-2 shadow-md"
                >
                  <span>🛍️</span>
                  <span>COMPRAR EN 1 CLIC</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="bg-white border-y border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          <h3 className="text-center text-xs font-heading font-black text-brand-red uppercase tracking-widest">
            Lo que ofrecemos en {config.storeName}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
            {[
              ['🛡️', 'Productos de calidad'],
              ['🏷️', 'Precios justos'],
              ['🏠', 'Variedad para tu hogar'],
              ['🔒', 'Compra segura'],
              ['🚚', 'Envíos a todo el país'],
              ['🎧', 'Atención cercana'],
            ].map(([icon, label]) => (
              <div key={label} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-brand-gold transition duration-300 space-y-2">
                <div className="w-11 h-11 bg-red-50 text-brand-red rounded-2xl flex items-center justify-center mx-auto text-xl">{icon}</div>
                <h4 className="font-heading font-bold text-xs text-brand-charcoal">{label}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATALOGO */}
      <main className="max-w-7xl mx-auto px-4 py-10 flex-1 w-full space-y-8">
        {/* Buscador móvil */}
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
            Mostrando <span className="font-bold text-brand-charcoal">{productosFiltrados.length}</span> productos
          </div>
        </div>

        {cargando ? (
          <div className="py-16 text-center text-sm font-bold text-slate-400">Cargando catálogo...</div>
        ) : productosFiltrados.length === 0 ? (
          <div className="py-16 text-center space-y-3">
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
                  <div className="relative overflow-hidden bg-slate-100 cursor-pointer" onClick={() => abrirModal(p)}>
                    {p.badge && p.badge !== 'SIN BADGE' && (
                      <span className="absolute top-3 left-3 bg-brand-red text-white text-[10px] font-heading font-extrabold px-2.5 py-1 rounded-md uppercase z-10 shadow-xs">
                        {p.badge}
                      </span>
                    )}
                    {descuento > 0 && (
                      <span className="absolute top-3 right-3 bg-brand-gold text-brand-charcoal text-[10px] font-heading font-black px-2.5 py-1 rounded-md z-10 shadow-xs">
                        -{descuento}% OFF
                      </span>
                    )}
                    <img src={p.imagen_url || FALLBACK_IMAGE} alt={p.nombre} className="store-img-zoom w-full h-52 sm:h-60 object-cover" />
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.categoria || 'General'}</span>
                      <h3
                        onClick={() => abrirModal(p)}
                        className="font-heading font-bold text-brand-charcoal text-xs sm:text-sm line-clamp-2 hover:text-brand-red cursor-pointer transition"
                      >
                        {p.nombre}
                      </h3>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-heading font-black text-brand-red">{soles(precio)}</span>
                        {anterior && <span className="text-xs text-slate-400 line-through">{soles(anterior)}</span>}
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => agregarAlCarrito(p, 1)}
                          className="w-full bg-brand-charcoal hover:bg-slate-800 text-white text-[11px] font-bold py-2.5 px-2 rounded-xl transition"
                        >
                          + Agregar
                        </button>
                        <button
                          onClick={() => abrirModal(p)}
                          className="w-full bg-brand-red hover:bg-brand-darkred text-white text-[11px] font-heading font-extrabold py-2.5 px-2 rounded-xl transition"
                        >
                          Ver Oferta
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-brand-charcoal text-slate-300 text-xs py-10 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-heading font-bold text-xl">
                <div className="w-8 h-8 rounded-xl bg-brand-red flex items-center justify-center text-white text-xs">🛍️</div>
                <span>{config.storeName}</span>
              </div>
              <p className="text-brand-gold font-semibold italic text-xs">{config.storeSub}</p>
            </div>
            <div>
              <h4 className="font-heading font-bold text-white mb-2">{config.storeName}</h4>
              <p className="text-slate-400">• Productos de Calidad<br />• Precios Justos<br />• Variedad para tu Hogar</p>
            </div>
            <div>
              <h4 className="font-heading font-bold text-white mb-2">Envíos</h4>
              <p className="text-slate-400">• Pago Contra Entrega en Lima<br />• Envíos a Provincia por Shalom/Olva</p>
            </div>
            <div>
              <h4 className="font-heading font-bold text-white mb-2">Atención</h4>
              <p className="text-brand-gold font-bold">💬 WhatsApp: +{config.whatsappNumber}</p>
              <Link href="/login" className="text-[11px] text-slate-400 mt-1 hover:text-white transition inline-block">🔑 Acceso al Sistema (Intranet)</Link>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-800 text-center text-slate-500 text-[11px]">
            &copy; {new Date().getFullYear()} {config.storeName}. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* BOTON FLOTANTE MOVIL */}
      <button
        onClick={() => setCartOpen(true)}
        className="md:hidden fixed bottom-5 right-5 z-40 bg-brand-red hover:bg-brand-darkred text-white font-heading font-black text-xs py-3.5 px-5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-brand-gold store-gold-glow"
      >
        <span>⚡</span>
        <span>Ver Carrito ({totalUnidades})</span>
      </button>

      {/* MODAL QUICK VIEW */}
      {modalProducto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setModalProducto(null)}>
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setModalProducto(null)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-brand-charcoal w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <img
                src={modalProducto.imagen_url || FALLBACK_IMAGE}
                alt={modalProducto.nombre}
                className="w-full h-64 md:h-72 object-cover rounded-2xl border border-slate-200"
              />

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-brand-red uppercase tracking-wider">{modalProducto.categoria || 'General'}</span>
                  <h2 className="text-xl font-heading font-black text-brand-charcoal">{modalProducto.nombre}</h2>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-2xl font-heading font-black text-brand-red">{soles(precioDe(modalProducto))}</span>
                  {precioAnteriorDe(modalProducto) && (
                    <span className="text-sm text-slate-400 line-through">{soles(precioAnteriorDe(modalProducto)!)}</span>
                  )}
                  {typeof modalProducto.stock === 'number' && (
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-0.5 rounded-full border border-emerald-200">
                      En Stock ({modalProducto.stock} unids)
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{modalProducto.descripcion || 'Producto importado de alta calidad.'}</p>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-heading font-bold text-brand-charcoal">Selecciona Cantidad / Combo:</label>
                  <select
                    value={modalQty}
                    onChange={(e) => setModalQty(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-bold focus:ring-2 focus:ring-brand-red"
                  >
                    <option value={1}>1 Unidad - {soles(precioDe(modalProducto) * 1)}</option>
                    <option value={2}>2 Unidades (Combo Pareja) - {soles(precioDe(modalProducto) * 1.8)}</option>
                    <option value={3}>3 Unidades (Pack Familiar) - {soles(precioDe(modalProducto) * 2.4)}</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => {
                      agregarAlCarrito(modalProducto, modalQty);
                      setModalProducto(null);
                    }}
                    className="w-full bg-brand-charcoal hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-2xl text-xs"
                  >
                    🛍️ Agregar al Carrito
                  </button>
                  <button
                    onClick={() => {
                      agregarAlCarrito(modalProducto, modalQty);
                      setModalProducto(null);
                      setCartOpen(true);
                    }}
                    className="w-full bg-brand-red hover:bg-brand-darkred text-white font-heading font-extrabold py-3.5 px-4 rounded-2xl text-xs"
                  >
                    ⚡ Comprar Ahora
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
          <div className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-white flex flex-col shadow-2xl">
            <div className="bg-brand-red text-white p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2 font-heading font-extrabold text-lg">
                <span>🛍️</span>
                <span>Tu Carrito {config.storeName}</span>
              </div>
              <button onClick={() => setCartOpen(false)} className="text-white hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {pedidoConfirmado ? (
                <div className="py-16 text-center space-y-3">
                  <div className="text-4xl">✅</div>
                  <p className="text-sm font-bold text-emerald-700">¡Pedido enviado! Te contactaremos por WhatsApp para confirmar.</p>
                </div>
              ) : cart.length === 0 ? (
                <div className="py-12 text-center space-y-2 text-slate-400">
                  <div className="text-3xl">🛍️</div>
                  <p className="text-xs font-bold text-slate-500">Tu carrito está vacío.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={String(item.id)} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <img src={item.image} alt={item.title} className="w-14 h-14 object-cover rounded-xl border border-slate-200" />
                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-xs text-brand-charcoal line-clamp-1">{item.title}</h4>
                      <span className="text-xs font-black text-brand-red">{soles(item.price * item.qty)}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => actualizarCantidad(item.id, -1)} className="w-5 h-5 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold text-xs">-</button>
                        <span className="text-xs font-bold">{item.qty}</span>
                        <button onClick={() => actualizarCantidad(item.id, 1)} className="w-5 h-5 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold text-xs">+</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && !pedidoConfirmado && (
              <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-3 shrink-0 max-h-[60vh] overflow-y-auto">
                <div className="flex justify-between items-center text-lg font-heading font-black">
                  <span>TOTAL:</span>
                  <span className="text-brand-red text-2xl font-black">{soles(totalCarrito)}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <input
                    type="text"
                    placeholder="Tu Nombre Completo *"
                    value={checkoutForm.nombre}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, nombre: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5"
                  />
                  <input
                    type="tel"
                    placeholder="Tu Celular / WhatsApp *"
                    value={checkoutForm.celular}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, celular: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={checkoutForm.regionTipo}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, regionTipo: e.target.value as 'lima' | 'provincia' })}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5"
                    >
                      <option value="lima">Lima Metropolitana</option>
                      <option value="provincia">Provincia</option>
                    </select>
                    <select
                      value={checkoutForm.metodoPago}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, metodoPago: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5"
                    >
                      <option value="contra_entrega">Contra Entrega</option>
                      <option value="yape">Yape</option>
                      <option value="plin">Plin</option>
                      <option value="previo_deposito">Depósito Previo</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Distrito / Ciudad *"
                    value={checkoutForm.distrito}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, distrito: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5"
                  />
                  <input
                    type="text"
                    placeholder="Dirección Completa *"
                    value={checkoutForm.direccion}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, direccion: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5"
                  />
                </div>

                <button
                  onClick={confirmarPedido}
                  disabled={enviando}
                  className="w-full bg-brand-red hover:bg-brand-darkred text-white font-heading font-extrabold py-3.5 px-4 rounded-2xl text-sm shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <span>💬</span>
                  <span>{enviando ? 'Enviando...' : 'Confirmar Pedido por WhatsApp'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

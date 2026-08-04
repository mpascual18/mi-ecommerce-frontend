'use client';

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CartProvider, useCart, soles } from './CartContext';
import { FALLBACK_IMAGE, calcularEnvio, COSTO_ENVIO } from './constants';
import {
  IconKey,
  IconBag,
  IconSearch,
  IconClose,
  IconMinus,
  IconPlus,
  IconWhatsapp,
  IconBolt,
  IconTruck,
} from './Icons';

function linkWhatsapp(numero: string, mensaje: string) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

function Ticker() {
  const { config } = useCart();
  return (
    <div style={{ backgroundColor: config.tickerBgColor }} className="text-white text-xs py-2.5 overflow-hidden border-b border-brand-gold/30 relative z-40">
      <div className="store-ticker-track flex whitespace-nowrap font-medium tracking-wider">
        {[0, 1].map((rep) => (
          <span key={rep} className="flex">
            <span className="mx-6 flex items-center gap-2">
              ✦ <strong className="text-brand-gold">{config.storeName}:</strong> {config.storeSub}
            </span>
            <span className="mx-6 text-gray-300">|</span>
            <span className="mx-6 flex items-center gap-2">{config.announcementText}</span>
            <span className="mx-6 text-gray-300">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Header() {
  const { config } = useCart();
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const q = busqueda.trim();
    router.push(q ? `/?q=${encodeURIComponent(q)}` : '/');
  }

  return (
    <header className="store-glass-header border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-brand-red flex items-center justify-center text-white shadow-md p-2 shrink-0 overflow-hidden">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt={config.storeName} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span className="font-heading font-black text-lg">P&R</span>
            )}
          </div>
          <div className="hidden sm:block">
            <span className="text-xl md:text-2xl font-heading font-black text-brand-red tracking-tight block leading-none">
              {config.storeName.replace('Store', '').trim()} <span className="text-brand-grafito">Store</span>
            </span>
            <span className="text-[11px] text-brand-red uppercase tracking-wider block font-semibold mt-1">{config.storeSub}</span>
          </div>
        </Link>

        <form onSubmit={buscar} className="hidden md:flex flex-1 max-w-md mx-6 relative">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="¿Qué buscas para tu hogar o cocina?..."
            className="w-full bg-slate-100 border border-slate-200 text-xs rounded-full py-2.5 pl-9 pr-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-red shadow-inner transition"
          />
          <IconSearch className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/login"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-brand-grafito hover:text-brand-red bg-slate-100 hover:bg-slate-200/70 px-4 py-2.5 rounded-full transition border border-slate-200"
          >
            <IconKey className="w-4 h-4 text-brand-red" />
            <span>Acceso al Sistema</span>
          </Link>

          <a
            href={linkWhatsapp(config.whatsappNumber, `Hola ${config.storeName}, quiero más información sobre sus productos 🙂`)}
            target="_blank"
            rel="noopener noreferrer"
            className="relative bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 md:px-5 md:py-2.5 rounded-full font-bold text-xs md:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition"
          >
            <IconWhatsapp className="w-4 h-4" />
            <span className="hidden md:inline font-heading tracking-wide">WhatsApp</span>
          </a>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const { config } = useCart();
  return (
    <footer className="bg-brand-grafito text-slate-300 text-xs py-10 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-heading font-bold text-xl">
              <div className="w-8 h-8 rounded-xl bg-brand-red flex items-center justify-center text-white text-xs">
                <IconBag className="w-4 h-4 text-brand-gold" />
              </div>
              <span>{config.storeName}</span>
            </div>
            <p className="text-brand-gold font-semibold italic text-xs">{config.storeSub}</p>
          </div>
          <div>
            <h4 className="font-heading font-bold text-white mb-2">{config.storeName}</h4>
            <p className="text-slate-400">
              • Productos de Calidad
              <br />• Precios Justos
              <br />• Variedad para tu Hogar
            </p>
          </div>
          <div>
            <h4 className="font-heading font-bold text-white mb-2">Envíos</h4>
            <p className="text-slate-400">
              • Pago Contra Entrega en Lima
              <br />• Envíos a Provincia por Shalom/Olva
            </p>
          </div>
          <div>
            <h4 className="font-heading font-bold text-white mb-2">Atención</h4>
            <p className="text-brand-gold font-bold flex items-center gap-1.5">
              <IconWhatsapp className="w-4 h-4" /> +{config.whatsappNumber}
            </p>
            <Link href="/login" className="text-[11px] text-slate-400 mt-1 hover:text-white transition inline-block">
              🔑 Acceso al Sistema (Intranet)
            </Link>
          </div>
        </div>
        <div className="pt-4 border-t border-slate-800 text-center text-slate-500 text-[11px]">
          &copy; {new Date().getFullYear()} {config.storeName}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}

function LiveSalesProofToast() {
  const [activeToast, setActiveToast] = useState<{ name: string; district: string; product: string; time: string } | null>(null);
  const [visible, setVisible] = useState(false);

  const SALES = [
    { name: 'Valeria M.', district: 'Miraflores', product: 'Vaso Yogurera Yogurt To Go (2 Unids)', time: 'hace 3 min' },
    { name: 'Carlos R.', district: 'San Borja', product: 'Pack Vaso Yogurera x3', time: 'hace 6 min' },
    { name: 'Daniela K.', district: 'Surco', product: 'Vaso Yogurera 1 Unidad', time: 'hace 9 min' },
    { name: 'Miguel A.', district: 'Arequipa', product: 'Vaso Yogurera 2 Unidades', time: 'hace 12 min' },
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setActiveToast(SALES[index]);
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
      }, 4500);

      index = (index + 1) % SALES.length;
    }, 13000);

    return () => clearInterval(interval);
  }, []);

  if (!activeToast) return null;

  return (
    <div
      className={`fixed bottom-20 left-4 bg-white/95 backdrop-blur-md border border-brand-red/30 p-3 rounded-2xl shadow-2xl z-40 max-w-xs transition-all duration-500 transform ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-red-100 text-brand-red font-heading font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
          🛍️
        </div>
        <div className="text-[11px] leading-tight">
          <p className="font-bold text-slate-900">
            <span className="text-brand-red">{activeToast.name}</span> de {activeToast.district}
          </p>
          <p className="text-slate-600">
            Compró <strong class="text-slate-900">{activeToast.product}</strong>
          </p>
          <p className="text-[9px] text-slate-400 font-semibold mt-0.5"> Verified Purchase • {activeToast.time}</p>
        </div>
      </div>
    </div>
  );
}

function FloatingWhatsappBubble() {
  const { config } = useCart();
  return (
    <a
      href={linkWhatsapp(config.whatsappNumber, `Hola ${config.storeName}, quiero información sobre los productos.`)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-3.5 rounded-full shadow-2xl z-40 flex items-center justify-center transition-transform transform hover:scale-110 group"
    >
      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-gold rounded-full border-2 border-white animate-pulse"></span>
      <IconWhatsapp className="w-6 h-6 text-white" />
    </a>
  );
}

function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateQty,
    totalCarrito,
    checkoutForm,
    setCheckoutForm,
    enviando,
    pedidoConfirmado,
    confirmarPedido,
    config,
  } = useCart();

  if (!cartOpen) return null;

  const envioPedido = calcularEnvio(totalCarrito);
  const metaEnvioGratis = 100;
  const porcentajeEnvio = Math.min(100, Math.round((totalCarrito / metaEnvioGratis) * 100));

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setCartOpen(false)} />
      <div className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-white flex flex-col shadow-2xl">
        <div className="bg-brand-red text-white p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 font-heading font-extrabold text-lg">
            <IconBag className="w-5 h-5 text-brand-gold" />
            <span>Tu Carrito {config.storeName}</span>
          </div>
          <button onClick={() => setCartOpen(false)} className="text-white hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center">
            <IconClose className="w-4 h-4" />
          </button>
        </div>

        {/* BARRA DE PROGRESO DE ENVÍO GRATIS */}
        <div className="bg-amber-50 border-b border-amber-200 p-3 text-xs text-amber-900 font-semibold space-y-1.5 shrink-0">
          <div className="text-center">
            {totalCarrito >= metaEnvioGratis ? (
              <span className="text-emerald-700 font-black">🎉 ¡Felicidades! Tienes ENVÍO GRATIS en Lima</span>
            ) : (
              <span>
                Agrega <strong className="text-brand-red">{soles(metaEnvioGratis - totalCarrito)}</strong> más para obtener <strong>ENVÍO GRATIS</strong>
              </span>
            )}
          </div>
          <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${porcentajeEnvio}%` }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {pedidoConfirmado ? (
            <div className="py-16 text-center space-y-3">
              <div className="text-4xl">✅</div>
              <p className="text-sm font-bold text-emerald-700">¡Pedido enviado! Te contactaremos por WhatsApp para confirmar.</p>
            </div>
          ) : cart.length === 0 ? (
            <div className="py-12 text-center space-y-2 text-slate-400">
              <IconBag className="w-10 h-10 mx-auto" />
              <p className="text-xs font-bold text-slate-500">Tu carrito está vacío.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={String(item.id)} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="w-14 h-14 rounded-xl border border-slate-200 bg-white flex items-center justify-center shrink-0 overflow-hidden">
                  <img src={item.image || FALLBACK_IMAGE} alt={item.title} className="w-full h-full object-contain" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold text-xs text-brand-grafito line-clamp-1">{item.title}</h4>
                  <span className="text-xs font-black text-brand-red">{soles(item.price * item.qty)}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, -1)} className="w-5 h-5 bg-slate-200 hover:bg-slate-300 rounded-lg flex items-center justify-center">
                      <IconMinus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-5 h-5 bg-slate-200 hover:bg-slate-300 rounded-lg flex items-center justify-center">
                      <IconPlus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && !pedidoConfirmado && (
          <div className="border-t border-slate-200 p-4 bg-slate-50 space-y-3 shrink-0 max-h-[60vh] overflow-y-auto">
            <div className="flex justify-between items-center text-sm font-bold text-slate-500">
              <span className="flex items-center gap-1.5"><IconTruck className="w-4 h-4" /> Envío</span>
              <span className={envioPedido.gratis ? 'text-emerald-700 font-black' : 'text-slate-700 font-black'}>
                {envioPedido.gratis ? 'GRATIS' : soles(COSTO_ENVIO)}
              </span>
            </div>

            <div className="flex justify-between items-center text-lg font-heading font-black">
              <span>TOTAL:</span>
              <span className="text-brand-red text-2xl font-black">{soles(totalCarrito + envioPedido.costo)}</span>
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
              <IconWhatsapp className="w-4 h-4" />
              <span>{enviando ? 'Enviando...' : 'Confirmar Pedido por WhatsApp'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MobileFloatingButton() {
  const { totalUnidades, setCartOpen } = useCart();
  return (
    <button
      onClick={() => setCartOpen(true)}
      className="md:hidden fixed bottom-5 left-5 z-40 bg-brand-red hover:bg-brand-darkred text-white font-heading font-black text-xs py-3.5 px-5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-brand-gold store-gold-glow"
    >
      <IconBolt className="w-4 h-4 text-brand-gold" />
      <span>Ver Carrito ({totalUnidades})</span>
    </button>
  );
}

function ShellInner({ children, hideFloatingCart }: { children: ReactNode; hideFloatingCart?: boolean }) {
  return (
    <div className="store-root bg-[#FAFAFA] text-brand-grafito min-h-screen flex flex-col font-sans antialiased">
      <Ticker />
      <Header />
      {children}
      <Footer />
      {!hideFloatingCart && <MobileFloatingButton />}
      <FloatingWhatsappBubble />
      <LiveSalesProofToast />
      <CartDrawer />
    </div>
  );
}

export default function StoreShell({ children, hideFloatingCart }: { children: ReactNode; hideFloatingCart?: boolean }) {
  return (
    <CartProvider>
      <ShellInner hideFloatingCart={hideFloatingCart}>{children}</ShellInner>
    </CartProvider>
  );
}


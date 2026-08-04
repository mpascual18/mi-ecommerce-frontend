'use client';

import { ReactNode, useState, useEffect } from 'react';
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
  const { config, totalUnidades, setCartOpen } = useCart();
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');

  function buscar(e: React.FormEvent) {
    e.preventDefault();
    const q = busqueda.trim();
    router.push(q ? `/#catalogo?q=${encodeURIComponent(q)}` : '/#catalogo');
  }

  return (
    <header className="store-glass-header border-b border-slate-200/80 sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/90">
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="h-12 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <img
              src={config.logoUrl || '/logo-completo.png'}
              alt={config.storeName}
              className="h-10 md:h-12 w-auto object-contain"
            />
          </div>
        </Link>

        <form onSubmit={buscar} className="hidden md:flex flex-1 max-w-md mx-6 relative">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="¿Qué buscas para tu hogar o cocina?..."
            className="w-full bg-slate-100 border border-slate-200 text-xs rounded-full py-2.5 pl-10 pr-4 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600 shadow-inner transition"
          />
          <IconSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>

        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/login"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-red-600 bg-slate-100 hover:bg-slate-200/70 px-4 py-2.5 rounded-full transition border border-slate-200"
          >
            <IconKey className="w-4 h-4 text-red-600" />
            <span>Acceso al Sistema</span>
          </Link>

          <a
            href={linkWhatsapp(config.whatsappNumber, `Hola ${config.storeName}, deseo consultar por un producto 🙂`)}
            target="_blank"
            rel="noopener noreferrer"
            className="relative bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full font-heading font-black text-xs md:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5"
          >
            <IconWhatsapp className="w-4.5 h-4.5 text-white" />
            <span className="font-heading tracking-wide">Contáctanos</span>
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
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-red flex items-center justify-center text-white font-heading font-black text-sm">
              P&R
            </div>
            <span className="font-heading font-black text-white text-base">{config.storeName}</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">{config.storeSub}</p>
        </div>

        <div>
          <h4 className="font-heading font-bold text-white mb-3 text-xs uppercase tracking-wider">P&R Store</h4>
          <ul className="space-y-2 text-slate-400">
            <li>• Productos de Calidad</li>
            <li>• Precios Justos</li>
            <li>• Variedad para tu Hogar</li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-bold text-white mb-3 text-xs uppercase tracking-wider">Envíos</h4>
          <ul className="space-y-2 text-slate-400">
            <li>• Pago Contra Entrega en Lima</li>
            <li>• Envíos a Provincia por Shalom/Olva</li>
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-bold text-white mb-3 text-xs uppercase tracking-wider">Atención & Contacto</h4>
          <ul className="space-y-2 text-slate-400">
            <li className="flex items-center gap-1.5 font-bold text-emerald-400">
              <IconWhatsapp className="w-4 h-4" /> +{config.whatsappNumber}
            </li>
            <li className="flex items-center gap-1.5 font-bold text-amber-300">
              <span>✉️ info@pyr-store.com</span>
            </li>
            <li>
              <Link href="/login" className="hover:text-white transition flex items-center gap-1 mt-1">
                <IconKey className="w-3.5 h-3.5 text-brand-red" /> Acceso al Sistema (Intranet)
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function LiveSalesProofToast() {
  const [activeToast, setActiveToast] = useState<{ name: string; district: string; product: string; time: string } | null>(null);
  const [visible, setVisible] = useState(false);

  const SALES = [
    { name: 'Valeria M.', district: 'Miraflores, Lima', product: 'Cortador 12 en 1 (Combo 2u)', time: 'Hace 3 min' },
    { name: 'Carlos R.', district: 'San Borja, Lima', product: 'Vaso Yogurera (Pack 3u)', time: 'Hace 6 min' },
    { name: 'Miguel A.', district: 'Arequipa', product: 'DispensaLimpia (Combo 2u)', time: 'Hace 12 min' },
    { name: 'Ana Sofía P.', district: 'Santiago de Surco', product: 'Vaso Yogurera Portable', time: 'Hace 4 min' },
    { name: 'Jorge L.', district: 'Trujillo', product: 'Organizador Multiuso Premium', time: 'Hace 8 min' },
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setActiveToast(SALES[index]);
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
      }, 5500);

      index = (index + 1) % SALES.length;
    }, 11000);

    return () => clearInterval(interval);
  }, []);

  if (!activeToast) return null;

  return (
    <div
      className={`fixed bottom-24 left-4 sm:left-6 bg-slate-900 text-white border-2 border-amber-400/80 p-4 rounded-3xl shadow-2xl z-40 max-w-sm transition-all duration-500 transform ${
        visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
          🛍️
        </div>
        <div className="text-xs leading-tight space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              COMPRA EN VIVO
            </span>
            <span className="text-[10px] text-slate-400 font-bold">{activeToast.time}</span>
          </div>

          <p className="font-heading font-black text-white text-xs">
            <span className="text-amber-300">{activeToast.name}</span> <span className="text-slate-300 font-normal">de</span> {activeToast.district}
          </p>
          <p className="text-slate-300 text-[11px]">
            Confirmó <strong className="text-amber-300 font-black underline">{activeToast.product}</strong>
          </p>
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


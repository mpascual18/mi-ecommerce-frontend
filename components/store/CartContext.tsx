'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { API_URL } from '@/lib/api';

export type StoreConfig = {
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

export type CartItem = {
  id: number | string;
  title: string;
  price: number;
  image: string;
  qty: number;
};

type CheckoutForm = {
  nombre: string;
  celular: string;
  distrito: string;
  direccion: string;
  regionTipo: 'lima' | 'provincia';
  metodoPago: string;
};

const DEFAULT_CONFIG: StoreConfig = {
  whatsappNumber: '51992001002',
  storeName: 'P&R Store',
  storeSub: 'Calidad que te acompaña.',
  announcementText: '🔥 ¡OFERTA POR TIEMPO LIMITADO! PAGO CONTRA ENTREGA EN LIMA Y ENVÍOS A TODO EL PERÚ 🚛',
  logoUrl: '',
  tickerBgColor: '#333333',
  heroTitle: 'Calidad que te acompaña en tu día a día.',
  heroSubtitle: 'En P&R Store seleccionamos lo mejor en tendencias para el hogar, cocina, tecnología y bienestar con garantía comprobada.',
  heroBannerUrl: '',
};

function soles(n: number) {
  return `S/. ${Number(n || 0).toFixed(2)}`;
}

type CartContextValue = {
  config: StoreConfig;
  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: { id: number | string; title: string; price: number; image: string }, qty?: number) => void;
  updateQty: (id: number | string, delta: number) => void;
  totalCarrito: number;
  totalUnidades: number;
  checkoutForm: CheckoutForm;
  setCheckoutForm: (form: CheckoutForm) => void;
  enviando: boolean;
  pedidoConfirmado: boolean;
  confirmarPedido: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<StoreConfig>(DEFAULT_CONFIG);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
    nombre: '',
    celular: '',
    distrito: '',
    direccion: '',
    regionTipo: 'lima',
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

  function addToCart(item: { id: number | string; title: string; price: number; image: string }, qty = 1) {
    setCart((prev) => {
      const existente = prev.find((i) => String(i.id) === String(item.id));
      if (existente) {
        return prev.map((i) => (String(i.id) === String(item.id) ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...item, qty }];
    });
    setCartOpen(true);
  }

  function updateQty(id: number | string, delta: number) {
    setCart((prev) =>
      prev.map((i) => (String(i.id) === String(id) ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0)
    );
  }

  const totalCarrito = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
  const totalUnidades = cart.reduce((acc, i) => acc + i.qty, 0);

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

  const value = useMemo(
    () => ({
      config,
      cart,
      cartOpen,
      setCartOpen,
      addToCart,
      updateQty,
      totalCarrito,
      totalUnidades,
      checkoutForm,
      setCheckoutForm,
      enviando,
      pedidoConfirmado,
      confirmarPedido,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config, cart, cartOpen, checkoutForm, enviando, pedidoConfirmado]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>');
  return ctx;
}

export { soles, DEFAULT_CONFIG };

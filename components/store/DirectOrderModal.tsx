'use client';

import React, { useState } from 'react';
import { API_URL } from '@/lib/api';

type Props = {
  productoNombre: string;
  productoId: number | string;
  precioUnitario: number;
  promoElegida: { id: string; name: string; price: number };
  onClose: () => void;
  whatsappNumero?: string;
};

export default function DirectOrderModal({
  productoNombre,
  productoId,
  precioUnitario,
  promoElegida,
  onClose,
  whatsappNumero = '51992001002',
}: Props) {
  const [nombre, setNombre] = useState('');
  const [celular, setCelular] = useState('');
  const [distrito, setDistrito] = useState('');
  const [direccion, setDireccion] = useState('');
  const [referencia, setReferencia] = useState('');
  const [metodoPago, setMetodoPago] = useState('Pago Contra Entrega (Efectivo / Yape / Plin)');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !celular.trim() || !distrito.trim() || !direccion.trim()) {
      alert('Por favor completa todos los campos obligatorios (*).');
      return;
    }

    setEnviando(true);

    const isLima = distrito.toLowerCase().includes('lima') || !distrito.toLowerCase().includes('provincia');

    // 1. Guardar en backend ERP/CRM PostgreSQL
    try {
      await fetch(`${API_URL}/api/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          celular: celular.trim(),
          direccion: `${direccion.trim()} (Ref: ${referencia.trim() || 'Sin ref'})`,
          distrito: distrito.trim(),
          provincia: isLima ? 'Lima' : distrito.trim(),
          total: promoElegida.price,
          origen: 'landing_producto',
          metodo_pago: metodoPago,
          items: [
            {
              producto_id: productoId,
              cantidad: parseInt(promoElegida.id) || 1,
              precio_unitario: promoElegida.price / (parseInt(promoElegida.id) || 1),
            },
          ],
        }),
      });
    } catch (err) {
      console.warn('⚠️ No se pudo conectar al backend API, redirigiendo a WhatsApp:', err);
    }

    // 2. Disparar eventos Meta Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      try {
        (window as any).fbq('track', 'Lead', {
          content_name: productoNombre,
          value: promoElegida.price,
          currency: 'PEN',
        });
        (window as any).fbq('track', 'Purchase', {
          content_name: productoNombre,
          value: promoElegida.price,
          currency: 'PEN',
        });
      } catch (e) {}
    }

    // 3. Abrir WhatsApp con mensaje estructurado
    const msg = `🛒 *NUEVO PEDIDO DIRECTO - P&R STORE*
----------------------------------------
📦 *Producto:* ${productoNombre}
🎁 *Combo:* ${promoElegida.name}
💰 *Total a Pagar:* S/. ${promoElegida.price.toFixed(2)}

👤 *DATOS DEL CLIENTE:*
• *Nombre:* ${nombre.trim()}
• *Teléfono:* ${celular.trim()}
• *Distrito/Ciudad:* ${distrito.trim()}
• *Dirección:* ${direccion.trim()}
• *Referencia:* ${referencia.trim() || 'Sin referencia'}
💳 *Método de Pago:* ${metodoPago}

----------------------------------------
🚚 *Por favor confirmar stock y horario de entrega.*`;

    const cleanNumber = whatsappNumero.replace(/\D/g, '') || '51992001002';
    const fullNumber = cleanNumber.startsWith('51') ? cleanNumber : `51${cleanNumber}`;
    const url = `https://wa.me/${fullNumber}?text=${encodeURIComponent(msg)}`;

    setEnviando(false);
    onClose();
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-red-600 overflow-hidden relative max-h-[90vh] flex flex-col my-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-red-700 to-red-600 text-white p-5 flex justify-between items-center shadow-md shrink-0">
          <div>
            <span className="bg-white/20 text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
              🚚 ENVÍO CONTRA ENTREGA EN LIMA
            </span>
            <h3 className="text-lg md:text-xl font-heading font-black text-white mt-1">FORMULARIO DE PEDIDO RÁPIDO</h3>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Producto Elegido Summary */}
          <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex justify-between items-center shadow-xs">
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Producto Seleccionado:</span>
              <span className="font-heading font-black text-xs block text-white line-clamp-1">{productoNombre}</span>
              <span className="text-[11px] text-slate-300 font-semibold">{promoElegida.name}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xl font-heading font-black text-amber-300">S/. {promoElegida.price.toFixed(2)}</span>
            </div>
          </div>

          {/* Datos del Cliente */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-heading font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-black">1</span>
              <span>Ingresa tus datos de envío:</span>
            </label>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Maria García"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Celular / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={celular}
                    onChange={(e) => setCelular(e.target.value)}
                    placeholder="Ej: 987654321"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Distrito / Ciudad *</label>
                  <input
                    type="text"
                    required
                    value={distrito}
                    onChange={(e) => setDistrito(e.target.value)}
                    placeholder="Ej: Miraflores, Lima"
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Dirección Exacta de Entrega *</label>
                <input
                  type="text"
                  required
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej: Av. Larco 1234, Dpto 302"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Referencia (Opcional)</label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Ej: Frente al parque principal"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Método de Pago */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-heading font-black text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-black">2</span>
              <span>Método de Pago:</span>
            </label>

            <div className="space-y-1.5">
              <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
                <input
                  type="radio"
                  name="payment_method"
                  value="Pago Contra Entrega (Efectivo / Yape / Plin)"
                  checked={metodoPago.includes('Contra Entrega')}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="text-red-600 focus:ring-red-600"
                />
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Pago Contra Entrega (Lima)</span>
                  <span className="text-[10px] text-slate-500">Pagas en efectivo, Yape o Plin al recibir tu paquete</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
                <input
                  type="radio"
                  name="payment_method"
                  value="Previo Deposito / Agencia (Provincias)"
                  checked={metodoPago.includes('Depósito')}
                  onChange={(e) => setMetodoPago(e.target.value)}
                  className="text-red-600 focus:ring-red-600"
                />
                <div>
                  <span className="font-bold text-slate-900 text-xs block">Envío a Provincia (Shalom / Olva)</span>
                  <span className="text-[10px] text-slate-500">Despacho con agencia previo depósito</span>
                </div>
              </label>
            </div>
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-black py-4 px-4 rounded-2xl text-sm shadow-xl transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            <span>{enviando ? 'PROCESANDO PEDIDO...' : '¡CONFIRMAR PEDIDO Y REGISTRAR!'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

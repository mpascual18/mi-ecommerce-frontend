'use client';

import React, { useState } from 'react';
import { API_URL } from '@/lib/api';

type Props = {
  productoNombre: string;
  productoId: number | string;
  precioUnitario: number;
  promoElegida: { id: string; name: string; price: number };
  oferta2u?: number;
  oferta3u?: number;
  onClose: () => void;
  whatsappNumero?: string;
  umbralEnvioGratis?: number;
  costoEnvioFijo?: number;
};

export default function DirectOrderModal({
  productoNombre,
  productoId,
  precioUnitario,
  promoElegida,
  oferta2u,
  oferta3u,
  onClose,
  whatsappNumero = '51992001002',
  umbralEnvioGratis = 30,
  costoEnvioFijo = 15,
}: Props) {
  // Opciones de combo disponibles para cambio directo dentro del modal
  const p2u = oferta2u || Math.round(precioUnitario * 1.8);
  const p3u = oferta3u || Math.round(precioUnitario * 2.4);

  const [currentPromo, setCurrentPromo] = useState(promoElegida);
  const [nombre, setNombre] = useState('');
  const [celular, setCelular] = useState('');
  const [correo, setCorreo] = useState('');
  const [distrito, setDistrito] = useState('');
  const [direccion, setDireccion] = useState('');
  const [referencia, setReferencia] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Cálculo de costo de envío
  const esEnvioGratis = currentPromo.price >= umbralEnvioGratis;
  const costoEnvio = esEnvioGratis ? 0 : costoEnvioFijo;
  const totalFinal = currentPromo.price + costoEnvio;

  const handleComboChange = (comboId: string) => {
    if (comboId === '1') {
      setCurrentPromo({ id: '1', name: '1 Unidad', price: precioUnitario });
    } else if (comboId === '2') {
      setCurrentPromo({ id: '2', name: '2 Unidades (Más Vendido)', price: p2u });
    } else if (comboId === '3') {
      setCurrentPromo({ id: '3', name: '3 Unidades (Pack Familiar)', price: p3u });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !celular.trim() || !distrito.trim() || !direccion.trim()) {
      alert('Por favor completa todos los campos obligatorios (*).');
      return;
    }

    setEnviando(true);
    const isLima = distrito.toLowerCase().includes('lima') || !distrito.toLowerCase().includes('provincia');

    // 1. Guardar en PostgreSQL ERP
    let registroExitoso = true;
    try {
      const res = await fetch(`${API_URL}/api/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          celular: celular.trim(),
          correo: correo.trim(),
          direccion: `${direccion.trim()} (Ref: ${referencia.trim() || 'Sin ref'})`,
          distrito: distrito.trim(),
          provincia: isLima ? 'Lima' : distrito.trim(),
          total: totalFinal,
          costo_envio: costoEnvio,
          origen: 'landing_producto',
          metodo_pago: 'contra_entrega',
          items: [
            {
              producto_id: productoId,
              cantidad: parseInt(currentPromo.id) || 1,
              precio_unitario: currentPromo.price / (parseInt(currentPromo.id) || 1),
            },
          ],
        }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }
    } catch (err) {
      registroExitoso = false;
      console.error('❌ No se pudo registrar el pedido en el CRM (quedará solo en WhatsApp):', err);
    }

    // 2. Disparar Meta Pixel Events
    if (typeof window !== 'undefined' && (window as any).fbq) {
      try {
        (window as any).fbq('track', 'Lead', {
          content_name: productoNombre,
          value: totalFinal,
          currency: 'PEN',
        });
        (window as any).fbq('track', 'Purchase', {
          content_name: productoNombre,
          value: totalFinal,
          currency: 'PEN',
        });
      } catch (e) {}
    }

    // 3. Redirigir directamente al WhatsApp de la empresa
    const msg = `🛒 *NUEVO PEDIDO DIRECTO - P&R STORE*
----------------------------------------
📦 *Producto:* ${productoNombre}
🎁 *Combo:* ${currentPromo.name} (S/. ${currentPromo.price.toFixed(2)})
🚚 *Envío:* ${esEnvioGratis ? '¡GRATIS! 🎉' : `S/. ${costoEnvio.toFixed(2)}`}
💰 *TOTAL A PAGAR (Pagar al Recibir):* S/. ${totalFinal.toFixed(2)}

👤 *DATOS DEL CLIENTE:*
• *Nombre:* ${nombre.trim()}
• *Teléfono:* ${celular.trim()}
• *Distrito/Ciudad:* ${distrito.trim()}
• *Dirección Exacta:* ${direccion.trim()}
• *Referencia:* ${referencia.trim() || 'Sin referencia'}
💳 *Método de Pago:* Pago Contra Entrega (Pagas al recibir en puerta)

----------------------------------------
🚚 *Por favor confirmar horario de entrega.*`;

    const cleanNumber = whatsappNumero.replace(/\D/g, '') || '51992001002';
    const fullNumber = cleanNumber.startsWith('51') ? cleanNumber : `51${cleanNumber}`;
    const url = `https://wa.me/${fullNumber}?text=${encodeURIComponent(msg)}`;

    setEnviando(false);
    onClose();
    if (!registroExitoso) {
      alert('Tu pedido se enviará por WhatsApp, pero tuvimos un problema técnico al registrarlo en el sistema. Nuestro equipo lo confirmará manualmente contigo.');
    }
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-red-600 overflow-hidden relative max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-red-700 to-red-600 text-white p-4 md:p-5 flex justify-between items-center shadow-md shrink-0">
          <div>
            <span className="bg-white/20 text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full tracking-wider">
              🚚 ENVÍO CONTRA ENTREGA EN LIMA
            </span>
            <h3 className="text-lg md:text-xl font-heading font-black text-white mt-0.5">FORMULARIO DE PEDIDO RÁPIDO</h3>
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
          
          {/* RESUMEN EDITABLE DEL PRODUCTO Y COMBO */}
          <div className="bg-slate-950 text-white p-4 rounded-2xl space-y-3 shadow-md border border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider block">PRODUCTO SELECCIONADO:</span>
                <h4 className="font-heading font-black text-xs text-white line-clamp-1 mt-0.5">{productoNombre}</h4>
              </div>
            </div>

            {/* SELECTOR EDITABLE DE CANTIDAD/PROMO DENTRO DEL MODAL */}
            <div>
              <label className="block text-[10px] text-slate-300 font-bold uppercase mb-1">
                ✏️ Cambiar Promoción / Cantidad:
              </label>
              <select
                value={currentPromo.id}
                onChange={(e) => handleComboChange(e.target.value)}
                className="w-full bg-slate-900 border border-amber-400/50 text-amber-300 font-heading font-bold text-xs rounded-xl p-2.5 focus:ring-2 focus:ring-amber-400 focus:outline-none"
              >
                <option value="1">1 Unidad - S/. {precioUnitario.toFixed(2)}</option>
                <option value="2">2 Unidades (Más Vendido) - S/. {p2u.toFixed(2)}</option>
                <option value="3">3 Unidades (Pack Familiar) - S/. {p3u.toFixed(2)}</option>
              </select>
            </div>

            {/* DESGLOSE DE COSTOS */}
            <div className="space-y-1 pt-2 border-t border-slate-800 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Subtotal Combo:</span>
                <span className="font-bold text-white">S/. {currentPromo.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Costo de Envío:</span>
                <span className={`font-black ${esEnvioGratis ? 'text-emerald-400' : 'text-amber-300'}`}>
                  {esEnvioGratis ? '¡ENVÍO GRATIS! 🎉' : `S/. ${costoEnvio.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-sm">
                <span className="font-black text-white uppercase">TOTAL A PAGAR:</span>
                <span className="text-2xl font-heading font-black text-amber-300">S/. {totalFinal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* INGRESA TUS DATOS DE ENVÍO */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-heading font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-black">1</span>
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
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-3 focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Correo (opcional, para seguir tu pedido)</label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="Ej: maria@correo.com"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-3 focus:ring-2 focus:ring-red-600 focus:outline-none"
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
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-3 focus:ring-2 focus:ring-red-600 focus:outline-none"
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
                    className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-3 focus:ring-2 focus:ring-red-600 focus:outline-none"
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
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-3 focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Referencia (Opcional)</label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Ej: Frente al parque principal"
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs rounded-xl p-3 focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* BOTÓN VERDE ÚNICO: CONFIRMAR PEDIDO (PAGAR AL RECIBIR) */}
          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-heading font-black py-4 px-4 rounded-2xl text-sm shadow-xl transition flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            <span>{enviando ? 'PROCESANDO PEDIDO...' : '¡CONFIRMAR PEDIDO (PAGAR AL RECIBIR)!'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';
import { ESTADOS_PEDIDO, ESTADOS_VENTA, EstadoPedido, getEstadoConfig } from '@/lib/estadosPedido';

type Pedido = {
  id: number;
  cliente_nombre: string;
  celular: string;
  direccion: string;
  distrito: string;
  provincia?: string;
  region: 'lima' | 'provincia';
  origen: string;
  estado: EstadoPedido;
  total: number;
  metodo_pago: string;
  tracking_guia?: string;
  notas_seguimiento?: string;
  fecha: string;
};

// En Ventas solo se trabajan los tickets que aun no se enviaron a Logistica.
// Una vez enviado (o anulado), el ticket deja de ser responsabilidad del
// vendedor y se administra desde /logistica.
const ESTADOS_CONFIG = ESTADOS_PEDIDO.filter(e => ESTADOS_VENTA.includes(e.id));

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [estadoFiltro, setEstadoFiltro] = useState<string>('todos');
  const [regionFiltro, setRegionFiltro] = useState<string>('todos');

  // Modal de ticket
  const [pedidoModal, setPedidoModal] = useState<Pedido | null>(null);
  const [trackingGuia, setTrackingGuia] = useState('');
  const [notas, setNotas] = useState('');

  const cargarPedidos = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/api/pedidos`);
      const data = await res.json();
      // Ventas solo ve su propia bandeja de trabajo (ingresado / en_proceso).
      const soloVenta = Array.isArray(data) ? data.filter((p: Pedido) => ESTADOS_VENTA.includes(p.estado)) : [];
      setPedidos(soloVenta);
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      setPedidos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const abrirTicket = (p: Pedido) => {
    setPedidoModal(p);
    setTrackingGuia(p.tracking_guia || '');
    setNotas(p.notas_seguimiento || '');
  };

  const cambiarEstadoPedido = async (id: number, nuevoEstado: string, guia = '', notasTexto = '', contactoMedio = '') => {
    if (nuevoEstado === 'anulado') {
      if (!confirm('⚠️ Al anular este pedido, el stock reservado regresará automáticamente al inventario del almacén. ¿Deseas continuar?')) {
        return;
      }
    }

    try {
      const res = await fetch(`${API_URL}/api/pedidos/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: nuevoEstado,
          tracking_guia: guia,
          notas_seguimiento: notasTexto,
          contacto_medio: contactoMedio
        })
      });

      if (res.ok) {
        setPedidoModal(null);
        cargarPedidos();
      }
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    }
  };

  const enviarNotificacionWhatsApp = (p: Pedido) => {
    let msg = `Hola *${p.cliente_nombre}*, te saludamos de *P&R Store* 🛍️\n`;
    msg += `Respecto a tu pedido *#${p.id}* por S/. ${Number(p.total).toFixed(2)}. ¡Gracias por tu compra!`;
    const cleanPhone = p.celular.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Filter pedidos
  const pedidosFiltrados = pedidos.filter(p => {
    if (estadoFiltro !== 'todos' && p.estado !== estadoFiltro) return false;
    if (regionFiltro !== 'todos' && p.region !== regionFiltro) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">📥 CRM de Ventas - Bandeja de Leads</h1>
          <p className="text-sm text-gray-500">Contacta y confirma tus pedidos. Al enviarlos a Logística, salen de esta bandeja.</p>
        </div>

        {/* FILTRO DE REGION LIMA VS PROVINCIA */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 p-1.5 rounded-xl shadow-xs">
          <button
            onClick={() => setRegionFiltro('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${regionFiltro === 'todos' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setRegionFiltro('lima')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${regionFiltro === 'lima' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            🏢 Lima Metropolitana
          </button>
          <button
            onClick={() => setRegionFiltro('provincia')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${regionFiltro === 'provincia' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            🚛 Provincias (Agencias)
          </button>
        </div>
      </div>

      {/* FILTRO DE ESTADOS PARALELO */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-gray-200">
        <button
          onClick={() => setEstadoFiltro('todos')}
          className={`px-4 py-2 rounded-full text-xs font-bold border transition whitespace-nowrap ${estadoFiltro === 'todos' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'}`}
        >
          Todos los Pedidos ({pedidos.length})
        </button>
        {ESTADOS_CONFIG.map(e => {
          const cant = pedidos.filter(p => p.estado === e.id).length;
          return (
            <button
              key={e.id}
              onClick={() => setEstadoFiltro(e.id)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold border transition whitespace-nowrap flex items-center gap-1.5 ${estadoFiltro === e.id ? 'bg-red-600 text-white border-red-600' : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'}`}
            >
              <span>{e.icon}</span>
              <span>{e.label}</span>
              <span className="bg-gray-100 text-gray-800 text-[10px] font-black px-2 py-0.5 rounded-full ml-1">{cant}</span>
            </button>
          );
        })}
      </div>

      {/* LISTA/GRID DE PEDIDOS (TICKETS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cargando ? (
          <div className="col-span-full py-12 text-center text-gray-400 font-bold">
            ⌛ Cargando pedidos del CRM...
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 space-y-2">
            <p className="font-bold text-sm text-gray-600">No hay pedidos en este estado o filtro seleccionado.</p>
            <p className="text-xs text-gray-400">Los pedidos ya enviados a Logística se gestionan desde el módulo de Logística.</p>
          </div>
        ) : (
          pedidosFiltrados.map(p => {
            const estadoCfg = getEstadoConfig(p.estado);
            return (
              <div
                key={p.id}
                onClick={() => abrirTicket(p)}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md hover:border-red-300 transition space-y-3 flex flex-col justify-between cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${estadoCfg.color}`}>
                      {estadoCfg.icon} {estadoCfg.label}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${p.region === 'lima' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                      {p.region === 'lima' ? '🏢 Lima' : '🚛 Provincia'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">🎫 #{p.id} · {p.cliente_nombre}</h3>
                    <p className="text-xs text-blue-600 font-bold flex items-center justify-between">
                      <span>📞 {p.celular}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); enviarNotificacionWhatsApp(p); }}
                        className="bg-green-100 hover:bg-green-200 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-md transition"
                      >
                        💬 Contactar WhatsApp
                      </button>
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">📍 {p.direccion} ({p.distrito})</p>
                  </div>

                  {p.notas_seguimiento && (
                    <p className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded-lg border border-gray-100">
                      &quot;{p.notas_seguimiento}&quot;
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Origen: <strong className="text-gray-700">{p.origen}</strong></span>
                    <span className="text-lg font-black text-red-600">S/ {Number(p.total).toFixed(2)}</span>
                  </div>

                  {/* ACCIONES RAPIDAS DE ESTADO Y LOGISTICA */}
                  <div className="grid grid-cols-1 gap-2 pt-1 text-[11px]">
                    {p.estado === 'ingresado' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); cambiarEstadoPedido(p.id, 'en_proceso', '', 'Cliente contactado por vendedor', 'WhatsApp'); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition shadow-xs"
                      >
                        👤 Tomar Pedido & Marcar Contactado
                      </button>
                    )}
                    {p.estado === 'en_proceso' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); cambiarEstadoPedido(p.id, 'logistica', '', 'Datos confirmados. Enviado a Logística para empaque.'); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition shadow-xs"
                      >
                        📦 Confirmar & Enviar a Logística
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); cambiarEstadoPedido(p.id, 'anulado'); }}
                      className="bg-red-50 hover:bg-red-100 text-red-700 font-bold py-1.5 rounded-xl transition text-center border border-red-200"
                    >
                      🔴 Anular Pedido
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL DE TICKET: DETALLE COMPLETO Y EDICION DEL PEDIDO */}
      {pedidoModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPedidoModal(null)}>
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-black text-lg text-gray-900">🎫 Ticket #{pedidoModal.id}</h3>
              <button onClick={() => setPedidoModal(null)} className="font-bold text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-1 text-xs">
              <p className="font-black text-sm text-gray-900">{pedidoModal.cliente_nombre}</p>
              <p className="text-blue-600 font-bold">📞 {pedidoModal.celular}</p>
              <p className="text-gray-600">📍 {pedidoModal.direccion} ({pedidoModal.distrito}{pedidoModal.provincia ? `, ${pedidoModal.provincia}` : ''})</p>
              <p className="text-gray-500">Origen: <strong className="text-gray-700">{pedidoModal.origen}</strong> · Método de pago: <strong className="text-gray-700">{pedidoModal.metodo_pago}</strong></p>
              <p className="text-red-600 font-black text-sm pt-1">Total: S/ {Number(pedidoModal.total).toFixed(2)}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Notas de Seguimiento / Comentarios</label>
                <textarea
                  rows={3}
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ej: Cliente confirmó entrega para el viernes por la mañana..."
                  className="w-full bg-gray-50 border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                ></textarea>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-2 border-t text-xs">
              {pedidoModal.estado === 'ingresado' && (
                <button
                  onClick={() => cambiarEstadoPedido(pedidoModal.id, 'en_proceso', trackingGuia, notas || 'Cliente contactado por vendedor', 'WhatsApp')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition shadow-xs"
                >
                  👤 Tomar Pedido & Marcar Contactado
                </button>
              )}
              {pedidoModal.estado === 'en_proceso' && (
                <button
                  onClick={() => cambiarEstadoPedido(pedidoModal.id, 'logistica', trackingGuia, notas || 'Datos confirmados. Enviado a Logística para empaque.')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition shadow-xs"
                >
                  📦 Confirmar & Enviar a Logística
                </button>
              )}
              <button
                onClick={() => cambiarEstadoPedido(pedidoModal.id, pedidoModal.estado, trackingGuia, notas)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 rounded-xl transition"
              >
                💾 Guardar Notas
              </button>
              <button
                onClick={() => cambiarEstadoPedido(pedidoModal.id, 'anulado')}
                className="bg-red-50 hover:bg-red-100 text-red-700 font-bold py-1.5 rounded-xl transition text-center border border-red-200"
              >
                🔴 Anular Pedido (Devuelve Stock)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

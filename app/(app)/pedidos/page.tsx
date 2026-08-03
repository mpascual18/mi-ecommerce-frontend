'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';

type Pedido = {
  id: number;
  cliente_nombre: string;
  celular: string;
  direccion: string;
  distrito: string;
  provincia?: string;
  region: 'lima' | 'provincia';
  origen: string;
  estado: 'ingresado' | 'contactado' | 'confirmado' | 'en_camino' | 'entregado' | 'anulado';
  total: number;
  metodo_pago: string;
  tracking_guia?: string;
  notas_seguimiento?: string;
  fecha: string;
};

const ESTADOS_CONFIG = [
  { id: 'ingresado', label: '1. Ingresado', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: '📥' },
  { id: 'contactado', label: '2. Contactado', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '📞' },
  { id: 'confirmado', label: '3. Confirmado', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: '🟢' },
  { id: 'en_camino', label: '4. En Camino', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: '🚚' },
  { id: 'entregado', label: '5. Entregado / Cobrado', color: 'bg-green-100 text-green-800 border-green-300', icon: '✅' },
  { id: 'anulado', label: '6. Anulado', color: 'bg-red-100 text-red-800 border-red-300', icon: '🔴' }
];

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [estadoFiltro, setEstadoFiltro] = useState<string>('todos');
  const [regionFiltro, setRegionFiltro] = useState<string>('todos');

  // Modal tracking state
  const [pedidoModal, setPedidoModal] = useState<Pedido | null>(null);
  const [trackingGuia, setTrackingGuia] = useState('');
  const [notas, setNotas] = useState('');

  const cargarPedidos = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/api/pedidos`);
      const data = await res.json();
      setPedidos(Array.isArray(data) ? data : []);
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

  const cambiarEstadoPedido = async (id: number, nuevoEstado: string, guia = '', notasTexto = '') => {
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
          notas_seguimiento: notasTexto
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
          <h1 className="text-3xl font-black text-gray-900">📦 CRM de Pedidos & Despachos</h1>
          <p className="text-sm text-gray-500">Gestión de flujo por estados desde la recepción hasta la cobranza</p>
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

      {/* LISTA/GRID DE PEDIDOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cargando ? (
          <div className="col-span-full py-12 text-center text-gray-400 font-bold">
            ⌛ Cargando pedidos del CRM...
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 space-y-2">
            <p className="font-bold text-sm text-gray-600">No hay pedidos en este estado o filtro seleccionado.</p>
          </div>
        ) : (
          pedidosFiltrados.map(p => {
            const estadoCfg = ESTADOS_CONFIG.find(e => e.id === p.estado) || ESTADOS_CONFIG[0];
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between">
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
                    <h3 className="font-bold text-gray-900 text-sm">{p.cliente_nombre}</h3>
                    <p className="text-xs text-blue-600 font-bold">📞 {p.celular}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">📍 {p.direccion} ({p.distrito})</p>
                  </div>

                  {p.tracking_guia && (
                    <div className="bg-purple-50 border border-purple-200 text-purple-800 text-xs p-2 rounded-xl font-bold flex items-center gap-1">
                      <span>🏷️ Guía: {p.tracking_guia}</span>
                    </div>
                  )}

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

                  {/* ACCIONES RAPIDAS DE ESTADO */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <button
                      onClick={() => {
                        setPedidoModal(p);
                        setTrackingGuia(p.tracking_guia || '');
                        setNotas(p.notas_seguimiento || '');
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 rounded-xl transition text-center"
                    >
                      ✏️ Notas / Guía
                    </button>

                    {p.estado === 'ingresado' && (
                      <button onClick={() => cambiarEstadoPedido(p.id, 'contactado')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl transition">
                        📞 Contactado
                      </button>
                    )}
                    {p.estado === 'contactado' && (
                      <button onClick={() => cambiarEstadoPedido(p.id, 'confirmado')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl transition">
                        🟢 Confirmar
                      </button>
                    )}
                    {p.estado === 'confirmado' && (
                      <button onClick={() => cambiarEstadoPedido(p.id, 'en_camino')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-xl transition">
                        🚚 En Camino
                      </button>
                    )}
                    {p.estado === 'en_camino' && (
                      <button onClick={() => cambiarEstadoPedido(p.id, 'entregado')} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-xl transition">
                        ✅ Entregado
                      </button>
                    )}
                    {p.estado !== 'anulado' && p.estado !== 'entregado' && (
                      <button onClick={() => cambiarEstadoPedido(p.id, 'anulado')} className="col-span-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-1.5 rounded-xl transition text-center">
                        🔴 Anular Pedido (Devuelve Stock)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL PARA NOTAS Y GUIA */}
      {pedidoModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-lg text-gray-900">Editar Pedido #{pedidoModal.id}</h3>
              <button onClick={() => setPedidoModal(null)} className="font-bold text-gray-400">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Número de Guía / Tracking (Shalom/Olva/Motorizado)</label>
                <input
                  type="text"
                  value={trackingGuia}
                  onChange={(e) => setTrackingGuia(e.target.value)}
                  placeholder="Ej: SHALOM-123456"
                  className="w-full bg-gray-50 border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

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

              <div>
                <label className="block font-bold text-gray-700 mb-1">Cambiar Estado:</label>
                <select
                  value={pedidoModal.estado}
                  onChange={(e) => setPedidoModal({ ...pedidoModal, estado: e.target.value as any })}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-bold"
                >
                  {ESTADOS_CONFIG.map(e => (
                    <option key={e.id} value={e.id}>{e.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setPedidoModal(null)} className="px-4 py-2 bg-gray-100 font-bold text-xs rounded-xl">
                Cancelar
              </button>
              <button
                onClick={() => cambiarEstadoPedido(pedidoModal.id, pedidoModal.estado, trackingGuia, notas)}
                className="px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

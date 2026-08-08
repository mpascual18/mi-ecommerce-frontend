'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';
import { ESTADOS_LOGISTICA, EstadoPedido, getEstadoConfig } from '@/lib/estadosPedido';

type PedidoLogistica = {
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

const TABS_LOGISTICA: { id: EstadoPedido | 'todos'; label: string; icon: string }[] = [
  { id: 'logistica', label: 'Por Empacar', icon: '📦' },
  { id: 'empacado', label: 'Empacado', icon: '🗳️' },
  { id: 'en_camino', label: 'En Tránsito', icon: '🚚' },
  { id: 'entregado', label: 'Entregados & Cobrados', icon: '✅' },
  { id: 'anulado', label: 'Anulados', icon: '🔴' },
  { id: 'todos', label: 'Ver Todos', icon: '📋' },
];

export default function LogisticaPage() {
  const [pedidos, setPedidos] = useState<PedidoLogistica[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('logistica'); // Default: recien llegados de Ventas
  const [filtroRegion, setFiltroRegion] = useState<string>('todos');

  // Modal de ticket: detalle, notas y cambio manual de estado
  const [pedidoModal, setPedidoModal] = useState<PedidoLogistica | null>(null);
  const [notas, setNotas] = useState('');

  // Modal de rotulado/despacho: imprime etiqueta y asigna guia/agencia
  const [etiquetaModal, setEtiquetaModal] = useState<PedidoLogistica | null>(null);
  const [guiaInput, setGuiaInput] = useState('');
  const [agenciaInput, setAgenciaInput] = useState('Shalom');

  const cargarPedidos = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/api/pedidos`);
      const data = await res.json();
      // Logistica solo ve tickets que Ventas ya envio (o que se resolvieron aqui mismo).
      const soloLogistica = Array.isArray(data) ? data.filter((p: PedidoLogistica) => ESTADOS_LOGISTICA.includes(p.estado)) : [];
      setPedidos(soloLogistica);
    } catch (err) {
      console.error('Error al cargar cola logística:', err);
      setPedidos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const abrirTicket = (p: PedidoLogistica) => {
    setPedidoModal(p);
    setNotas(p.notas_seguimiento || '');
  };

  const cambiarEstado = async (id: number, nuevoEstado: string, guia = '', notasTexto = '') => {
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
        setEtiquetaModal(null);
        setPedidoModal(null);
        setGuiaInput('');
        cargarPedidos();
      }
    } catch (err) {
      console.error('Error al actualizar estado logístico:', err);
    }
  };

  const pedidosFiltrados = pedidos.filter(p => {
    if (filtroEstado !== 'todos' && p.estado !== filtroEstado) return false;
    if (filtroRegion !== 'todos' && p.region !== filtroRegion) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* HEADER DE MÓDULO LOGÍSTICO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-0.5 rounded-full uppercase">Módulo de Almacén & Despacho</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mt-1">📦 Cola de Empaque y Gestión Logística</h1>
          <p className="text-xs text-gray-500">Tickets enviados por Ventas: empaca, despacha y da seguimiento hasta la entrega</p>
        </div>

        {/* REGION FILTER SWITCH */}
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl text-xs font-bold border border-gray-200">
          <button
            onClick={() => setFiltroRegion('todos')}
            className={`px-3 py-1.5 rounded-lg transition ${filtroRegion === 'todos' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroRegion('lima')}
            className={`px-3 py-1.5 rounded-lg transition ${filtroRegion === 'lima' ? 'bg-red-600 text-white shadow-xs' : 'text-gray-500'}`}
          >
            🏢 Lima Motorizado
          </button>
          <button
            onClick={() => setFiltroRegion('provincia')}
            className={`px-3 py-1.5 rounded-lg transition ${filtroRegion === 'provincia' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-500'}`}
          >
            🚛 Agencia Provincia
          </button>
        </div>
      </div>

      {/* TABS DE ESTADO LOGÍSTICO */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {TABS_LOGISTICA.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFiltroEstado(tab.id)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition whitespace-nowrap flex items-center gap-2 ${filtroEstado === tab.id ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white text-gray-700 border-gray-200'}`}
          >
            <span>{tab.icon} {tab.label} ({tab.id === 'todos' ? pedidos.length : pedidos.filter(p => p.estado === tab.id).length})</span>
          </button>
        ))}
      </div>

      {/* COLA DE PAQUETES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cargando ? (
          <div className="col-span-full py-12 text-center text-gray-400 font-bold">
            ⌛ Cargando cola de empaque y logística...
          </div>
        ) : pedidosFiltrados.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 font-bold bg-white rounded-2xl border border-gray-200 p-8">
            ✅ No hay paquetes pendientes en este estado.
          </div>
        ) : (
          pedidosFiltrados.map((p) => {
            const estadoCfg = getEstadoConfig(p.estado);
            return (
              <div
                key={p.id}
                onClick={() => abrirTicket(p)}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition space-y-3 flex flex-col justify-between cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${estadoCfg.color}`}>
                      {estadoCfg.icon} {estadoCfg.label}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${p.region === 'lima' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                      {p.region === 'lima' ? '🏢 Lima Express' : '🚛 Provincia Agencia'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-gray-900 text-sm">🎫 #{p.id} · {p.cliente_nombre}</h3>
                    <p className="text-xs text-blue-600 font-bold">📞 {p.celular}</p>
                    <p className="text-xs text-gray-600 mt-1">📍 {p.direccion} ({p.distrito})</p>
                  </div>

                  {p.tracking_guia && (
                    <div className="bg-purple-50 border border-purple-200 text-purple-900 text-xs p-2.5 rounded-xl font-bold flex justify-between items-center">
                      <span>🏷️ Guía: {p.tracking_guia}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-bold">Cobrar al cliente:</span>
                    <span className="text-base font-black text-red-600">S/ {Number(p.total).toFixed(2)}</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-xs font-bold pt-1">
                    {p.estado === 'logistica' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); cambiarEstado(p.id, 'empacado', p.tracking_guia, 'Pedido empacado, listo para despacho.'); }}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-xl transition text-center"
                      >
                        🗳️ Marcar Empacado
                      </button>
                    )}

                    {p.estado === 'empacado' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setEtiquetaModal(p); setGuiaInput(p.tracking_guia || ''); }}
                        className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl transition text-center"
                      >
                        🚚 Despachar (En Tránsito)
                      </button>
                    )}

                    {p.estado === 'en_camino' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); cambiarEstado(p.id, 'entregado', p.tracking_guia, 'Entregado y cobrado en puerta.'); }}
                        className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl transition text-center"
                      >
                        ✅ Marcar Entregado
                      </button>
                    )}

                    {(p.estado === 'logistica' || p.estado === 'empacado' || p.estado === 'en_camino') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); cambiarEstado(p.id, 'anulado'); }}
                        className="bg-red-50 hover:bg-red-100 text-red-700 py-1.5 rounded-xl transition text-center border border-red-200"
                      >
                        🔴 Anular Pedido
                      </button>
                    )}

                    <button
                      onClick={(e) => { e.stopPropagation(); setEtiquetaModal(p); setGuiaInput(p.tracking_guia || ''); }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-xl transition text-center flex items-center justify-center gap-1"
                    >
                      🏷️ Imprimir Rotulado
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL DE TICKET: DETALLE, NOTAS Y CAMBIO MANUAL DE ESTADO */}
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
              <p className="text-gray-500">Método de pago: <strong className="text-gray-700">{pedidoModal.metodo_pago}</strong></p>
              {pedidoModal.tracking_guia && <p className="text-gray-500">Guía: <strong className="text-gray-700">{pedidoModal.tracking_guia}</strong></p>}
              <p className="text-red-600 font-black text-sm pt-1">Total a cobrar: S/ {Number(pedidoModal.total).toFixed(2)}</p>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1 text-xs">Notas de Almacén / Seguimiento</label>
              <textarea
                rows={3}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej: Paquete revisado, falta confirmar horario con motorizado..."
                className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-2 border-t text-xs">
              {pedidoModal.estado === 'logistica' && (
                <button
                  onClick={() => cambiarEstado(pedidoModal.id, 'empacado', pedidoModal.tracking_guia, notas || 'Pedido empacado, listo para despacho.')}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 rounded-xl transition"
                >
                  🗳️ Marcar Empacado
                </button>
              )}
              {pedidoModal.estado === 'empacado' && (
                <button
                  onClick={() => { setEtiquetaModal(pedidoModal); setGuiaInput(pedidoModal.tracking_guia || ''); setPedidoModal(null); }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl transition"
                >
                  🚚 Despachar (En Tránsito)
                </button>
              )}
              {pedidoModal.estado === 'en_camino' && (
                <button
                  onClick={() => cambiarEstado(pedidoModal.id, 'entregado', pedidoModal.tracking_guia, notas || 'Entregado y cobrado en puerta.')}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition"
                >
                  ✅ Marcar Entregado
                </button>
              )}
              <button
                onClick={() => cambiarEstado(pedidoModal.id, pedidoModal.estado, pedidoModal.tracking_guia, notas)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 rounded-xl transition"
              >
                💾 Guardar Notas
              </button>
              {pedidoModal.estado !== 'entregado' && pedidoModal.estado !== 'anulado' && (
                <button
                  onClick={() => cambiarEstado(pedidoModal.id, 'anulado')}
                  className="bg-red-50 hover:bg-red-100 text-red-700 font-bold py-1.5 rounded-xl transition border border-red-200"
                >
                  🔴 Anular Pedido (Devuelve Stock)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ROTULADO Y ROTULO DE EMPAQUE IMPRIMIBLE */}
      {etiquetaModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border-2 border-gray-900">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-lg text-gray-900">🏷️ Rotulado de Empaque - Orden #{etiquetaModal.id}</h3>
              <button onClick={() => setEtiquetaModal(null)} className="font-bold text-gray-400">✕</button>
            </div>

            {/* ETIQUETA IMPRIMIBLE DE DESPACHO */}
            <div className="border-2 border-dashed border-gray-400 p-4 rounded-2xl bg-gray-50 space-y-3 font-mono text-xs text-gray-900">
              <div className="text-center border-b border-gray-300 pb-2">
                <span className="font-black text-sm block">P&R STORE - DESPACHO</span>
                <span className="text-[10px] text-gray-500">Calidad que te acompaña.</span>
              </div>

              <div className="space-y-1">
                <p><strong>DESTINATARIO:</strong> {etiquetaModal.cliente_nombre}</p>
                <p><strong>TELÉFONO:</strong> {etiquetaModal.celular}</p>
                <p><strong>DIRECCIÓN:</strong> {etiquetaModal.direccion}</p>
                <p><strong>DISTRITO/CIUDAD:</strong> {etiquetaModal.distrito} ({etiquetaModal.region.toUpperCase()})</p>
                <p className="text-red-600 font-bold"><strong>MONTO A COBRAR:</strong> S/ {Number(etiquetaModal.total).toFixed(2)} ({etiquetaModal.metodo_pago.toUpperCase()})</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Agencia / Transportista</label>
                <select
                  value={agenciaInput}
                  onChange={(e) => setAgenciaInput(e.target.value)}
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-bold"
                >
                  <option value="Shalom">Agencia Shalom</option>
                  <option value="Olva Courier">Olva Courier</option>
                  <option value="Motorizado Lima Express">Motorizado Lima Express</option>
                  <option value="Marvisur">Agencia Marvisur</option>
                  <option value="Cavassa">Agencia Cavassa</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Número de Guía / Tracking de Envío</label>
                <input
                  type="text"
                  value={guiaInput}
                  onChange={(e) => setGuiaInput(e.target.value)}
                  placeholder="Ej: SHALOM-998822"
                  className="w-full bg-gray-50 border rounded-xl p-2.5 font-bold"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <button onClick={() => window.print()} className="px-4 py-2 bg-gray-200 font-bold text-xs rounded-xl">
                🖨️ Imprimir Etiqueta
              </button>
              {etiquetaModal.estado === 'empacado' ? (
                <button
                  onClick={() => cambiarEstado(etiquetaModal.id, 'en_camino', guiaInput, `Despachado por almacén - ${agenciaInput}`)}
                  className="px-5 py-2.5 bg-purple-600 text-white font-black text-xs rounded-xl shadow-md"
                >
                  🚚 Confirmar Despacho
                </button>
              ) : (
                <span className="text-[11px] text-gray-400 font-bold">Solo imprime la etiqueta en este estado.</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

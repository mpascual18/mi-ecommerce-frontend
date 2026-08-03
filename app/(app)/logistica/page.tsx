'use client';

import { useEffect, useState } from 'react';

type PedidoLogistica = {
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

export default function LogisticaPage() {
  const [pedidos, setPedidos] = useState<PedidoLogistica[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('confirmado'); // Default: Pedidos listos para empaque
  const [filtroRegion, setFiltroRegion] = useState<string>('todos');
  
  // Packing & Label Print Modal
  const [etiquetaModal, setEtiquetaModal] = useState<PedidoLogistica | null>(null);
  const [guiaInput, setGuiaInput] = useState('');
  const [agenciaInput, setAgenciaInput] = useState('Shalom');

  const cargarPedidos = async () => {
    setCargando(true);
    try {
      const res = await fetch('http://localhost:4000/api/pedidos');
      const data = await res.json();
      setPedidos(Array.isArray(data) ? data : []);
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

  const actualizarDespacho = async (id: number, nuevoEstado: string, guia = '') => {
    try {
      const res = await fetch(`http://localhost:4000/api/pedidos/${id}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: nuevoEstado,
          tracking_guia: guia || guiaInput,
          notas_seguimiento: `Despachado por almacén - ${agenciaInput}`
        })
      });

      if (res.ok) {
        setEtiquetaModal(null);
        setGuiaInput('');
        cargarPedidos();
      }
    } catch (err) {
      console.error('Error al actualizar despacho:', err);
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
          <p className="text-xs text-gray-500">Procesa pedidos confirmados, imprime rotulados y asigna guías de transporte</p>
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
        <button
          onClick={() => setFiltroEstado('confirmado')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition whitespace-nowrap flex items-center gap-2 ${filtroEstado === 'confirmado' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-white text-gray-700 border-gray-200'}`}
        >
          <span>🟢 Por Empaquetar ({pedidos.filter(p => p.estado === 'confirmado').length})</span>
        </button>
        <button
          onClick={() => setFiltroEstado('en_camino')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition whitespace-nowrap flex items-center gap-2 ${filtroEstado === 'en_camino' ? 'bg-purple-600 text-white border-purple-600 shadow-xs' : 'bg-white text-gray-700 border-gray-200'}`}
        >
          <span>🚚 En Camino / Despachados ({pedidos.filter(p => p.estado === 'en_camino').length})</span>
        </button>
        <button
          onClick={() => setFiltroEstado('entregado')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition whitespace-nowrap flex items-center gap-2 ${filtroEstado === 'entregado' ? 'bg-green-700 text-white border-green-700 shadow-xs' : 'bg-white text-gray-700 border-gray-200'}`}
        >
          <span>✅ Entregados & Cobrados ({pedidos.filter(p => p.estado === 'entregado').length})</span>
        </button>
        <button
          onClick={() => setFiltroEstado('todos')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs border transition whitespace-nowrap ${filtroEstado === 'todos' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'}`}
        >
          Ver Todos ({pedidos.length})
        </button>
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
          pedidosFiltrados.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ORDEN #{p.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${p.region === 'lima' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                    {p.region === 'lima' ? '🏢 Lima Express' : '🚛 Provincia Agencia'}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm">{p.cliente_nombre}</h3>
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

                <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1">
                  <button
                    onClick={() => {
                      setEtiquetaModal(p);
                      setGuiaInput(p.tracking_guia || '');
                    }}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-xl transition text-center flex items-center justify-center gap-1"
                  >
                    <span>🏷️ Imprimir Rotulado</span>
                  </button>

                  {p.estado === 'confirmado' && (
                    <button
                      onClick={() => {
                        setEtiquetaModal(p);
                        setGuiaInput(p.tracking_guia || '');
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl transition text-center"
                    >
                      🚚 Despachar
                    </button>
                  )}

                  {p.estado === 'en_camino' && (
                    <button
                      onClick={() => actualizarDespacho(p.id, 'entregado')}
                      className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl transition text-center"
                    >
                      ✅ Marcar Entregado
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

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
              <button
                onClick={() => actualizarDespacho(etiquetaModal.id, 'en_camino', guiaInput)}
                className="px-5 py-2.5 bg-purple-600 text-white font-black text-xs rounded-xl shadow-md"
              >
                🚚 Confirmar Despacho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

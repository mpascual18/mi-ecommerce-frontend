'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';
import { ESTADOS_PEDIDO, ESTADOS_VENTA, EstadoPedido, getEstadoConfig } from '@/lib/estadosPedido';
import { Agencia, getAgencias, valoresUnicos } from '@/lib/agencias';

type Pedido = {
  id: number;
  cliente_nombre: string;
  cliente_apellido?: string;
  celular: string;
  documento?: string;
  correo?: string;
  direccion: string;
  distrito: string;
  provincia?: string;
  departamento?: string;
  referencia?: string;
  ubicacion_maps?: string;
  region: 'lima' | 'provincia';
  origen: string;
  estado: EstadoPedido;
  total: number;
  metodo_pago: string;
  tracking_guia?: string;
  notas_seguimiento?: string;
  empresa_logistica?: string;
  agencia_envio_id?: number | null;
  agencia_nombre?: string;
  agencia_direccion?: string;
  fecha: string;
};

type TicketForm = {
  nombre: string;
  apellido: string;
  celular: string;
  documento: string;
  correo: string;
  region: 'lima' | 'provincia';
  distrito: string;
  direccion: string;
  referencia: string;
  ubicacion_maps: string;
  empresa_logistica: string;
};

type Cascada = { departamento: string; provincia: string; distrito: string; agenciaId: number | null };
type HistorialItem = { estado: string; fecha: string };

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
  const [form, setForm] = useState<TicketForm | null>(null);
  const [notas, setNotas] = useState('');
  const [cascada, setCascada] = useState<Cascada>({ departamento: '', provincia: '', distrito: '', agenciaId: null });
  const [agenciasLista, setAgenciasLista] = useState<Agencia[]>([]);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [guardando, setGuardando] = useState(false);

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

  const abrirTicket = async (p: Pedido) => {
    setPedidoModal(p);
    setNotas(p.notas_seguimiento || '');
    setForm({
      nombre: p.cliente_nombre || '',
      apellido: p.cliente_apellido || '',
      celular: p.celular || '',
      documento: p.documento || '',
      correo: p.correo || '',
      region: p.region || 'lima',
      distrito: p.region === 'lima' ? (p.distrito || '') : '',
      direccion: p.region === 'lima' ? (p.direccion || '') : '',
      referencia: p.referencia || '',
      ubicacion_maps: p.ubicacion_maps || '',
      empresa_logistica: p.empresa_logistica || '',
    });
    setHistorial([]);
    setAgenciasLista([]);
    setCascada({ departamento: '', provincia: '', distrito: '', agenciaId: null });

    fetch(`${API_URL}/api/pedidos/${p.id}/historial`)
      .then((r) => r.json())
      .then((h) => setHistorial(Array.isArray(h) ? h : []))
      .catch(() => {});

    if (p.empresa_logistica) {
      const lista = await getAgencias(p.empresa_logistica);
      setAgenciasLista(lista);
      const ag = p.agencia_envio_id ? lista.find((a) => a.id === p.agencia_envio_id) : null;
      if (ag) {
        setCascada({ departamento: ag.departamento, provincia: ag.provincia, distrito: ag.distrito, agenciaId: ag.id });
      } else if (p.departamento) {
        setCascada({ departamento: p.departamento, provincia: '', distrito: '', agenciaId: null });
      }
    }
  };

  const seleccionarEmpresaLogistica = async (empresa: string) => {
    setForm((f) => (f ? { ...f, empresa_logistica: empresa } : f));
    setCascada({ departamento: '', provincia: '', distrito: '', agenciaId: null });
    if (!empresa) {
      setAgenciasLista([]);
      return;
    }
    const lista = await getAgencias(empresa);
    setAgenciasLista(lista);
  };

  const guardarDatosTicket = async (id: number): Promise<boolean> => {
    if (!form) return false;
    setGuardando(true);
    try {
      const res = await fetch(`${API_URL}/api/pedidos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          apellido: form.apellido,
          celular: form.celular,
          documento: form.documento,
          correo: form.correo,
          region: form.region,
          distrito: form.region === 'lima' ? form.distrito : cascada.distrito,
          direccion: form.region === 'lima' ? form.direccion : '',
          provincia: form.region === 'lima' ? '' : cascada.provincia,
          departamento: form.region === 'lima' ? '' : cascada.departamento,
          referencia: form.referencia,
          ubicacion_maps: form.ubicacion_maps,
          empresa_logistica: form.region === 'provincia' ? form.empresa_logistica : '',
          agencia_envio_id: form.region === 'provincia' ? cascada.agenciaId : null,
          notas_seguimiento: notas,
        }),
      });
      return res.ok;
    } catch (err) {
      console.error('Error al guardar el ticket:', err);
      return false;
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstadoPedido = async (id: number, nuevoEstado: string, notasTexto = '', contactoMedio = '') => {
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
          notas_seguimiento: notasTexto || undefined,
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

  // Guarda los datos editados del ticket y, si corresponde, avanza el estado.
  const guardarYAvanzar = async (id: number, nuevoEstado?: string, notasTexto = '') => {
    const guardadoOk = await guardarDatosTicket(id);
    if (!guardadoOk) {
      alert('No se pudieron guardar los datos del ticket. Intenta de nuevo.');
      return;
    }
    if (nuevoEstado) {
      await cambiarEstadoPedido(id, nuevoEstado, notasTexto);
    } else {
      setPedidoModal(null);
      cargarPedidos();
    }
  };

  const enviarNotificacionWhatsApp = (p: Pedido) => {
    let msg = `Hola *${p.cliente_nombre}*, te saludamos de *P&R Store* 🛍️\n`;
    msg += `Respecto a tu pedido *#${p.id}* por S/. ${Number(p.total).toFixed(2)}. ¡Gracias por tu compra!`;
    const cleanPhone = p.celular.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const buscarEnGoogleMaps = () => {
    if (!form) return;
    const query = `${form.direccion}, ${form.distrito}, Lima, Perú`;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
  };

  // Filter pedidos
  const pedidosFiltrados = pedidos.filter(p => {
    if (estadoFiltro !== 'todos' && p.estado !== estadoFiltro) return false;
    if (regionFiltro !== 'todos' && p.region !== regionFiltro) return false;
    return true;
  });

  const departamentos = valoresUnicos(agenciasLista.map((a) => a.departamento));
  const provincias = valoresUnicos(agenciasLista.filter((a) => a.departamento === cascada.departamento).map((a) => a.provincia));
  const distritos = valoresUnicos(
    agenciasLista.filter((a) => a.departamento === cascada.departamento && a.provincia === cascada.provincia).map((a) => a.distrito)
  );
  const agenciasFiltradas = agenciasLista.filter(
    (a) => a.departamento === cascada.departamento && a.provincia === cascada.provincia && a.distrito === cascada.distrito
  );

  const puedeEnviarLogistica = !!(
    form &&
    form.nombre.trim() &&
    form.celular.trim() &&
    (form.region === 'lima'
      ? form.distrito.trim() && form.direccion.trim()
      : form.empresa_logistica && cascada.agenciaId)
  );

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
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {p.region === 'provincia' && p.agencia_nombre
                        ? `🚛 ${p.agencia_nombre}`
                        : `📍 ${p.direccion || 'Sin dirección aún'} ${p.distrito ? `(${p.distrito})` : ''}`}
                    </p>
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
                        onClick={(e) => { e.stopPropagation(); cambiarEstadoPedido(p.id, 'en_proceso', 'Cliente contactado por vendedor', 'WhatsApp'); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition shadow-xs"
                      >
                        👤 Tomar Pedido & Marcar Contactado
                      </button>
                    )}
                    {p.estado === 'en_proceso' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); abrirTicket(p); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition shadow-xs"
                      >
                        📦 Confirmar Datos & Enviar a Logística
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
      {pedidoModal && form && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPedidoModal(null)}>
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-black text-lg text-gray-900">🎫 Ticket #{pedidoModal.id}</h3>
              <button onClick={() => setPedidoModal(null)} className="font-bold text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 flex justify-between items-center text-xs">
              <span className="text-gray-500">Origen: <strong className="text-gray-700">{pedidoModal.origen}</strong> · {pedidoModal.metodo_pago}</span>
              <span className="text-red-600 font-black text-sm">Total: S/ {Number(pedidoModal.total).toFixed(2)}</span>
            </div>

            {/* DATOS DEL CLIENTE - EDITABLES */}
            <div className="space-y-2 text-xs">
              <p className="font-bold text-gray-700 uppercase text-[11px]">👤 Datos del Cliente</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-500 mb-1">Nombres *</label>
                  <input
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">Apellidos</label>
                  <input
                    value={form.apellido}
                    onChange={(e) => setForm({ ...form, apellido: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">Celular *</label>
                  <input
                    value={form.celular}
                    onChange={(e) => setForm({ ...form, celular: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 mb-1">DNI (opcional)</label>
                  <input
                    value={form.documento}
                    onChange={(e) => setForm({ ...form, documento: e.target.value })}
                    className="w-full bg-gray-50 border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Correo (opcional, para enviarle el seguimiento de su pedido)</label>
                <input
                  type="email"
                  value={form.correo}
                  onChange={(e) => setForm({ ...form, correo: e.target.value })}
                  placeholder="cliente@correo.com"
                  className="w-full bg-gray-50 border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* DESTINO: LIMA O PROVINCIA */}
            <div className="space-y-2 text-xs">
              <p className="font-bold text-gray-700 uppercase text-[11px]">🚚 Destino del Envío</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, region: 'lima' })}
                  className={`flex-1 py-2 rounded-xl font-bold border transition ${form.region === 'lima' ? 'bg-red-600 text-white border-red-600' : 'bg-white border-gray-200 text-gray-600'}`}
                >
                  🏢 Lima Metropolitana
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, region: 'provincia' })}
                  className={`flex-1 py-2 rounded-xl font-bold border transition ${form.region === 'provincia' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 text-gray-600'}`}
                >
                  🚛 Provincia (Agencia)
                </button>
              </div>

              {form.region === 'lima' ? (
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="block text-gray-500 mb-1">Distrito *</label>
                    <input
                      value={form.distrito}
                      onChange={(e) => setForm({ ...form, distrito: e.target.value })}
                      placeholder="Ej: Miraflores"
                      className="w-full bg-gray-50 border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Dirección Exacta *</label>
                    <div className="flex gap-2">
                      <input
                        value={form.direccion}
                        onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                        placeholder="Av./Jr./Calle, número, referencia de urbanización..."
                        className="flex-1 bg-gray-50 border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        type="button"
                        onClick={buscarEnGoogleMaps}
                        className="shrink-0 bg-slate-900 hover:bg-black text-white font-bold px-3 rounded-xl transition"
                        title="Buscar esta dirección en Google Maps"
                      >
                        🗺️
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Referencia</label>
                    <input
                      value={form.referencia}
                      onChange={(e) => setForm({ ...form, referencia: e.target.value })}
                      placeholder="Ej: Frente al parque, edificio azul..."
                      className="w-full bg-gray-50 border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 mb-1">Ubicación de Google Maps (enlace o coordenadas)</label>
                    <input
                      value={form.ubicacion_maps}
                      onChange={(e) => setForm({ ...form, ubicacion_maps: e.target.value })}
                      placeholder="Pega aquí el enlace o las coordenadas que copiaste de Google Maps"
                      className="w-full bg-gray-50 border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Usa el botón 🗺️ para buscar la dirección, ubícala en el mapa y pega aquí el enlace o las coordenadas — así el motorizado llega directo.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="block text-gray-500 mb-1">Empresa Logística *</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => seleccionarEmpresaLogistica('shalom')}
                        className={`flex-1 py-2 rounded-xl font-bold border transition ${form.empresa_logistica === 'shalom' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-gray-200 text-gray-600'}`}
                      >
                        Shalom
                      </button>
                      <button
                        type="button"
                        onClick={() => seleccionarEmpresaLogistica('olva')}
                        className={`flex-1 py-2 rounded-xl font-bold border transition ${form.empresa_logistica === 'olva' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white border-gray-200 text-gray-600'}`}
                      >
                        Olva Courier
                      </button>
                    </div>
                  </div>

                  {form.empresa_logistica && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-gray-500 mb-1">Departamento</label>
                        <select
                          value={cascada.departamento}
                          onChange={(e) => setCascada({ departamento: e.target.value, provincia: '', distrito: '', agenciaId: null })}
                          className="w-full bg-gray-50 border rounded-xl p-2.5"
                        >
                          <option value="">Selecciona...</option>
                          {departamentos.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1">Provincia</label>
                        <select
                          value={cascada.provincia}
                          onChange={(e) => setCascada({ ...cascada, provincia: e.target.value, distrito: '', agenciaId: null })}
                          disabled={!cascada.departamento}
                          className="w-full bg-gray-50 border rounded-xl p-2.5 disabled:opacity-50"
                        >
                          <option value="">Selecciona...</option>
                          {provincias.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1">Distrito</label>
                        <select
                          value={cascada.distrito}
                          onChange={(e) => setCascada({ ...cascada, distrito: e.target.value, agenciaId: null })}
                          disabled={!cascada.provincia}
                          className="w-full bg-gray-50 border rounded-xl p-2.5 disabled:opacity-50"
                        >
                          <option value="">Selecciona...</option>
                          {distritos.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-500 mb-1">Agencia</label>
                        <select
                          value={cascada.agenciaId ?? ''}
                          onChange={(e) => setCascada({ ...cascada, agenciaId: e.target.value ? Number(e.target.value) : null })}
                          disabled={!cascada.distrito}
                          className="w-full bg-gray-50 border rounded-xl p-2.5 disabled:opacity-50"
                        >
                          <option value="">Selecciona...</option>
                          {agenciasFiltradas.map((a) => (
                            <option key={a.id} value={a.id}>{a.direccion.slice(0, 60)}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {cascada.agenciaId && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-900 text-[11px] p-2.5 rounded-xl">
                      📍 {agenciasFiltradas.find((a) => a.id === cascada.agenciaId)?.direccion}
                      {agenciasFiltradas.find((a) => a.id === cascada.agenciaId)?.referencia && (
                        <span className="block text-blue-600 mt-0.5">{agenciasFiltradas.find((a) => a.id === cascada.agenciaId)?.referencia}</span>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-500 mb-1">Referencia adicional para el cliente</label>
                    <input
                      value={form.referencia}
                      onChange={(e) => setForm({ ...form, referencia: e.target.value })}
                      placeholder="Ej: recoge en horario de tarde"
                      className="w-full bg-gray-50 border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              )}
              {!puedeEnviarLogistica && (
                <p className="text-[10px] text-amber-600 font-bold pt-1">
                  ⚠️ Completa los datos de destino para poder enviar este ticket a Logística.
                </p>
              )}
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1 text-xs">Notas de Seguimiento / Comentarios</label>
              <textarea
                rows={2}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej: Cliente confirmó entrega para el viernes por la mañana..."
                className="w-full bg-gray-50 border rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
              ></textarea>
            </div>

            {/* HISTORIAL / TIEMPOS DEL TICKET */}
            {historial.length > 0 && (
              <div className="space-y-1.5 text-[11px] bg-gray-50 border border-gray-100 rounded-2xl p-3">
                <p className="font-bold text-gray-700 uppercase text-[10px]">🕒 Historial del Ticket</p>
                {historial.map((h, i) => {
                  const cfg = getEstadoConfig(h.estado);
                  const prev = historial[i - 1];
                  const elapsedMin = prev ? Math.round((new Date(h.fecha).getTime() - new Date(prev.fecha).getTime()) / 60000) : null;
                  return (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5"><span>{cfg.icon}</span><span className="font-bold text-gray-700">{cfg.label}</span></span>
                      <span className="text-gray-400">
                        {new Date(h.fecha).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        {elapsedMin !== null && ` (+${elapsedMin} min)`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-1 gap-2 pt-2 border-t text-xs">
              {pedidoModal.estado === 'ingresado' && (
                <button
                  disabled={guardando}
                  onClick={() => guardarYAvanzar(pedidoModal.id, 'en_proceso', notas || 'Cliente contactado por vendedor')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition shadow-xs disabled:opacity-50"
                >
                  👤 Guardar & Marcar Contactado
                </button>
              )}
              {pedidoModal.estado === 'en_proceso' && (
                <button
                  disabled={guardando || !puedeEnviarLogistica}
                  onClick={() => guardarYAvanzar(pedidoModal.id, 'logistica', notas || 'Datos confirmados. Enviado a Logística para empaque.')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition shadow-xs disabled:opacity-50"
                >
                  📦 Confirmar & Enviar a Logística
                </button>
              )}
              <button
                disabled={guardando}
                onClick={() => guardarYAvanzar(pedidoModal.id)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 rounded-xl transition disabled:opacity-50"
              >
                💾 Guardar Cambios
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

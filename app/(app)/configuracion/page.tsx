'use client';

import { useEffect, useState } from 'react';
import { API_URL, apiFetch } from '@/lib/api';

type ConfigData = {
  whatsappNumber: string;
  storeName: string;
  storeSub: string;
  announcementText: string;
  logoUrl: string;
  umbralEnvioGratis?: number;
  costoEnvioFijo?: number;
  alertasAdminEmails: string[];
  alertasPedidoNuevoActiva: boolean;
  alertasPedidoAnuladoActiva: boolean;
  alertasReporteDiarioActiva: boolean;
  alertasReporteQuincenalActiva: boolean;
  alertasReporteMensualActiva: boolean;
  alertasClienteEstados: string[];
};

const GRUPOS_ESTADOS_CLIENTE: { label: string; estados: string[]; recomendado: string }[] = [
  { label: 'Contactado (confirmación de pedido)', estados: ['en_proceso'], recomendado: 'Recomendado mantenerlo' },
  { label: 'En logística / Empacado', estados: ['logistica', 'empacado'], recomendado: 'Estados internos de almacén' },
  { label: 'En camino (con guía de rastreo)', estados: ['en_camino'], recomendado: 'El más valioso para el cliente' },
  { label: 'Entregado / Anulado', estados: ['entregado', 'anulado'], recomendado: 'Cierre del pedido' },
];

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<ConfigData>({
    whatsappNumber: '51992001002',
    storeName: 'P&R Store',
    storeSub: 'Calidad que te acompaña.',
    announcementText: '🔥 ¡OFERTA POR TIEMPO LIMITADO! PAGO CONTRA ENTREGA EN LIMA Y ENVÍOS A TODO EL PERÚ 🚛',
    logoUrl: '',
    umbralEnvioGratis: 30,
    costoEnvioFijo: 15,
    alertasAdminEmails: ['mpascual@pyr-store.com'],
    alertasPedidoNuevoActiva: true,
    alertasPedidoAnuladoActiva: true,
    alertasReporteDiarioActiva: true,
    alertasReporteQuincenalActiva: true,
    alertasReporteMensualActiva: true,
    alertasClienteEstados: ['en_proceso', 'en_camino', 'entregado', 'anulado'],
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [nuevoCorreoAlerta, setNuevoCorreoAlerta] = useState('');

  // Estados de prueba de correo (Resend)
  const [adminEmailTest, setAdminEmailTest] = useState('mpascual@pyr-store.com');
  const [probandoCorreo, setProbandoCorreo] = useState(false);
  const [resultadoPrueba, setResultadoPrueba] = useState('');

  useEffect(() => {
    cargarConfig();
  }, []);

  const probarCorreoSmtp = async () => {
    setProbandoCorreo(true);
    setResultadoPrueba('');
    try {
      const res = await apiFetch(`${API_URL}/api/configuracion/probar-correo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailDestino: adminEmailTest || 'mpascual@pyr-store.com',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResultadoPrueba(data.message || '✅ Correo de prueba enviado exitosamente.');
      } else {
        setResultadoPrueba(`❌ Error: ${data.error || 'No se pudo enviar el correo de prueba.'}`);
      }
    } catch (err: any) {
      setResultadoPrueba(`❌ Error de conexión: ${err.message || 'Error al conectar con servidor.'}`);
    } finally {
      setProbandoCorreo(false);
    }
  };

  const cargarConfig = async () => {
    setCargando(true);
    try {
      const res = await apiFetch(`${API_URL}/api/configuracion`);
      const data = await res.json();
      if (data) {
        setConfig((prev) => ({
          ...prev,
          ...data,
          umbralEnvioGratis: data.umbralEnvioGratis !== undefined ? Number(data.umbralEnvioGratis) : 30,
          costoEnvioFijo: data.costoEnvioFijo !== undefined ? Number(data.costoEnvioFijo) : 15,
          alertasAdminEmails: Array.isArray(data.alertasAdminEmails) && data.alertasAdminEmails.length > 0 ? data.alertasAdminEmails : prev.alertasAdminEmails,
          alertasClienteEstados: Array.isArray(data.alertasClienteEstados) ? data.alertasClienteEstados : prev.alertasClienteEstados,
        }));
      }
    } catch (err) {
      console.error('Error al cargar configuración:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setConfig((prev) => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const agregarCorreoAlerta = () => {
    const correo = nuevoCorreoAlerta.trim().toLowerCase();
    if (!correo || !correo.includes('@')) return;
    if (config.alertasAdminEmails.includes(correo)) {
      setNuevoCorreoAlerta('');
      return;
    }
    setConfig({ ...config, alertasAdminEmails: [...config.alertasAdminEmails, correo] });
    setNuevoCorreoAlerta('');
  };

  const quitarCorreoAlerta = (correo: string) => {
    if (config.alertasAdminEmails.length <= 1) {
      alert('Debe quedar al menos un correo para recibir las alertas.');
      return;
    }
    setConfig({ ...config, alertasAdminEmails: config.alertasAdminEmails.filter((c) => c !== correo) });
  };

  const grupoEstadoActivo = (estados: string[]) => estados.every((e) => config.alertasClienteEstados.includes(e));

  const toggleGrupoEstado = (estados: string[]) => {
    const activo = grupoEstadoActivo(estados);
    setConfig({
      ...config,
      alertasClienteEstados: activo
        ? config.alertasClienteEstados.filter((e) => !estados.includes(e))
        : [...config.alertasClienteEstados, ...estados.filter((e) => !config.alertasClienteEstados.includes(e))],
    });
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje('');

    try {
      const res = await apiFetch(`${API_URL}/api/configuracion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setMensaje('✅ Configuración general y módulo de condiciones de envío guardados correctamente.');
      } else {
        setMensaje('❌ Error al guardar la configuración.');
      }
    } catch (err) {
      setMensaje('❌ Error de conexión al servidor.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl pb-12">
      <div>
        <h1 className="text-3xl font-black text-gray-900">⚙️ Configuración General y Condiciones de Envío</h1>
        <p className="text-sm text-gray-500">Administra los parámetros de envío, WhatsApp de atención, marca y banners promocionales</p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xs border border-gray-200 space-y-6">
        {mensaje && (
          <div className="text-xs font-bold p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800">
            {mensaje}
          </div>
        )}

        {cargando ? (
          <div className="p-8 text-center text-gray-400 font-bold">
            ⌛ Cargando parámetros del sistema...
          </div>
        ) : (
          <form onSubmit={handleGuardar} className="space-y-6">
            
            {/* 🚚 MÓDULO DE REGLAS Y CONDICIONES DE ENVÍO */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4 shadow-sm border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚚</span>
                <div>
                  <h3 className="font-extrabold text-sm text-amber-300">MÓDULO DE CONDICIONES Y TARIFAS DE ENVÍO</h3>
                  <p className="text-[11px] text-slate-300">
                    Define las reglas dinámicas de envío gratis o tarifa fija que se aplicarán en el modal de pedido directo.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Monto Umbral para Envío GRATIS (S/.) *
                  </label>
                  <p className="text-[10px] text-slate-400 mb-1">
                    Pedidos iguales o superiores a este monto tendrán costo de envío S/. 0.00 (Ej: 30.00)
                  </p>
                  <input
                    type="number"
                    step="0.10"
                    required
                    value={config.umbralEnvioGratis}
                    onChange={(e) => setConfig({ ...config, umbralEnvioGratis: Number(e.target.value) })}
                    placeholder="30.00"
                    className="w-full bg-slate-800 border border-slate-700 text-white font-mono font-black text-sm rounded-xl p-3 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    Costo Fijo de Envío Estándar (S/.) *
                  </label>
                  <p className="text-[10px] text-slate-400 mb-1">
                    Se cobrará si el total del pedido es menor o igual a S/. 29.99 (Ej: 15.00)
                  </p>
                  <input
                    type="number"
                    step="0.50"
                    required
                    value={config.costoEnvioFijo}
                    onChange={(e) => setConfig({ ...config, costoEnvioFijo: Number(e.target.value) })}
                    placeholder="15.00"
                    className="w-full bg-slate-800 border border-slate-700 text-white font-mono font-black text-sm rounded-xl p-3 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Número de WhatsApp de Atención y Pedidos *
              </label>
              <p className="text-[11px] text-gray-500 mb-1">
                A este número llegarán los mensajes de pedido rápido de WhatsApp (Incluir código 51 de Perú).
              </p>
              <input
                type="tel"
                required
                value={config.whatsappNumber}
                onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                placeholder="51992001002"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-sm font-bold text-blue-600 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Store Name & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Nombre de la Tienda *</label>
                <input
                  type="text"
                  required
                  value={config.storeName}
                  onChange={(e) => setConfig({ ...config, storeName: e.target.value })}
                  placeholder="P&R Store"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">Subtítulo de Marca</label>
                <input
                  type="text"
                  value={config.storeSub}
                  onChange={(e) => setConfig({ ...config, storeSub: e.target.value })}
                  placeholder="Calidad que te acompaña."
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Announcement Bar Text */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">Texto del Banner Promocional Superior</label>
              <input
                type="text"
                value={config.announcementText}
                onChange={(e) => setConfig({ ...config, announcementText: e.target.value })}
                placeholder="🔥 ¡OFERTA POR TIEMPO LIMITADO! PAGO CONTRA ENTREGA EN LIMA"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {/* Logo Upload */}
            <div className="border border-dashed border-gray-300 p-4 rounded-2xl bg-gray-50 space-y-2">
              <label className="block text-xs font-bold text-gray-800 uppercase">Logo Personalizado de la Tienda</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-900 file:text-white cursor-pointer"
              />

              {config.logoUrl && (
                <div className="flex items-center gap-3 pt-2">
                  <img src={config.logoUrl} alt="Logo" className="w-16 h-16 object-cover rounded-full border border-gray-300" />
                  <span className="text-xs font-bold text-green-600">Logo cargado y activo para la tienda web</span>
                </div>
              )}
            </div>

            {/* NOTIFICACIONES POR CORREO (Resend, remitente info@pyr-store.com) */}
            <div className="border border-slate-200 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">CONFIGURACIÓN DE NOTIFICACIONES</span>
                  <h4 className="font-heading font-black text-sm text-white">📩 Correo Corporativo (info@pyr-store.com)</h4>
                </div>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  info@pyr-store.com
                </span>
              </div>

              <p className="text-xs text-slate-300">
                Cada nuevo pedido, anulación y actualización de estado envía una alerta automática desde <strong>info@pyr-store.com</strong>.
                La clave de envío (Resend) se configura directamente en Railway, no aquí.
              </p>

              {/* DESTINATARIOS DE LAS ALERTAS DE ADMIN */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="block text-[11px] font-bold text-slate-300 uppercase">Correos que reciben las alertas (pedido nuevo, anulado, reportes)</label>
                <div className="flex flex-wrap gap-2">
                  {config.alertasAdminEmails.map((correo) => (
                    <span key={correo} className="bg-slate-800 border border-slate-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
                      {correo}
                      <button type="button" onClick={() => quitarCorreoAlerta(correo)} className="text-slate-400 hover:text-red-400">✕</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={nuevoCorreoAlerta}
                    onChange={(e) => setNuevoCorreoAlerta(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); agregarCorreoAlerta(); } }}
                    placeholder="nuevo-correo@pyr-store.com"
                    className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={agregarCorreoAlerta}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs px-4 rounded-xl transition"
                  >
                    + Agregar
                  </button>
                </div>
              </div>

              {/* QUE ALERTAS DE ADMIN ESTAN ACTIVAS */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="block text-[11px] font-bold text-slate-300 uppercase">Alertas activas para ti</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'alertasPedidoNuevoActiva' as const, label: '🚨 Pedido nuevo' },
                    { key: 'alertasPedidoAnuladoActiva' as const, label: '🔴 Pedido anulado' },
                    { key: 'alertasReporteDiarioActiva' as const, label: '📊 Reporte diario' },
                    { key: 'alertasReporteQuincenalActiva' as const, label: '📊 Reporte quincenal' },
                    { key: 'alertasReporteMensualActiva' as const, label: '📊 Reporte mensual' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl p-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config[item.key]}
                        onChange={(e) => setConfig({ ...config, [item.key]: e.target.checked })}
                        className="accent-amber-400"
                      />
                      <span className="font-bold">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* QUE ESTADOS NOTIFICAN AL CLIENTE */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="block text-[11px] font-bold text-slate-300 uppercase">Qué le llega por correo al cliente</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {GRUPOS_ESTADOS_CLIENTE.map((grupo) => (
                    <label key={grupo.label} className="flex items-start gap-2 bg-slate-800 border border-slate-700 rounded-xl p-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={grupoEstadoActivo(grupo.estados)}
                        onChange={() => toggleGrupoEstado(grupo.estados)}
                        className="accent-amber-400 mt-0.5"
                      />
                      <span>
                        <span className="font-bold block">{grupo.label}</span>
                        <span className="text-slate-400 text-[10px]">{grupo.recomendado}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Enviar correo de prueba a</label>
                  <input
                    type="email"
                    value={adminEmailTest}
                    onChange={(e) => setAdminEmailTest(e.target.value)}
                    placeholder="mpascual@pyr-store.com"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={probarCorreoSmtp}
                  disabled={probandoCorreo}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  <span>{probandoCorreo ? '⌛ Enviando Prueba...' : '🧪 Enviar Correo de Prueba'}</span>
                </button>
              </div>

              {resultadoPrueba && (
                <div className={`p-3 rounded-xl text-xs font-bold ${resultadoPrueba.includes('✅') ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700' : 'bg-red-950/80 text-red-300 border border-red-700'}`}>
                  {resultadoPrueba}
                </div>
              )}
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={guardando}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-4 px-6 rounded-2xl text-xs shadow-md transition transform hover:-translate-y-0.5"
            >
              {guardando ? 'Guardando Parámetros...' : '💾 GUARDAR CONFIGURACIÓN Y REGLAS DE ENVÍO'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

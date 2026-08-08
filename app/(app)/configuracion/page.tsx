'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';

type ConfigData = {
  whatsappNumber: string;
  storeName: string;
  storeSub: string;
  announcementText: string;
  logoUrl: string;
  umbralEnvioGratis?: number;
  costoEnvioFijo?: number;
};

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<ConfigData>({
    whatsappNumber: '51992001002',
    storeName: 'P&R Store',
    storeSub: 'Calidad que te acompaña.',
    announcementText: '🔥 ¡OFERTA POR TIEMPO LIMITADO! PAGO CONTRA ENTREGA EN LIMA Y ENVÍOS A TODO EL PERÚ 🚛',
    logoUrl: '',
    umbralEnvioGratis: 30,
    costoEnvioFijo: 15,
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  // Estados Zoho Mail SMTP
  const [zohoPassword, setZohoPassword] = useState('');
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
      const res = await fetch(`${API_URL}/api/configuracion/probar-correo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailDestino: adminEmailTest || 'mpascual@pyr-store.com',
          zohoPassword: zohoPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResultadoPrueba(data.message || '✅ Correo de prueba enviado exitosamente.');
      } else {
        setResultadoPrueba(`❌ Error SMTP: ${data.error || 'No se pudo enviar el correo de prueba.'}`);
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
      const res = await fetch(`${API_URL}/api/configuracion`);
      const data = await res.json();
      if (data) {
        setConfig({
          ...data,
          umbralEnvioGratis: data.umbralEnvioGratis !== undefined ? Number(data.umbralEnvioGratis) : 30,
          costoEnvioFijo: data.costoEnvioFijo !== undefined ? Number(data.costoEnvioFijo) : 15,
        });
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

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje('');

    try {
      const res = await fetch(`${API_URL}/api/configuracion`, {
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

            {/* ZOHO MAIL SMTP NOTIFICATIONS CARD */}
            <div className="border border-slate-200 p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">CONFIGURACIÓN DE NOTIFICACIONES</span>
                  <h4 className="font-heading font-black text-sm text-white">📩 Correo Corporativo Zoho Mail (info@pyr-store.com)</h4>
                </div>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                  info@pyr-store.com
                </span>
              </div>

              <p className="text-xs text-slate-300">
                Cada nuevo pedido registrado en la web enviará una alerta instantánea desde <strong>info@pyr-store.com</strong> hacia <strong>mpascual@pyr-store.com</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Clave de Aplicación Zoho Mail (info@pyr-store.com)</label>
                  <input
                    type="password"
                    value={zohoPassword}
                    onChange={(e) => setZohoPassword(e.target.value)}
                    placeholder="Ingresa la clave de info@pyr-store.com"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">Correo Notificación Admin</label>
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
                  <span>{probandoCorreo ? '⌛ Enviando Prueba...' : '🧪 Enviar Correo de Prueba a Zoho Mail'}</span>
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

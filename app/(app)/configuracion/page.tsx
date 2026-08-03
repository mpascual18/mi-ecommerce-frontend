'use client';

import { useEffect, useState } from 'react';

type ConfigData = {
  whatsappNumber: string;
  storeName: string;
  storeSub: string;
  announcementText: string;
  logoUrl: string;
};

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<ConfigData>({
    whatsappNumber: '51992001002',
    storeName: 'P&R Store',
    storeSub: 'Calidad que te acompaña.',
    announcementText: '🔥 ¡OFERTA POR TIEMPO LIMITADO! PAGO CONTRA ENTREGA EN LIMA Y ENVÍOS A TODO EL PERÚ 🚛',
    logoUrl: '',
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarConfig();
  }, []);

  const cargarConfig = async () => {
    setCargando(true);
    try {
      const res = await fetch('http://localhost:4000/api/configuracion');
      const data = await res.json();
      if (data) setConfig(data);
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
      const res = await fetch('http://localhost:4000/api/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setMensaje('✅ Configuración de la tienda guardada correctamente.');
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
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-black text-gray-900">⚙️ Configuración General de la Tienda Web</h1>
        <p className="text-sm text-gray-500">Administra los números de contacto por WhatsApp, la marca y banners promocionales</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
        {mensaje && (
          <div className="text-xs font-bold p-3 rounded-xl bg-gray-100 border border-gray-200">
            {mensaje}
          </div>
        )}

        {cargando ? (
          <div className="p-8 text-center text-gray-400 font-bold">
            ⌛ Cargando datos de la tienda...
          </div>
        ) : (
          <form onSubmit={handleGuardar} className="space-y-5">
            {/* WhatsApp Number */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                Número de WhatsApp de Atención y Pedidos *
              </label>
              <p className="text-[11px] text-gray-500 mb-1">
                A este número llegarán todos los pedidos generados desde las landings de Meta Ads y el catálogo web (Incluir código 51 de Perú).
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

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={guardando}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold py-3.5 px-6 rounded-xl text-xs shadow-sm transition"
            >
              {guardando ? 'Guardando...' : 'GUARDAR CONFIGURACIÓN DE TIENDA'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

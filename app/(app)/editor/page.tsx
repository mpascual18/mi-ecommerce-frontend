'use client';

import { useEffect, useState } from 'react';

type ThemeConfig = {
  storeName: string;
  storeSub: string;
  announcementText: string;
  tickerBgColor: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBannerUrl: string;
  logoUrl: string;
  whatsappNumber: string;
};

export default function EditorPlantillaPage() {
  const [config, setConfig] = useState<ThemeConfig>({
    storeName: 'P&R Store',
    storeSub: 'Calidad que te acompaña.',
    announcementText: '🔥 ¡OFERTA POR TIEMPO LIMITADO! PAGO CONTRA ENTREGA EN LIMA Y ENVÍOS A TODO EL PERÚ 🚛',
    tickerBgColor: '#0F172A',
    heroTitle: 'Calidad que te acompaña en tu día a día.',
    heroSubtitle: 'En P&R Store seleccionamos lo mejor en tendencias para el hogar, cocina, tecnología y bienestar con garantía comprobada.',
    heroBannerUrl: '',
    logoUrl: '',
    whatsappNumber: '51900000000',
  });

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
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
      if (data) {
        setConfig((prev) => ({ ...prev, ...data }));
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

  const handleGuardar = async () => {
    setGuardando(true);
    setMensaje('');

    try {
      const res = await fetch('http://localhost:4000/api/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setMensaje('✨ ¡Plantilla y diseño publicados exitosamente en la tienda web!');
      } else {
        setMensaje('❌ Error al publicar cambios.');
      }
    } catch (err) {
      setMensaje('❌ Error de conexión al servidor.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* HEADER DEL EDITOR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">🎨 Editor Visual de Plantilla (Theme Customizer)</h1>
          <p className="text-xs text-gray-500">Personaliza imágenes, colores, textos y banners en tiempo real estilo Shopify</p>
        </div>

        <div className="flex items-center gap-3">
          {/* DEVICE SWITCHER */}
          <div className="bg-gray-100 p-1 rounded-xl flex gap-1 border border-gray-200 text-xs font-bold">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`px-3 py-1.5 rounded-lg transition ${previewDevice === 'desktop' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}`}
            >
              💻 Escritorio
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`px-3 py-1.5 rounded-lg transition ${previewDevice === 'mobile' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}`}
            >
              📱 Celular
            </button>
          </div>

          <button
            onClick={handleGuardar}
            disabled={guardando}
            className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition"
          >
            {guardando ? 'Publicando...' : '🚀 PUBLICAR CAMBIOS EN LA WEB'}
          </button>
        </div>
      </div>

      {mensaje && (
        <div className="text-xs font-bold p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
          {mensaje}
        </div>
      )}

      {/* EDITOR MAIN SPLIT VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* PANEL IZQUIERDO: CONTROLES DE EDICION */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-5 space-y-6 max-h-[80vh] overflow-y-auto shadow-xs">
          
          {/* SECCION 1: MARCA Y LOGO */}
          <div className="space-y-3 border-b border-gray-100 pb-4">
            <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>🏷️ Identidad de Marca</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nombre de la Tienda</label>
              <input
                type="text"
                value={config.storeName}
                onChange={(e) => setConfig({ ...config, storeName: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Eslogan Oficial</label>
              <input
                type="text"
                value={config.storeSub}
                onChange={(e) => setConfig({ ...config, storeSub: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Subir / Cambiar Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-900 file:text-white cursor-pointer"
              />
            </div>
          </div>

          {/* SECCION 2: MARQUESINA TICKER DE ANUNCIOS */}
          <div className="space-y-3 border-b border-gray-100 pb-4">
            <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>📢 Barra de Anuncios Ticker</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Texto de Marquesina</label>
              <input
                type="text"
                value={config.announcementText}
                onChange={(e) => setConfig({ ...config, announcementText: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Color de Fondo del Ticker</label>
              <select
                value={config.tickerBgColor}
                onChange={(e) => setConfig({ ...config, tickerBgColor: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold"
              >
                <option value="#0F172A">Negro Carbono (#0F172A)</option>
                <option value="#A33240">Rojo P&R (#A33240)</option>
                <option value="#333333">Grafito (#333333)</option>
                <option value="#D4AF37">Dorado Acento (#D4AF37)</option>
              </select>
            </div>
          </div>

          {/* SECCION 3: HERO BANNER */}
          <div className="space-y-3 border-b border-gray-100 pb-4">
            <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>🖼️ Banner Hero Principal</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Título del Banner</label>
              <input
                type="text"
                value={config.heroTitle}
                onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Subtítulo Persuasivo</label>
              <textarea
                rows={2}
                value={config.heroSubtitle}
                onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
              ></textarea>
            </div>
          </div>

          {/* SECCION 4: WHATSAPP */}
          <div className="space-y-3">
            <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>💬 Contacto WhatsApp</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Número de WhatsApp (con código 51)</label>
              <input
                type="tel"
                value={config.whatsappNumber}
                onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-blue-600 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* PANEL DERECHO: PREVISUALIZACION EN VIVO (LIVE PREVIEW) */}
        <div className="lg:col-span-8 bg-gray-900 rounded-3xl border-4 border-gray-800 p-4 shadow-2xl flex flex-col items-center">
          <div className="text-white text-xs font-bold mb-3 flex items-center gap-2">
            <span>👁️ PREVISUALIZACIÓN EN TIEMPO REAL</span>
            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30">
              ● Sincronizado
            </span>
          </div>

          {/* PREVIEW CONTAINER SIMULATOR */}
          <div className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 shadow-2xl ${previewDevice === 'mobile' ? 'w-[375px] h-[650px]' : 'w-full h-[650px]'}`}>
            
            {/* SIMULATED TICKER */}
            <div style={{ backgroundColor: config.tickerBgColor }} className="text-white text-[11px] py-2 px-3 text-center font-bold tracking-wide flex justify-center items-center gap-2">
              <span>🔥 {config.announcementText}</span>
            </div>

            {/* SIMULATED HEADER */}
            <div className="bg-white border-b border-gray-200 p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#A33240] flex items-center justify-center text-white text-xs font-black">
                  {config.logoUrl ? <img src={config.logoUrl} className="w-full h-full object-cover rounded-xl" /> : 'P&R'}
                </div>
                <div>
                  <span className="font-extrabold text-sm text-[#A33240]">{config.storeName}</span>
                  <span className="block text-[9px] text-[#A33240] font-semibold leading-none">{config.storeSub}</span>
                </div>
              </div>
              <div className="bg-[#A33240] text-white px-3 py-1 rounded-full text-xs font-bold">
                🛒 Carrito (0)
              </div>
            </div>

            {/* SIMULATED HERO BANNER */}
            <div className="bg-gradient-to-r from-[#0F172A] via-[#721C26] to-[#A33240] text-white p-6 text-center space-y-3">
              <span className="inline-block bg-white/20 text-xs px-3 py-0.5 rounded-full font-bold uppercase">
                📦 IMPORTACIÓN DIRECTA
              </span>
              <h2 className="text-xl md:text-2xl font-black leading-tight">{config.heroTitle}</h2>
              <p className="text-xs text-gray-200 max-w-md mx-auto">{config.heroSubtitle}</p>
            </div>

            {/* SIMULATED CATALOG MOCK */}
            <div className="p-4 space-y-3 bg-gray-50 h-full">
              <span className="text-xs font-bold text-gray-800 uppercase block">Productos en Tendencia</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-2xl border border-gray-200 space-y-1">
                  <div className="h-24 bg-gray-200 rounded-xl overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1570197788417-0e82375c9371?q=80&w=400" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-bold text-xs block text-gray-900">Vaso Yogurera</span>
                  <span className="text-xs font-black text-[#A33240]">S/. 29.00</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-gray-200 space-y-1">
                  <div className="h-24 bg-gray-200 rounded-xl overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1546554137-f86b9593a222?q=80&w=400" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-bold text-xs block text-gray-900">Humidificador LED</span>
                  <span className="text-xs font-black text-[#A33240]">S/. 35.00</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

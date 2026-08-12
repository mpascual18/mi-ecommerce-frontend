'use client';

import { useEffect, useState } from 'react';
import { API_URL, apiFetch } from '@/lib/api';

type HeroSlide = {
  id: string;
  image: string;
  tagline: string;
  title: string;
  subtitle: string;
};

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
  heroOverlayOpacity: number;
  heroOverlayGradient: string;
  heroSlides: HeroSlide[];
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
    whatsappNumber: '51992001002',
    heroOverlayOpacity: 40,
    heroOverlayGradient: 'slate',
    heroSlides: [
      {
        id: '1',
        image: '/images/hero/hero-family.png',
        tagline: '🔥 TIENDA OFICIAL P&R STORE • LIMA & PROVINCIAS',
        title: 'Calidad premium que transformará tu hogar',
        subtitle: 'Importación directa con garantía comprobada. Los productos más innovadores para cocina, hogar y bienestar con envío express y pago contra entrega.',
      },
      {
        id: '2',
        image: '/images/hero/hero-delivery.png',
        tagline: '🚚 PAGO CONTRA ENTREGA EN LIMA & ENVÍOS NACIONALES',
        title: 'Miles de clientes felices recibiendo sus compras',
        subtitle: 'Compra con total seguridad. Pagas al recibir en tu puerta en Lima, o despacho express a todo el Perú por Shalom, Olva y Marvisur.',
      },
      {
        id: '3',
        image: '/images/hero/hero-kitchen.png',
        tagline: '⭐ GARANTÍA Y SATISFACCIÓN 100% COMPROBADA',
        title: 'Productos de importación directa al mejor precio',
        subtitle: 'Innovación, durabilidad y practicidad para el día a día de tu familia. ¡Haz tu pedido ahora y paga al recibir!',
      },
    ],
  });

  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activePreviewSlide, setActivePreviewSlide] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    cargarConfig();
  }, []);

  const cargarConfig = async () => {
    setCargando(true);
    try {
      const res = await apiFetch(`${API_URL}/api/configuracion`);
      const data = await res.json();
      if (data) {
        setConfig((prev) => ({
          ...prev,
          ...data,
          heroSlides: Array.isArray(data.heroSlides) && data.heroSlides.length > 0 ? data.heroSlides : prev.heroSlides,
          heroOverlayOpacity: data.heroOverlayOpacity !== undefined ? Number(data.heroOverlayOpacity) : 40,
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

  const handleSlideImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setConfig((prev) => {
        const nuevasSlides = [...prev.heroSlides];
        nuevasSlides[index] = { ...nuevasSlides[index], image: base64 };
        return { ...prev, heroSlides: nuevasSlides };
      });
    };
    reader.readAsDataURL(file);
  };

  const updateSlideField = (index: number, field: keyof HeroSlide, value: string) => {
    setConfig((prev) => {
      const nuevasSlides = [...prev.heroSlides];
      nuevasSlides[index] = { ...nuevasSlides[index], [field]: value };
      return { ...prev, heroSlides: nuevasSlides };
    });
  };

  const agregarSlide = () => {
    const nueva: HeroSlide = {
      id: String(Date.now()),
      image: '/images/hero/hero-family.png',
      tagline: '✨ NUEVA FOTO / TESTIMONIO CLIENTE',
      title: 'Cliente Feliz Recibiendo su Pedido',
      subtitle: 'Entregas garantizadas con pago contra entrega en todo el Perú.',
    };
    setConfig((prev) => ({ ...prev, heroSlides: [...prev.heroSlides, nueva] }));
  };

  const eliminarSlide = (index: number) => {
    if (config.heroSlides.length <= 1) {
      alert('Debes mantener al menos 1 foto en el carrusel.');
      return;
    }
    setConfig((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((_, i) => i !== index),
    }));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    setMensaje('');

    try {
      const res = await apiFetch(`${API_URL}/api/configuracion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setMensaje('✨ ¡Diseño y fotos del Hero publicados exitosamente en la tienda web en vivo!');
      } else {
        setMensaje('❌ Error al publicar cambios.');
      }
    } catch (err) {
      setMensaje('❌ Error de conexión al servidor.');
    } finally {
      setGuardando(false);
    }
  };

  const slidesActuales = config.heroSlides && config.heroSlides.length > 0 ? config.heroSlides : [];
  const slidePreview = slidesActuales[activePreviewSlide % slidesActuales.length] || slidesActuales[0];

  return (
    <div className="space-y-4 pb-12">
      {/* HEADER DEL EDITOR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-gray-900">🎨 Editor Visual de Plantilla & Carrusel Hero</h1>
          <p className="text-xs text-gray-500">Personaliza fotos reales de clientes, opacidad del fondo y colores en tiempo real estilo Shopify</p>
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
            className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition transform hover:-translate-y-0.5"
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
        
        {/* PANEL IZQUIERDO: CONTROLES DE EDICIÓN */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-5 space-y-6 max-h-[85vh] overflow-y-auto shadow-xs">
          
          {/* SECCIÓN 1: CONTROL DE OPACIDAD Y TONO RELUCIENTE DE FOTOS */}
          <div className="space-y-3 border-b border-gray-100 pb-5 bg-amber-500/5 p-4 rounded-2xl border border-amber-400/30">
            <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider flex items-center justify-between">
              <span>☀️ Tono de Opacidad de Fotos</span>
              <span className="bg-amber-400 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full">
                {config.heroOverlayOpacity}% {config.heroOverlayOpacity <= 30 ? '☀️ Súper Reluciente' : config.heroOverlayOpacity <= 50 ? '✨ Claro y Equilibrado' : '🌙 Oscuro'}
              </span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Ajustar Oscurecimiento del Fondo (10% = Muy Claro / 90% = Muy Oscuro):
              </label>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={config.heroOverlayOpacity}
                onChange={(e) => setConfig({ ...config, heroOverlayOpacity: Number(e.target.value) })}
                className="w-full accent-red-600 cursor-pointer h-2 bg-gray-200 rounded-lg"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                💡 <em>Bajar la opacidad (ej. 30%-40%) hace que las fotos de clientes luzcan mucho más relucientes, nítidas y vivas.</em>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Estilo y Matiz del Degradado de Fondo</label>
              <select
                value={config.heroOverlayGradient}
                onChange={(e) => setConfig({ ...config, heroOverlayGradient: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-gray-900"
              >
                <option value="clear">✨ Claro & Reluciente (Transparencia Máxima)</option>
                <option value="slate">🌑 Negro Carbono Elegante (Default)</option>
                <option value="red-dark">🔴 Degradado Rojo P&R Store</option>
                <option value="gold-luxury">👑 Dorado Luxury DTC</option>
              </select>
            </div>
          </div>

          {/* SECCIÓN 2: GESTOR DE FOTOS Y DIAPOSITIVAS DEL HERO */}
          <div className="space-y-4 border-b border-gray-100 pb-5">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider">
                📸 Fotos del Carrusel Hero ({slidesActuales.length})
              </h3>
              <button
                type="button"
                onClick={agregarSlide}
                className="bg-gray-900 hover:bg-black text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-xs"
              >
                ➕ Agregar Foto
              </button>
            </div>

            <div className="space-y-4">
              {slidesActuales.map((slide, index) => (
                <div key={slide.id || index} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-red-600 uppercase">
                      Diapositiva #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => eliminarSlide(index)}
                      className="text-red-500 hover:text-red-700 text-xs font-bold"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>

                  {/* PREVIEW MINIATURA FOTO */}
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-14 bg-gray-200 rounded-xl overflow-hidden border border-gray-300 shrink-0">
                      <img src={slide.image} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="block text-[11px] font-bold text-gray-700">Subir / Cambiar Foto de Cliente</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSlideImageUpload(index, e)}
                        className="w-full text-[11px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-gray-800 file:text-white cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Etiqueta / Tagline Superior</label>
                    <input
                      type="text"
                      value={slide.tagline}
                      onChange={(e) => updateSlideField(index, 'tagline', e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl p-2 text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Título Principal</label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) => updateSlideField(index, 'title', e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl p-2 text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Subtítulo / Descripción</label>
                    <textarea
                      rows={2}
                      value={slide.subtitle}
                      onChange={(e) => updateSlideField(index, 'subtitle', e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl p-2 text-xs font-semibold"
                    ></textarea>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECCIÓN 3: MARCA Y LOGO */}
          <div className="space-y-3 border-b border-gray-100 pb-4">
            <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider">🏷️ Identidad de Marca</h3>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nombre de la Tienda</label>
              <input
                type="text"
                value={config.storeName}
                onChange={(e) => setConfig({ ...config, storeName: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold"
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

          {/* SECCIÓN 4: WHATSAPP Y ANUNCIOS */}
          <div className="space-y-3">
            <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider">💬 Contacto WhatsApp</h3>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Número de WhatsApp (con código 51)</label>
              <input
                type="tel"
                value={config.whatsappNumber}
                onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-blue-600"
              />
            </div>
          </div>

        </div>

        {/* PANEL DERECHO: PREVISUALIZACIÓN EN VIVO (LIVE PREVIEW) */}
        <div className="lg:col-span-7 bg-gray-950 rounded-3xl border-4 border-gray-800 p-4 shadow-2xl flex flex-col items-center sticky top-4">
          <div className="w-full text-white text-xs font-bold mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>👁️ PREVISUALIZACIÓN EN TIEMPO REAL</span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30">
                ● Sincronizado
              </span>
            </div>

            {/* SLIDE SELECTOR FOR PREVIEW */}
            <div className="flex gap-1">
              {slidesActuales.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActivePreviewSlide(i)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    i === activePreviewSlide ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Foto #{i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* PREVIEW CONTAINER SIMULATOR */}
          <div className={`bg-slate-950 rounded-2xl overflow-hidden transition-all duration-300 shadow-2xl relative ${previewDevice === 'mobile' ? 'w-[375px] h-[650px]' : 'w-full h-[650px]'}`}>
            
            {/* SIMULATED TICKER */}
            <div style={{ backgroundColor: config.tickerBgColor }} className="text-white text-[11px] py-2 px-3 text-center font-bold tracking-wide">
              🔥 {config.announcementText}
            </div>

            {/* SIMULATED HEADER */}
            <div className="bg-white border-b border-gray-200 p-3 flex justify-between items-center relative z-20">
              <div className="flex items-center gap-2">
                <div className="h-8 flex items-center shrink-0">
                  <img src={config.logoUrl || '/logo-completo.png'} className="h-8 w-auto object-contain" />
                </div>
              </div>
              <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                🛒 Carrito (0)
              </div>
            </div>

            {/* SIMULATED HERO BANNER WITH DYNAMIC OPACITY & GRADIENT */}
            <div className="relative h-96 flex items-center justify-center p-6 text-center text-white overflow-hidden">
              {/* SLIDE BACKGROUND IMAGE */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                style={{ backgroundImage: `url(${slidePreview?.image || '/images/hero/hero-family.png'})` }}
              />

              {/* DYNAMIC OPACITY OVERLAY */}
              <div
                className={`absolute inset-0 transition-opacity duration-300 ${
                  config.heroOverlayGradient === 'red-dark'
                    ? 'bg-gradient-to-r from-slate-950 via-red-950/80 to-slate-950/60'
                    : config.heroOverlayGradient === 'gold-luxury'
                    ? 'bg-gradient-to-r from-slate-950 via-amber-950/80 to-slate-950/60'
                    : config.heroOverlayGradient === 'clear'
                    ? 'bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-transparent'
                    : 'bg-gradient-to-r from-slate-950 via-slate-950/75 to-slate-950/50'
                }`}
                style={{ opacity: (config.heroOverlayOpacity || 40) / 100 }}
              />

              <div className="relative z-10 space-y-3 max-w-md">
                <span className="inline-block bg-gradient-to-r from-red-500/40 to-amber-500/40 text-amber-300 border border-amber-400/50 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider">
                  {slidePreview?.tagline || '🔥 TIENDA OFICIAL P&R STORE'}
                </span>
                <h2 className="text-xl md:text-2xl font-heading font-black leading-tight drop-shadow-md">
                  {slidePreview?.title || 'Calidad que te acompaña'}
                </h2>
                <p className="text-xs text-slate-200 font-medium leading-relaxed drop-shadow-sm">
                  {slidePreview?.subtitle || 'Los mejores productos para tu hogar.'}
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  <span className="bg-red-600 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md">
                    ⚡ VER CATALOGO
                  </span>
                  <span className="bg-emerald-600 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-md">
                    💬 WHATSAPP
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { useToast } from '@/components/ui/ToastProvider';
import { useConfirm } from '@/components/ui/ConfirmDialogProvider';
import { API_URL } from '@/lib/api';

const PRODUCTO_VACIO = {
  nombre: '',
  sku: '',
  price_soles: '',
  price_oferta: '',
  stock: '',
  categoria: 'General',
  badge: 'SIN BADGE',
  imagen_url: '',
  descripcion: '',
  hook_titulo: '',
  beneficios: '',
  galeria_urls: '',
  gif_url: '',
};

const MAX_GALERIA = 5;

function comprimirImagen(file, { maxDim = 1200, calidad = 0.88 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', calidad));
      };
      img.onerror = reject;
      img.src = event.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function lineasA(texto) {
  return (texto || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

export default function ModificarInventarioPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [productoEditando, setProductoEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [imagenPreview, setImagenPreview] = useState('');
  const [subiendoGaleria, setSubiendoGaleria] = useState(false);

  const obtenerProductos = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${API_URL}/api/productos`);
      const data = await res.json();
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      toast.error('No se pudieron cargar los productos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirNuevoProducto = () => {
    setProductoEditando({ ...PRODUCTO_VACIO });
    setImagenPreview('');
  };

  const abrirEdicion = (p) => {
    setProductoEditando(p);
    setImagenPreview(p.imagen_url || '');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductoEditando((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Compresión automática de la imagen principal en el cliente
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await comprimirImagen(file);
      setImagenPreview(compressed);
      setProductoEditando((prev) => ({ ...prev, imagen_url: compressed }));
    } catch (error) {
      console.error('Error al comprimir imagen:', error);
      toast.error('No se pudo procesar la imagen.');
    }
  };

  // Subida de imágenes adicionales para la galería (máx. 5)
  const handleGaleriaFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const actuales = lineasA(productoEditando.galeria_urls);
    const espacioDisponible = MAX_GALERIA - actuales.length;

    if (espacioDisponible <= 0) {
      toast.error(`Ya tienes el máximo de ${MAX_GALERIA} imágenes en la galería.`);
      e.target.value = '';
      return;
    }

    setSubiendoGaleria(true);
    try {
      const aProcesar = files.slice(0, espacioDisponible);
      const nuevas = await Promise.all(aProcesar.map((f) => comprimirImagen(f)));
      const combinadas = [...actuales, ...nuevas];
      setProductoEditando((prev) => ({ ...prev, galeria_urls: combinadas.join('\n') }));

      if (files.length > espacioDisponible) {
        toast.error(`Solo se agregaron ${espacioDisponible} imagen(es); el máximo es ${MAX_GALERIA}.`);
      }
    } catch (error) {
      console.error('Error al procesar imágenes de galería:', error);
      toast.error('No se pudieron procesar algunas imágenes.');
    } finally {
      setSubiendoGaleria(false);
      e.target.value = '';
    }
  };

  const quitarGaleriaImg = (idx) => {
    const actuales = lineasA(productoEditando.galeria_urls);
    actuales.splice(idx, 1);
    setProductoEditando((prev) => ({ ...prev, galeria_urls: actuales.join('\n') }));
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    setGuardando(true);
    const esNuevo = !productoEditando.id;

    try {
      const payload = {
        ...productoEditando,
        price_soles: Number(productoEditando.price_soles) || 0,
        price_oferta: productoEditando.price_oferta ? Number(productoEditando.price_oferta) : null,
        stock: Number(productoEditando.stock) || 0,
      };

      const res = await fetch(`${API_URL}/api/productos${esNuevo ? '' : `/${productoEditando.id}`}`, {
        method: esNuevo ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(esNuevo ? '¡Producto agregado al catálogo!' : '¡Producto actualizado correctamente!');
        setProductoEditando(null);
        obtenerProductos();
      } else {
        toast.error(esNuevo ? 'Error al agregar el producto.' : 'Error al actualizar el producto.');
      }
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      toast.error('No se pudo conectar con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  const eliminarProducto = async () => {
    const confirmado = await confirm({
      title: 'Eliminar producto',
      message: `¿Estás seguro de eliminar "${productoEditando.nombre}" del catálogo?`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!confirmado) return;

    setEliminando(true);
    try {
      const res = await fetch(`${API_URL}/api/productos/${productoEditando.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Producto eliminado del catálogo.');
        setProductoEditando(null);
        obtenerProductos();
      } else {
        toast.error('Error al eliminar el producto.');
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast.error('No se pudo conectar con el servidor.');
    } finally {
      setEliminando(false);
    }
  };

  const galeriaImgs = productoEditando ? lineasA(productoEditando.galeria_urls) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-gray-900">✏️ Modificar Inventario & Catálogo Web</h1>
          <p className="text-sm text-gray-500">Edita imágenes, precios de oferta, insignias y stock sincronizado en la web</p>
        </div>
        <Button onClick={abrirNuevoProducto}>➕ Nuevo Producto</Button>
      </div>

      <DataTable
        loading={cargando}
        rows={productos}
        rowKey={(p) => p.id}
        searchPlaceholder="Buscar por nombre, SKU o categoría..."
        searchableText={(p) => `${p.nombre} ${p.sku ?? ''} ${p.categoria ?? ''}`}
        emptyMessage="No hay productos registrados."
        columns={[
          {
            key: 'imagen',
            header: 'Imagen',
            render: (p) => (
              <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={p.imagen_url || 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?q=80&w=800'}
                  alt={p.nombre}
                  className="w-full h-full object-contain"
                />
              </div>
            ),
          },
          { key: 'nombre', header: 'Producto', sortable: true, sortValue: (p) => p.nombre },
          { key: 'categoria', header: 'Categoría', render: (p) => p.categoria || 'General' },
          { key: 'stock', header: 'Stock', sortable: true, sortValue: (p) => Number(p.stock) },
          { key: 'price_soles', header: 'Precio Normal', render: (p) => `S/ ${p.price_soles}` },
          {
            key: 'price_oferta',
            header: 'Precio Oferta',
            render: (p) => (p.price_oferta ? <span className="font-bold text-red-600">S/ {p.price_oferta}</span> : '-'),
          },
          {
            key: 'badge',
            header: 'Insignia',
            render: (p) => (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                {p.badge || 'SIN BADGE'}
              </span>
            ),
          },
          {
            key: 'acciones',
            header: 'Acciones',
            render: (p) => (
              <button className="text-red-600 font-bold hover:underline" onClick={() => abrirEdicion(p)}>
                Editar
              </button>
            ),
          },
        ]}
      />

      {productoEditando && (
        <Modal
          title={productoEditando.id ? `Editar Producto: ${productoEditando.nombre}` : '➕ Nuevo Producto'}
          onClose={() => setProductoEditando(null)}
          widthClassName="max-w-2xl"
        >
          <form onSubmit={guardarCambios} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                label="Nombre del Producto *"
                name="nombre"
                required
                value={productoEditando.nombre ?? ''}
                onChange={handleInputChange}
              />
              <FormField
                label="SKU"
                name="sku"
                value={productoEditando.sku ?? ''}
                onChange={handleInputChange}
              />
              <FormField
                label="Precio Normal (S/) *"
                name="price_soles"
                type="number"
                step="0.01"
                required
                value={productoEditando.price_soles ?? ''}
                onChange={handleInputChange}
              />
              <FormField
                label="Precio Oferta (S/)"
                name="price_oferta"
                type="number"
                step="0.01"
                value={productoEditando.price_oferta ?? ''}
                onChange={handleInputChange}
              />
              <FormField
                label="Stock *"
                name="stock"
                type="number"
                required
                value={productoEditando.stock ?? ''}
                onChange={handleInputChange}
              />

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Categoría</label>
                <select
                  name="categoria"
                  value={productoEditando.categoria ?? 'General'}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="Cocina">Cocina</option>
                  <option value="Hogar">Hogar</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Novedades">Novedades</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Insignia Promocional (Badge)</label>
                <select
                  name="badge"
                  value={productoEditando.badge ?? 'SIN BADGE'}
                  onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="MÁS VENDIDO">⭐ MÁS VENDIDO</option>
                  <option value="OFERTA TOP">🔥 OFERTA TOP</option>
                  <option value="NUEVO">✨ NUEVO</option>
                  <option value="TENDENCIA">🚀 TENDENCIA EN TIKTOK</option>
                  <option value="SIN BADGE">Ninguna</option>
                </select>
              </div>
            </div>

            <FormField
              label="Descripción"
              name="descripcion"
              value={productoEditando.descripcion ?? ''}
              onChange={handleInputChange}
            />

            {/* IMAGEN PRINCIPAL SUBIDA VISUAL CON COMPRESION */}
            <div className="border border-dashed border-gray-300 p-3 rounded-2xl bg-gray-50 space-y-2">
              <label className="block text-xs font-bold text-gray-800 uppercase">
                Imagen Principal del Producto (Subir o URL)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-600 file:text-white cursor-pointer"
                />
                <input
                  type="url"
                  name="imagen_url"
                  placeholder="O pegar URL de imagen..."
                  value={productoEditando.imagen_url ?? ''}
                  onChange={(e) => {
                    handleInputChange(e);
                    setImagenPreview(e.target.value);
                  }}
                  className="w-full bg-white border border-gray-300 rounded-xl p-2 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {imagenPreview && (
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-16 h-16 bg-white border border-gray-300 rounded-xl flex items-center justify-center overflow-hidden">
                    <img src={imagenPreview} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs font-bold text-green-600">Vista previa lista para la tienda web</span>
                </div>
              )}
            </div>

            {/* MARKETING / LANDING PAGE DEL PRODUCTO */}
            <div className="border border-dashed border-red-200 p-3 rounded-2xl bg-red-50/40 space-y-3">
              <label className="block text-xs font-black text-gray-800 uppercase">
                🎯 Landing Page del Producto (para Meta Ads)
              </label>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Título Gancho (Hook) — la frase grande que verá el cliente
                </label>
                <input
                  type="text"
                  name="hook_titulo"
                  placeholder='Ej: "Deja de botar yogurt en tu mochila"'
                  value={productoEditando.hook_titulo ?? ''}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Beneficios (uno por línea, se muestran con ✅)
                </label>
                <textarea
                  name="beneficios"
                  rows={4}
                  placeholder={'Mantiene todo fresco y separado\nCuchara incluida, no se pierde\nAntiderrame, ideal para la mochila'}
                  value={productoEditando.beneficios ?? ''}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  Imágenes Adicionales de Galería ({galeriaImgs.length}/{MAX_GALERIA})
                </label>

                {galeriaImgs.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {galeriaImgs.map((url, idx) => (
                      <div key={idx} className="relative w-full aspect-square bg-white border border-gray-300 rounded-xl overflow-hidden flex items-center justify-center">
                        <img src={url} alt={`Galería ${idx + 1}`} className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => quitarGaleriaImg(idx)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow"
                          title="Quitar imagen"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {galeriaImgs.length < MAX_GALERIA && (
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGaleriaFileUpload}
                    disabled={subiendoGaleria}
                    className="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-800 file:text-white cursor-pointer"
                  />
                )}
                {subiendoGaleria && <p className="text-[11px] text-gray-500">Procesando imágenes...</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  GIF de Demostración (URL, opcional — se anima solo en la página)
                </label>
                <input
                  type="url"
                  name="gif_url"
                  placeholder="https://.../demo.gif"
                  value={productoEditando.gif_url ?? ''}
                  onChange={handleInputChange}
                  className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              {productoEditando.id ? (
                <Button type="button" variant="danger" onClick={eliminarProducto} loading={eliminando}>
                  Eliminar del Catálogo
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setProductoEditando(null)}>
                  Cancelar
                </Button>
                <Button type="submit" loading={guardando}>
                  {productoEditando.id ? 'Guardar Cambios' : 'Agregar Producto'}
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

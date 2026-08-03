'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { useToast } from '@/components/ui/ToastProvider';
import { useConfirm } from '@/components/ui/ConfirmDialogProvider';

export default function ModificarInventarioPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [productoEditando, setProductoEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [imagenPreview, setImagenPreview] = useState('');

  const obtenerProductos = async () => {
    setCargando(true);
    try {
      const res = await fetch('http://localhost:4000/api/productos');
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
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductoEditando((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Compresión automática de imágenes en el cliente (Máx 800px) para máxima velocidad
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setImagenPreview(compressedBase64);
        setProductoEditando((prev) => ({ ...prev, imagen_url: compressedBase64 }));
      };
    };
    reader.readAsDataURL(file);
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const payload = {
        ...productoEditando,
        price_soles: Number(productoEditando.price_soles) || 0,
        price_oferta: productoEditando.price_oferta ? Number(productoEditando.price_oferta) : null,
        stock: Number(productoEditando.stock) || 0,
      };

      const res = await fetch(`http://localhost:4000/api/productos/${productoEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('¡Producto e imagen actualizados correctamente!');
        setProductoEditando(null);
        obtenerProductos();
      } else {
        toast.error('Error al actualizar el producto.');
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
      const res = await fetch(`http://localhost:4000/api/productos/${productoEditando.id}`, {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900">✏️ Modificar Inventario & Catálogo Web</h1>
          <p className="text-sm text-gray-500">Edita imágenes, precios de oferta, insignias y stock sincronizado en la web</p>
        </div>
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
              <img
                src={p.imagen_url || 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?q=80&w=800'}
                alt={p.nombre}
                className="w-12 h-12 object-cover rounded-lg border border-gray-200"
              />
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
              <button
                className="text-red-600 font-bold hover:underline"
                onClick={() => {
                  setProductoEditando(p);
                  setImagenPreview(p.imagen_url || '');
                }}
              >
                Editar
              </button>
            ),
          },
        ]}
      />

      {productoEditando && (
        <Modal
          title={`Editar Producto: ${productoEditando.nombre}`}
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

            {/* IMAGEN SUBIDA VISUAL CON COMPRESION */}
            <div className="border border-dashed border-gray-300 p-3 rounded-2xl bg-gray-50 space-y-2">
              <label className="block text-xs font-bold text-gray-800 uppercase">
                Imagen del Producto (Subir o URL)
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
                  <img src={imagenPreview} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-gray-300" />
                  <span className="text-xs font-bold text-green-600">Vista previa lista para la tienda web</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button type="button" variant="danger" onClick={eliminarProducto} loading={eliminando}>
                Eliminar del Catálogo
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setProductoEditando(null)}>
                  Cancelar
                </Button>
                <Button type="submit" loading={guardando}>
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

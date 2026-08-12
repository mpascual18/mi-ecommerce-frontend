'use client';

import { useEffect, useRef, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { useToast } from '@/components/ui/ToastProvider';
import { useConfirm } from '@/components/ui/ConfirmDialogProvider';
import { API_URL, apiFetch } from '@/lib/api';

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
  galeria_urls: '',
  oferta_2u_precio: '',
  oferta_3u_precio: '',
};

const MAX_IMAGENES = 5;

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

// Lee el archivo tal cual (sin recomprimir) — usado para GIFs, para no perder la animación
function leerComoDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Procesa un archivo de imagen: los GIF se conservan intactos (para mantener la animación),
// el resto se comprime vía canvas para no saturar la base de datos.
function procesarImagen(file) {
  if (file.type === 'image/gif') {
    return leerComoDataUrl(file);
  }
  return comprimirImagen(file);
}

function lineasA(texto) {
  return (texto || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

// Campos compartidos de precio manual por 2 y 3 unidades. Se usan tanto en el
// modal de creación/edición del producto (toggle inline) como en el módulo
// dedicado "Ofertas por Cantidad". El precio "antes" (tachado) siempre se
// calcula con el precio NORMAL del producto (no el de oferta unitaria).
function CamposOfertaCantidad({ precioNormal, valor2u, valor3u, onChange2u, onChange3u }) {
  const antes2u = precioNormal * 2;
  const antes3u = precioNormal * 3;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="block text-[11px] font-bold text-gray-600 mb-1">Precio por 2 unidades (S/)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={valor2u}
          onChange={(e) => onChange2u(e.target.value)}
          placeholder="Ej. 49.99"
          className="w-full bg-white border border-gray-300 rounded-xl p-2 text-xs font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
        />
        <p className="text-[10px] text-gray-400 mt-1">
          Precio antes (tachado): <span className="line-through">S/ {antes2u.toFixed(2)}</span>
        </p>
      </div>
      <div>
        <label className="block text-[11px] font-bold text-gray-600 mb-1">Precio por 3 unidades (S/)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={valor3u}
          onChange={(e) => onChange3u(e.target.value)}
          placeholder="Ej. 59.99"
          className="w-full bg-white border border-gray-300 rounded-xl p-2 text-xs font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
        />
        <p className="text-[10px] text-gray-400 mt-1">
          Precio antes (tachado): <span className="line-through">S/ {antes3u.toFixed(2)}</span>
        </p>
      </div>
      <p className="sm:col-span-2 text-[10px] text-gray-400">
        Deja los campos vacíos para usar el cálculo automático de la tienda. Si guardas un valor aquí, se mostrará tal cual en la página del producto.
      </p>
    </div>
  );
}

export default function ModificarInventarioPage() {
  const toast = useToast();
  const confirm = useConfirm();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [productoEditando, setProductoEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [subiendoImagenes, setSubiendoImagenes] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [tabActiva, setTabActiva] = useState('inventario'); // 'inventario' | 'ofertas'
  const [mostrarOferta, setMostrarOferta] = useState(false);
  const [productoOfertaSeleccionado, setProductoOfertaSeleccionado] = useState(null);
  const [guardandoOferta, setGuardandoOferta] = useState(false);
  const descripcionRef = useRef(null);
  const imagenDescripcionInputRef = useRef(null);

  const obtenerProductos = async () => {
    setCargando(true);
    try {
      const res = await apiFetch(`${API_URL}/api/productos`);
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

const PLANTILLA_DESCRIPCION_DEFAULT = `<p style="text-align: center;"><strong>🔥 ¡OFERTA ESPECIAL P&amp;R STORE! ✨</strong></p><p style="text-align: center;">✨ ¿Cansado de productos de baja calidad? ¡Este nuevo modelo lo cambia todo! 🚀 Con materiales premium de importación directa.</p><p style="text-align: left;">✔️ <strong>Calidad comprobada</strong> – Garantía directa P&amp;R Store<br />✔️ <strong>Cero complicaciones</strong> – Pago contra entrega en Lima y envíos a todo el Perú por Shalom/Olva<br />✔️ <strong>Diseño exclusivo</strong> – Practicidad y durabilidad asegurada para tu hogar</p>`;

  const abrirNuevoProducto = () => {
    setProductoEditando({
      ...PRODUCTO_VACIO,
      descripcion: PLANTILLA_DESCRIPCION_DEFAULT,
      badge: 'MÁS VENDIDO',
    });
    setModalKey((k) => k + 1);
    setMostrarOferta(true);
  };

  const abrirEdicion = (p) => {
    setProductoEditando(p);
    setModalKey((k) => k + 1);
    setMostrarOferta(!!(p.oferta_2u_precio || p.oferta_3u_precio));
  };

  const abrirOfertaProducto = (p) => {
    setProductoOfertaSeleccionado({ ...p });
  };

  const guardarOferta = async () => {
    if (!productoOfertaSeleccionado) return;
    setGuardandoOferta(true);
    try {
      const payload = {
        ...productoOfertaSeleccionado,
        price_soles: Number(productoOfertaSeleccionado.price_soles) || 0,
        price_oferta: productoOfertaSeleccionado.price_oferta ? Number(productoOfertaSeleccionado.price_oferta) : null,
        stock: Number(productoOfertaSeleccionado.stock) || 0,
        oferta_2u_precio:
          productoOfertaSeleccionado.oferta_2u_precio !== '' && productoOfertaSeleccionado.oferta_2u_precio != null
            ? Number(productoOfertaSeleccionado.oferta_2u_precio)
            : null,
        oferta_3u_precio:
          productoOfertaSeleccionado.oferta_3u_precio !== '' && productoOfertaSeleccionado.oferta_3u_precio != null
            ? Number(productoOfertaSeleccionado.oferta_3u_precio)
            : null,
      };

      const res = await apiFetch(`${API_URL}/api/productos/${productoOfertaSeleccionado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('¡Oferta por cantidad guardada!');
        setProductoOfertaSeleccionado(null);
        obtenerProductos();
      } else {
        let mensaje = 'Error al guardar la oferta.';
        try {
          const cuerpo = await res.json();
          if (cuerpo?.error) mensaje = cuerpo.error;
        } catch {
          // respuesta sin JSON, se usa el mensaje genérico
        }
        toast.error(mensaje);
      }
    } catch (error) {
      console.error('Error al guardar oferta por cantidad:', error);
      toast.error('No se pudo conectar con el servidor.');
    } finally {
      setGuardandoOferta(false);
    }
  };

  // Sincroniza el contenido del editor de descripción cada vez que se abre el modal
  // (nuevo producto o edición). No se vuelve a pisar en cada tecla para no perder
  // la posición del cursor mientras el usuario escribe.
  useEffect(() => {
    if (productoEditando && descripcionRef.current) {
      descripcionRef.current.innerHTML = productoEditando.descripcion || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalKey]);

  // Nota: leemos el HTML de forma SÍNCRONA en una variable local antes de llamar a
  // setProductoEditando. Tanto `e.currentTarget` (evento sintético de React) como
  // `descripcionRef.current` pueden volverse null si se leen dentro de la función
  // "updater" de setState, porque esa función puede ejecutarse en un tick posterior
  // (por eso el editor "no dejaba editar": tiraba abajo toda la app con un TypeError).
  const handleDescripcionInput = (e) => {
    const html = e.currentTarget.innerHTML;
    setProductoEditando((prev) => ({ ...prev, descripcion: html }));
  };

  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);

  // Ejecuta un comando de formato (negrita, cursiva, listas) sobre la selección actual
  const formatearDescripcion = (comando, valor = null) => {
    if (!descripcionRef.current) return;
    descripcionRef.current.focus();
    document.execCommand(comando, false, valor ?? undefined);
    const html = descripcionRef.current.innerHTML;
    setProductoEditando((prev) => ({ ...prev, descripcion: html }));
  };

  // Ajusta el tamaño de la imagen o GIF seleccionada (25%, 50%, 75%, 100%)
  const aplicarTamanoImagen = (anchoPorcentaje) => {
    if (!descripcionRef.current) return;
    descripcionRef.current.focus();

    if (imagenSeleccionada) {
      imagenSeleccionada.style.width = `${anchoPorcentaje}%`;
      imagenSeleccionada.style.maxWidth = '100%';
      imagenSeleccionada.style.height = 'auto';
    } else {
      const imgs = descripcionRef.current.querySelectorAll('img');
      imgs.forEach((img) => {
        img.style.width = `${anchoPorcentaje}%`;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
      });
    }

    const html = descripcionRef.current.innerHTML;
    setProductoEditando((prev) => ({ ...prev, descripcion: html }));
    toast.success(`GIF/Imagen ajustada al ${anchoPorcentaje}% de ancho`);
  };

  // Ajusta la alineación de la imagen o GIF seleccionada (Izquierda, Centro, Derecha)
  const aplicarAlineacionImagen = (alineacion) => {
    if (!descripcionRef.current) return;
    descripcionRef.current.focus();

    let img = imagenSeleccionada;
    if (!img) {
      const imgs = descripcionRef.current.querySelectorAll('img');
      if (imgs.length > 0) img = imgs[imgs.length - 1];
    }

    if (img) {
      img.style.display = 'block';
      if (alineacion === 'center') {
        img.style.marginLeft = 'auto';
        img.style.marginRight = 'auto';
      } else if (alineacion === 'right') {
        img.style.marginLeft = 'auto';
        img.style.marginRight = '0';
      } else {
        img.style.marginLeft = '0';
        img.style.marginRight = 'auto';
      }
    }

    const html = descripcionRef.current.innerHTML;
    setProductoEditando((prev) => ({ ...prev, descripcion: html }));
    toast.success(`Alineación de GIF/Imagen actualizada`);
  };

  const handleEditorClick = (e) => {
    if (e.target && e.target.tagName === 'IMG') {
      setImagenSeleccionada(e.target);
    } else {
      setImagenSeleccionada(null);
    }
  };

  // Inserta una imagen o GIF dentro del texto de la descripción, en la posición del cursor
  const handleInsertarImagenDescripcion = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await procesarImagen(file);
      if (descripcionRef.current) {
        descripcionRef.current.focus();
        document.execCommand(
          'insertHTML',
          false,
          `<img src="${dataUrl}" style="width:50%;max-width:100%;height:auto;border-radius:12px;margin:12px auto;display:block;" />`
        );
        const html = descripcionRef.current.innerHTML;
        setProductoEditando((prev) => ({ ...prev, descripcion: html }));
        toast.success('GIF/Imagen insertada a tamaño mediano (50%). Puedes ajustarla con los botones de la barra.');
      }
    } catch (error) {
      console.error('Error al insertar imagen en descripción:', error);
      toast.error('No se pudo insertar la imagen.');
    } finally {
      e.target.value = '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductoEditando((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Todas las imágenes del producto en un solo arreglo: la primera es la "principal"
  // (imagen_url) y el resto son la galería (galeria_urls). Esto evita tener dos
  // secciones separadas que confundían al usuario.
  const imagenesActuales = (p) => [p?.imagen_url, ...lineasA(p?.galeria_urls)].filter(Boolean);

  const guardarImagenes = (lista) => {
    const [principal, ...resto] = lista;
    setProductoEditando((prev) => ({
      ...prev,
      imagen_url: principal || '',
      galeria_urls: resto.join('\n'),
    }));
  };

  // Subida unificada de imágenes del producto (máx. 5, la 1ra = imagen principal)
  const handleImagenesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const actuales = imagenesActuales(productoEditando);
    const espacioDisponible = MAX_IMAGENES - actuales.length;

    if (espacioDisponible <= 0) {
      toast.error(`Ya tienes el máximo de ${MAX_IMAGENES} imágenes.`);
      e.target.value = '';
      return;
    }

    setSubiendoImagenes(true);
    try {
      const aProcesar = files.slice(0, espacioDisponible);
      const nuevas = await Promise.all(aProcesar.map((f) => procesarImagen(f)));
      guardarImagenes([...actuales, ...nuevas]);

      if (files.length > espacioDisponible) {
        toast.error(`Solo se agregaron ${espacioDisponible} imagen(es); el máximo es ${MAX_IMAGENES}.`);
      }
    } catch (error) {
      console.error('Error al procesar imágenes:', error);
      toast.error('No se pudieron procesar algunas imágenes.');
    } finally {
      setSubiendoImagenes(false);
      e.target.value = '';
    }
  };

  const quitarImagen = (idx) => {
    const actuales = imagenesActuales(productoEditando);
    actuales.splice(idx, 1);
    guardarImagenes(actuales);
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
        // Si el admin cerró el panel "¿Oferta por cantidad?" se limpian los valores,
        // aunque hubiera algo escrito antes de colapsarlo.
        oferta_2u_precio:
          mostrarOferta && productoEditando.oferta_2u_precio !== '' && productoEditando.oferta_2u_precio != null
            ? Number(productoEditando.oferta_2u_precio)
            : null,
        oferta_3u_precio:
          mostrarOferta && productoEditando.oferta_3u_precio !== '' && productoEditando.oferta_3u_precio != null
            ? Number(productoEditando.oferta_3u_precio)
            : null,
      };

      const res = await apiFetch(`${API_URL}/api/productos${esNuevo ? '' : `/${productoEditando.id}`}`, {
        method: esNuevo ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(esNuevo ? '¡Producto agregado al catálogo!' : '¡Producto actualizado correctamente!');
        setProductoEditando(null);
        obtenerProductos();
      } else {
        let mensaje = esNuevo ? 'Error al agregar el producto.' : 'Error al actualizar el producto.';
        try {
          const cuerpo = await res.json();
          if (cuerpo?.error) mensaje = cuerpo.error;
        } catch {
          // respuesta sin JSON, se usa el mensaje genérico
        }
        toast.error(mensaje);
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
      const res = await apiFetch(`${API_URL}/api/productos/${productoEditando.id}`, {
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

  const imagenesDelProducto = productoEditando ? imagenesActuales(productoEditando) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-gray-900">🛍️ Catálogo & Productos</h1>
          <p className="text-sm text-gray-500">
            {tabActiva === 'inventario'
              ? 'Edita imágenes, precios de oferta, insignias y stock sincronizado en la web'
              : 'Configura precios manuales para compras de 2 y 3 unidades'}
          </p>
        </div>
        {tabActiva === 'inventario' && <Button onClick={abrirNuevoProducto}>➕ Nuevo Producto</Button>}
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTabActiva('inventario')}
          className={`px-4 py-2.5 text-sm font-bold rounded-t-xl transition ${
            tabActiva === 'inventario'
              ? 'bg-white border border-b-0 border-gray-200 text-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📦 Modificar Inventario y Catálogo
        </button>
        <button
          type="button"
          onClick={() => setTabActiva('ofertas')}
          className={`px-4 py-2.5 text-sm font-bold rounded-t-xl transition ${
            tabActiva === 'ofertas'
              ? 'bg-white border border-b-0 border-gray-200 text-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🏷️ Ofertas por Cantidad
        </button>
      </div>

      {tabActiva === 'inventario' && (
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
      )}

      {tabActiva === 'ofertas' && (
        <DataTable
          loading={cargando}
          rows={productos}
          rowKey={(p) => p.id}
          searchPlaceholder="Buscar por nombre, SKU o categoría..."
          searchableText={(p) => `${p.nombre} ${p.sku ?? ''} ${p.categoria ?? ''}`}
          emptyMessage="No hay productos registrados. Primero agrega productos en Modificar Inventario y Catálogo."
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
            { key: 'price_soles', header: 'Precio Normal', render: (p) => `S/ ${p.price_soles}` },
            {
              key: 'oferta_2u',
              header: 'Oferta 2 unid.',
              render: (p) =>
                p.oferta_2u_precio ? (
                  <span className="font-bold text-emerald-600">S/ {p.oferta_2u_precio}</span>
                ) : (
                  <span className="text-gray-400">Sin configurar</span>
                ),
            },
            {
              key: 'oferta_3u',
              header: 'Oferta 3 unid.',
              render: (p) =>
                p.oferta_3u_precio ? (
                  <span className="font-bold text-emerald-600">S/ {p.oferta_3u_precio}</span>
                ) : (
                  <span className="text-gray-400">Sin configurar</span>
                ),
            },
            {
              key: 'acciones',
              header: 'Acciones',
              render: (p) => (
                <button className="text-red-600 font-bold hover:underline" onClick={() => abrirOfertaProducto(p)}>
                  Configurar
                </button>
              ),
            },
          ]}
        />
      )}

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

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Descripción</label>
              <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-red-500">
                <div className="flex flex-wrap items-center gap-1 bg-gray-50 border-b border-gray-200 p-1.5">
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => formatearDescripcion('bold')}
                    className="w-7 h-7 rounded-lg bg-white border border-gray-300 font-black text-xs hover:bg-gray-100"
                    title="Negrita"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => formatearDescripcion('italic')}
                    className="w-7 h-7 rounded-lg bg-white border border-gray-300 italic text-xs hover:bg-gray-100"
                    title="Cursiva"
                  >
                    I
                  </button>
                  <select
                    onChange={(e) => {
                      if (e.target.value) formatearDescripcion('fontSize', e.target.value);
                      e.target.value = '';
                    }}
                    defaultValue=""
                    className="h-7 rounded-lg bg-white border border-gray-300 text-[11px] font-bold px-1"
                    title="Tamaño de texto"
                  >
                    <option value="" disabled>Tamaño</option>
                    <option value="2">Pequeño</option>
                    <option value="3">Normal</option>
                    <option value="5">Grande</option>
                    <option value="7">Título</option>
                  </select>

                  {/* BOTONES DE LISTAS Y VIÑETAS */}
                  <div className="flex items-center gap-0.5 border-l border-r border-gray-300 px-1 my-0.5">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => formatearDescripcion('insertUnorderedList')}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-300 font-bold text-xs hover:bg-gray-100 flex items-center justify-center"
                      title="Lista con Viñetas (•)"
                    >
                      •
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => formatearDescripcion('insertOrderedList')}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-300 font-bold text-xs hover:bg-gray-100 flex items-center justify-center"
                      title="Lista Numerada (1. 2. 3.)"
                    >
                      1.
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => formatearDescripcion('removeFormat')}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-300 text-xs hover:bg-gray-100 flex items-center justify-center"
                      title="Quitar Formato / Limpiar Listas"
                    >
                      🧹
                    </button>
                  </div>

                  {/* BOTONES DE ALINEACIÓN DE PÁRRAFO */}
                  <div className="flex items-center gap-0.5 border-r border-gray-300 pr-1 my-0.5">
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => formatearDescripcion('justifyLeft')}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-gray-200 text-xs font-bold flex items-center justify-center"
                      title="Alinear a la Izquierda"
                    >
                      ⬅️
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => formatearDescripcion('justifyCenter')}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-gray-200 text-xs font-bold flex items-center justify-center"
                      title="Alinear al Centro"
                    >
                      ↔️
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => formatearDescripcion('justifyRight')}
                      className="w-7 h-7 rounded-lg bg-white hover:bg-gray-200 text-xs font-bold flex items-center justify-center"
                      title="Alinear a la Derecha"
                    >
                      ➡️
                    </button>
                  </div>

                  {/* CONTROLES DE TAMAÑO Y ALINEACIÓN DE GIFS E IMÁGENES */}
                  <div className="flex items-center gap-1 border-r border-gray-300 pr-1.5 my-0.5 bg-red-50/60 p-0.5 rounded-lg border border-red-200">
                    <span className="text-[10px] font-bold text-red-700 uppercase px-1">GIF/Foto:</span>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => aplicarTamanoImagen(25)}
                      className="px-1.5 h-6 rounded-md bg-white border border-gray-300 font-bold text-[10px] hover:bg-red-100"
                      title="Reducir GIF/Imagen a 25%"
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => aplicarTamanoImagen(50)}
                      className="px-1.5 h-6 rounded-md bg-white border border-gray-300 font-bold text-[10px] hover:bg-red-100"
                      title="Reducir GIF/Imagen a 50%"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => aplicarTamanoImagen(75)}
                      className="px-1.5 h-6 rounded-md bg-white border border-gray-300 font-bold text-[10px] hover:bg-red-100"
                      title="Ajustar GIF/Imagen a 75%"
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => aplicarTamanoImagen(100)}
                      className="px-1.5 h-6 rounded-md bg-white border border-gray-300 font-bold text-[10px] hover:bg-red-100"
                      title="Expandir GIF/Imagen a 100%"
                    >
                      100%
                    </button>

                    <div className="flex items-center gap-0.5 border-l border-red-200 pl-1">
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => aplicarAlineacionImagen('left')}
                        className="px-1 h-6 rounded-md bg-white border border-gray-300 font-bold text-[10px] hover:bg-red-100"
                        title="Alinear GIF/Imagen a la Izquierda"
                      >
                        Izquierda
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => aplicarAlineacionImagen('center')}
                        className="px-1 h-6 rounded-md bg-white border border-gray-300 font-bold text-[10px] hover:bg-red-100"
                        title="Centrar GIF/Imagen"
                      >
                        Centro
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => aplicarAlineacionImagen('right')}
                        className="px-1 h-6 rounded-md bg-white border border-gray-300 font-bold text-[10px] hover:bg-red-100"
                        title="Alinear GIF/Imagen a la Derecha"
                      >
                        Derecha
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => imagenDescripcionInputRef.current?.click()}
                    className="h-7 px-2 rounded-lg bg-white border border-gray-300 text-[11px] font-bold hover:bg-gray-100 flex items-center gap-1"
                    title="Insertar imagen o GIF"
                  >
                    🖼️ Insertar GIF/Foto
                  </button>
                  <input
                    ref={imagenDescripcionInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInsertarImagenDescripcion}
                    className="hidden"
                  />
                </div>
                <div
                  ref={descripcionRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleDescripcionInput}
                  onClick={handleEditorClick}
                  data-placeholder="Cuenta qué hace especial a este producto... puedes usar negrita, listas de viñetas, emojis 😍✨ e insertar imágenes o gifs"
                  className="descripcion-editor w-full min-h-[140px] max-h-80 overflow-y-auto p-3 text-sm focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                💡 Haz clic sobre cualquier GIF o Imagen en el editor y usa los botones <strong>25%, 50%, 75%, 100% y Centro</strong> para ajustar su tamaño y posición al instante.
              </p>
            </div>
            <style jsx>{`
              .descripcion-editor:empty:before {
                content: attr(data-placeholder);
                color: #9ca3af;
              }
              .descripcion-editor ul {
                list-style-type: disc !important;
                padding-left: 1.75rem !important;
                margin-top: 0.5rem !important;
                margin-bottom: 0.5rem !important;
              }
              .descripcion-editor ol {
                list-style-type: decimal !important;
                padding-left: 1.75rem !important;
                margin-top: 0.5rem !important;
                margin-bottom: 0.5rem !important;
              }
              .descripcion-editor li {
                margin-bottom: 0.25rem !important;
              }
              .descripcion-editor img {
                cursor: pointer;
                transition: all 0.2s ease;
                border: 2px dashed #cbd5e1;
              }
              .descripcion-editor img:hover, .descripcion-editor img:focus {
                border-color: #ef4444;
                outline: 2px solid #ef4444;
              }
            `}</style>

            {/* OFERTA POR CANTIDAD (inline, opcional al crear/editar) */}
            <div className="border border-gray-200 rounded-2xl p-3 bg-gray-50/60 space-y-3">
              <button
                type="button"
                onClick={() => setMostrarOferta((v) => !v)}
                className="flex items-center justify-between w-full text-xs font-bold text-gray-800"
              >
                <span>🏷️ ¿Oferta por cantidad? (2 y 3 unidades)</span>
                <span className="text-red-600">{mostrarOferta ? 'Ocultar ▲' : 'Configurar ▼'}</span>
              </button>

              {mostrarOferta && (
                <CamposOfertaCantidad
                  precioNormal={Number(productoEditando.price_soles) || 0}
                  valor2u={productoEditando.oferta_2u_precio ?? ''}
                  valor3u={productoEditando.oferta_3u_precio ?? ''}
                  onChange2u={(v) => setProductoEditando((prev) => ({ ...prev, oferta_2u_precio: v }))}
                  onChange3u={(v) => setProductoEditando((prev) => ({ ...prev, oferta_3u_precio: v }))}
                />
              )}
            </div>

            {/* IMÁGENES DEL PRODUCTO (unificado: principal + galería, máx. 5) */}
            <div className="border border-dashed border-gray-300 p-3 rounded-2xl bg-gray-50 space-y-2">
              <label className="block text-xs font-bold text-gray-800 uppercase">
                Imágenes del Producto ({imagenesDelProducto.length}/{MAX_IMAGENES})
              </label>
              <p className="text-[11px] text-gray-500">
                La primera imagen es la principal. Puedes subir hasta {MAX_IMAGENES} fotos (o GIFs) para mostrar más de un ángulo en la página del producto.
              </p>

              {imagenesDelProducto.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {imagenesDelProducto.map((url, idx) => (
                    <div key={idx} className="relative w-full aspect-square bg-white border border-gray-300 rounded-xl overflow-hidden flex items-center justify-center">
                      <img src={url} alt={`Imagen ${idx + 1}`} className="w-full h-full object-contain" />
                      {idx === 0 && (
                        <span className="absolute bottom-0.5 left-0.5 bg-gray-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Principal
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => quitarImagen(idx)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow"
                        title="Quitar imagen"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {imagenesDelProducto.length < MAX_IMAGENES && (
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagenesUpload}
                  disabled={subiendoImagenes}
                  className="text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-600 file:text-white cursor-pointer"
                />
              )}
              {subiendoImagenes && <p className="text-[11px] text-gray-500">Procesando imágenes...</p>}
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

      {productoOfertaSeleccionado && (
        <Modal
          title={`🏷️ Oferta por Cantidad: ${productoOfertaSeleccionado.nombre}`}
          onClose={() => setProductoOfertaSeleccionado(null)}
          widthClassName="max-w-lg"
        >
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              Precio normal actual:{' '}
              <span className="font-bold text-gray-800">
                S/ {Number(productoOfertaSeleccionado.price_soles || 0).toFixed(2)}
              </span>
            </p>
            <CamposOfertaCantidad
              precioNormal={Number(productoOfertaSeleccionado.price_soles) || 0}
              valor2u={productoOfertaSeleccionado.oferta_2u_precio ?? ''}
              valor3u={productoOfertaSeleccionado.oferta_3u_precio ?? ''}
              onChange2u={(v) => setProductoOfertaSeleccionado((prev) => ({ ...prev, oferta_2u_precio: v }))}
              onChange3u={(v) => setProductoOfertaSeleccionado((prev) => ({ ...prev, oferta_3u_precio: v }))}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setProductoOfertaSeleccionado(null)}>
                Cancelar
              </Button>
              <Button type="button" onClick={guardarOferta} loading={guardandoOferta}>
                Guardar Oferta
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

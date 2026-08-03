'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';

type Producto = { id: number; nombre: string; sku: string; price_soles: number; stock: number };
type ProductoSeleccionado = { id: number; nombre: string; sku: string; price_soles: number; cantidad: number };
type Cliente = { [key: string]: string };

const CLIENTE_VACIO: Cliente = {
  nombre: '',
  apellido: '',
  documento: '',
  direccion: '',
  referencia: '',
  distrito: '',
  departamento: '',
  provincia: '',
  celular: '',
  correo: '',
};

export default function RegistrarVentaPage() {
  const toast = useToast();
  const [cliente, setCliente] = useState<Cliente>(CLIENTE_VACIO);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoSeleccionado[]>([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch('http://localhost:4000/api/productos')
      .then((res) => res.json())
      .then((data) => setProductos(data))
      .catch((err) => console.error('Error al cargar productos:', err));
  }, []);

  const handleProductoChange = (index: number, field: string, value: string | number) => {
    const nuevosProductos = [...productosSeleccionados];
    if (field === 'nombre') {
      const prod = productos.find((p) => p.nombre.toLowerCase() === value.toString().toLowerCase());
      if (prod) {
        nuevosProductos[index] = {
          id: prod.id,
          nombre: prod.nombre,
          sku: prod.sku,
          price_soles: prod.price_soles,
          cantidad: 1,
        };
      } else {
        nuevosProductos[index].nombre = value.toString();
      }
    } else if (field === 'cantidad') {
      nuevosProductos[index].cantidad = parseInt(value.toString()) || 1;
    }
    setProductosSeleccionados(nuevosProductos);
  };

  const agregarFilaProducto = () => {
    setProductosSeleccionados([
      ...productosSeleccionados,
      { id: 0, nombre: '', sku: '', price_soles: 0, cantidad: 1 },
    ]);
  };

  const eliminarFilaProducto = (index: number) => {
    const copia = [...productosSeleccionados];
    copia.splice(index, 1);
    setProductosSeleccionados(copia);
  };

  const total = productosSeleccionados.reduce((acc, p) => acc + p.price_soles * p.cantidad, 0);

  const handleClienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCliente((prev) => ({ ...prev, [name]: value }));
  };

  const registrarVenta = async () => {
    const productosValidados = productosSeleccionados.filter((p) => p.id !== 0);
    if (productosValidados.length === 0) {
      toast.error('Debe seleccionar al menos un producto válido.');
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch('http://localhost:4000/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente, productos: productosValidados }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        toast.error(`Error al registrar venta: ${errorText}`);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'boleta_venta.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Venta registrada correctamente.');
      setCliente(CLIENTE_VACIO);
      setProductosSeleccionados([]);
    } catch (error) {
      console.error(error);
      toast.error('Error en la conexión.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🧾 Registrar Venta</h1>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm">
        {Object.entries(cliente).map(([key, value]) => (
          <input
            key={key}
            name={key}
            value={value}
            onChange={handleClienteChange}
            placeholder={key.toUpperCase()}
            className="p-2 border rounded-lg"
            type="text"
          />
        ))}
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">🧺 Productos Seleccionados</h2>
        <Button variant="secondary" onClick={agregarFilaProducto} className="mb-4">
          ➕ Agregar producto
        </Button>

        <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Descripción</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Precio S/</th>
                <th className="p-3">Cantidad</th>
                <th className="p-3">Subtotal</th>
                <th className="p-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {productosSeleccionados.map((p, i) => (
                <tr key={i} className="border-t border-gray-100">
                  <td className="p-2">
                    <input
                      type="text"
                      className="w-full border rounded-lg px-2 py-1"
                      value={p.nombre}
                      onChange={(e) => handleProductoChange(i, 'nombre', e.target.value)}
                      list="lista-productos"
                    />
                    <datalist id="lista-productos">
                      {productos.map((prod) => (
                        <option key={prod.id} value={prod.nombre} />
                      ))}
                    </datalist>
                  </td>
                  <td className="p-2">{p.sku}</td>
                  <td className="p-2">S/ {p.price_soles}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="w-20 border rounded-lg px-2 py-1"
                      value={p.cantidad}
                      onChange={(e) => handleProductoChange(i, 'cantidad', e.target.value)}
                      min="1"
                    />
                  </td>
                  <td className="p-2">S/ {(p.price_soles * p.cantidad).toFixed(2)}</td>
                  <td className="p-2">
                    <button onClick={() => eliminarFilaProducto(i)} className="text-danger hover:underline">
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 font-bold text-right">Total: S/ {total.toFixed(2)}</div>
      </section>

      <div className="text-right">
        <Button variant="success" onClick={registrarVenta} loading={enviando}>
          💾 Finalizar Venta
        </Button>
      </div>
    </div>
  );
}

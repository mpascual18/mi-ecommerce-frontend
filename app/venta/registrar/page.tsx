'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar';

type Producto = {
  id: number;
  nombre: string;
  sku: string;
  price_soles: number;
  stock: number;
};

type ProductoSeleccionado = {
  id: number;
  nombre: string;
  sku: string;
  price_soles: number;
  cantidad: number;
};

type Cliente = {
  [key: string]: string;
};

export default function RegistrarVentaPage() {
  const [cliente, setCliente] = useState<Cliente>({
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
  });

  const [productos, setProductos] = useState<Producto[]>([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoSeleccionado[]>([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/productos')
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error('Error al cargar productos:', err));
  }, []);

  const handleProductoChange = (index: number, field: string, value: string | number) => {
    const nuevosProductos = [...productosSeleccionados];
    if (field === 'nombre') {
      const prod = productos.find(p => p.nombre.toLowerCase() === value.toString().toLowerCase());
      if (prod) {
        nuevosProductos[index] = {
          id: prod.id,
          nombre: prod.nombre,
          sku: prod.sku,
          price_soles: prod.price_soles,
          cantidad: 1
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
    setProductosSeleccionados([...productosSeleccionados, {
      id: 0,
      nombre: '',
      sku: '',
      price_soles: 0,
      cantidad: 1,
    }]);
  };

  const eliminarFilaProducto = (index: number) => {
    const copia = [...productosSeleccionados];
    copia.splice(index, 1);
    setProductosSeleccionados(copia);
  };

  const total = productosSeleccionados.reduce(
    (acc, p) => acc + p.price_soles * p.cantidad,
    0
  );

  const handleClienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCliente(prev => ({ ...prev, [name]: value }));
  };

  const registrarVenta = async () => {
    const productosValidados = productosSeleccionados.filter(p => p.id !== 0);
    if (productosValidados.length === 0) {
      alert('Debe seleccionar al menos un producto válido.');
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente, productos: productosValidados })
      });

      if (!res.ok) {
        const errorText = await res.text();
        alert('❌ Error al registrar venta: ' + errorText);
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

      alert('✅ Venta registrada correctamente');

      setCliente(Object.fromEntries(Object.keys(cliente).map(k => [k, ''])));
      setProductosSeleccionados([]);
    } catch (error) {
      console.error(error);
      alert('❌ Error en la conexión.');
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">🧾 Registrar Venta</h1>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {Object.entries(cliente).map(([key, value]) => (
            <input
              key={key}
              name={key}
              value={value}
              onChange={handleClienteChange}
              placeholder={key.toUpperCase()}
              className="p-2 border rounded"
              type="text"
            />
          ))}
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">🧺 Productos Seleccionados</h2>
          <button
            onClick={agregarFilaProducto}
            className="mb-4 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            ➕ Agregar producto
          </button>

          <table className="w-full border text-sm">
            <thead>
              <tr>
                <th className="p-2">Descripción</th>
                <th className="p-2">SKU</th>
                <th className="p-2">Precio S/</th>
                <th className="p-2">Cantidad</th>
                <th className="p-2">Subtotal</th>
                <th className="p-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {productosSeleccionados.map((p, i) => (
                <tr key={i}>
                  <td className="p-2">
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1"
                      value={p.nombre}
                      onChange={e => handleProductoChange(i, 'nombre', e.target.value)}
                      list="lista-productos"
                    />
                    <datalist id="lista-productos">
                      {productos.map(p => (
                        <option key={p.id} value={p.nombre} />
                      ))}
                    </datalist>
                  </td>
                  <td className="p-2">{p.sku}</td>
                  <td className="p-2">S/ {p.price_soles}</td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="w-20 border rounded px-2 py-1"
                      value={p.cantidad}
                      onChange={e => handleProductoChange(i, 'cantidad', e.target.value)}
                      min="1"
                    />
                  </td>
                  <td className="p-2">S/ {(p.price_soles * p.cantidad).toFixed(2)}</td>
                  <td className="p-2">
                    <button
                      onClick={() => eliminarFilaProducto(i)}
                      className="text-red-600 hover:underline"
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 font-bold text-right">
            Total: S/ {total.toFixed(2)}
          </div>
        </section>

        <div className="text-right">
          <button
            onClick={registrarVenta}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            💾 Finalizar Venta
          </button>
        </div>
      </main>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Sidebar from '../../../components/Sidebar';

type ProductoManual = {
  nombre: string;
  cantidad: number;
  price_soles: number;
};

export default function Page() {
  const [productos, setProductos] = useState<ProductoManual[]>([
    { nombre: '', cantidad: 1, price_soles: 0 },
  ]);

  const [cliente, setCliente] = useState({
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

  const handleClienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCliente((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductoChange = (
    index: number,
    field: keyof ProductoManual,
    value: string | number
  ) => {
    const updated = [...productos];
    (updated[index] as any)[field] =
      field === 'cantidad' || field === 'price_soles'
        ? Number(value)
        : value.toString();
    setProductos(updated);
  };

  const agregarFilaProducto = () => {
    setProductos([...productos, { nombre: '', cantidad: 1, price_soles: 0 }]);
  };

  const eliminarProducto = (index: number) => {
    const updated = productos.filter((_, i) => i !== index);
    setProductos(updated);
  };

  const calcularTotal = () =>
    productos.reduce((acc, p) => acc + p.cantidad * p.price_soles, 0);

  const registrarBoleta = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/ventas/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente, productos }),
      });

      if (!response.ok) throw new Error('Error al registrar boleta');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'boleta_manual.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      alert('✅ Boleta manual registrada y descargada correctamente');

      setCliente({
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

      setProductos([{ nombre: '', cantidad: 1, price_soles: 0 }]);

    } catch (err) {
      console.error('❌ Error al registrar boleta manual:', err);
      alert('❌ Error al registrar boleta manual');
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">🧾 Emitir Boleta Manual</h1>

        {/* FORMULARIO CLIENTE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded shadow mb-6">
          {[
            ['nombre', 'Nombre'],
            ['apellido', 'Apellido'],
            ['documento', 'Documento'],
            ['direccion', 'Dirección'],
            ['referencia', 'Referencia'],
            ['distrito', 'Distrito'],
            ['departamento', 'Departamento'],
            ['provincia', 'Provincia'],
            ['celular', 'Celular'],
            ['correo', 'Correo'],
          ].map(([field, label]) => (
            <div key={field} className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">{label}</label>
              <input
                type="text"
                name={field}
                value={(cliente as any)[field]}
                onChange={handleClienteChange}
                className="border px-3 py-2 rounded"
              />
            </div>
          ))}
        </div>

        {/* TABLA PRODUCTOS */}
        <button
          onClick={agregarFilaProducto}
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Agregar Producto
        </button>

        <table className="w-full border bg-white shadow-sm rounded text-sm mb-6">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Descripción</th>
              <th className="p-3">Cantidad</th>
              <th className="p-3">Precio S/</th>
              <th className="p-3">Subtotal</th>
              <th className="p-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p, index) => (
              <tr key={index} className="border-t">
                <td className="p-2">
                  <input
                    type="text"
                    value={p.nombre}
                    onChange={(e) =>
                      handleProductoChange(index, 'nombre', e.target.value)
                    }
                    className="w-full border px-2 py-1 rounded"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={p.cantidad}
                    onChange={(e) =>
                      handleProductoChange(index, 'cantidad', e.target.value)
                    }
                    className="w-full border px-2 py-1 rounded"
                    min={1}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={p.price_soles}
                    onChange={(e) =>
                      handleProductoChange(index, 'price_soles', e.target.value)
                    }
                    className="w-full border px-2 py-1 rounded"
                    step="0.01"
                    min={0}
                  />
                </td>
                <td className="p-2 font-semibold">
                  S/ {(p.cantidad * p.price_soles).toFixed(2)}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => eliminarProducto(index)}
                    className="text-red-600 hover:underline"
                  >
                    🗑 Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right font-bold text-lg mb-6">
          Total: S/ {calcularTotal().toFixed(2)}
        </div>

        <button
          onClick={registrarBoleta}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          ✅ Registrar y Descargar Boleta
        </button>
      </main>
    </div>
  );
}

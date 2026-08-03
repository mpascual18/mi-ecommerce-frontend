'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import FormField from '@/components/ui/FormField';
import { useToast } from '@/components/ui/ToastProvider';
import { API_URL } from '@/lib/api';

type ProductoManual = {
  nombre: string;
  cantidad: number;
  price_soles: number;
};

const CLIENTE_CAMPOS: [string, string][] = [
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
];

const CLIENTE_VACIO = Object.fromEntries(CLIENTE_CAMPOS.map(([k]) => [k, ''])) as Record<string, string>;

export default function Page() {
  const toast = useToast();
  const [productos, setProductos] = useState<ProductoManual[]>([{ nombre: '', cantidad: 1, price_soles: 0 }]);
  const [cliente, setCliente] = useState(CLIENTE_VACIO);
  const [enviando, setEnviando] = useState(false);

  const handleClienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCliente((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductoChange = (index: number, field: keyof ProductoManual, value: string | number) => {
    const updated = [...productos];
    (updated[index] as Record<string, string | number>)[field] =
      field === 'cantidad' || field === 'price_soles' ? Number(value) : value.toString();
    setProductos(updated);
  };

  const agregarFilaProducto = () => setProductos([...productos, { nombre: '', cantidad: 1, price_soles: 0 }]);
  const eliminarProducto = (index: number) => setProductos(productos.filter((_, i) => i !== index));
  const calcularTotal = () => productos.reduce((acc, p) => acc + p.cantidad * p.price_soles, 0);

  const registrarBoleta = async () => {
    setEnviando(true);
    try {
      const response = await fetch(`${API_URL}/api/ventas/manual`, {
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

      toast.success('Boleta manual registrada y descargada correctamente.');
      setCliente(CLIENTE_VACIO);
      setProductos([{ nombre: '', cantidad: 1, price_soles: 0 }]);
    } catch (err) {
      console.error('❌ Error al registrar boleta manual:', err);
      toast.error('Error al registrar boleta manual.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🧾 Emitir Boleta Manual</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl shadow-sm mb-6">
        {CLIENTE_CAMPOS.map(([field, label]) => (
          <FormField key={field} label={label} name={field} value={cliente[field]} onChange={handleClienteChange} />
        ))}
      </div>

      <Button variant="secondary" onClick={agregarFilaProducto} className="mb-4">
        + Agregar Producto
      </Button>

      <div className="overflow-x-auto bg-white shadow-sm rounded-xl border border-gray-200 mb-6">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
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
              <tr key={index} className="border-t border-gray-100">
                <td className="p-2">
                  <input
                    type="text"
                    value={p.nombre}
                    onChange={(e) => handleProductoChange(index, 'nombre', e.target.value)}
                    className="w-full border rounded-lg px-2 py-1"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={p.cantidad}
                    onChange={(e) => handleProductoChange(index, 'cantidad', e.target.value)}
                    className="w-full border rounded-lg px-2 py-1"
                    min={1}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={p.price_soles}
                    onChange={(e) => handleProductoChange(index, 'price_soles', e.target.value)}
                    className="w-full border rounded-lg px-2 py-1"
                    step="0.01"
                    min={0}
                  />
                </td>
                <td className="p-2 font-semibold">S/ {(p.cantidad * p.price_soles).toFixed(2)}</td>
                <td className="p-2">
                  <button onClick={() => eliminarProducto(index)} className="text-danger hover:underline">
                    🗑 Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-right font-bold text-lg mb-6">Total: S/ {calcularTotal().toFixed(2)}</div>

      <Button variant="success" onClick={registrarBoleta} loading={enviando}>
        ✅ Registrar y Descargar Boleta
      </Button>
    </div>
  );
}

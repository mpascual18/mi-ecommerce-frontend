'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar';

type Venta = {
  id: number;
  fecha: string;
  total: string | number;
  cliente: string;
  numero_boleta?: string;
};

export default function HistorialVentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/ventas')
      .then(res => res.json())
      .then(data => setVentas(data))
      .catch(err => console.error('Error al cargar historial:', err));
  }, []);

  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const descargarBoleta = async (ventaId: number) => {
    try {
      const res = await fetch(`http://localhost:4000/api/ventas/${ventaId}/pdf`);
      if (!res.ok) throw new Error('No se pudo descargar la boleta');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `boleta_venta_${ventaId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ Error al descargar boleta:', error);
      alert('No se pudo descargar la boleta.');
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">📚 Historial de Ventas</h1>

        <table className="w-full border bg-white shadow-sm text-sm rounded-xl">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3"># Venta</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Total</th>
              <th className="p-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v) => (
              <tr key={v.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">#{v.id}</td>
                <td className="p-3">{formatearFecha(v.fecha)}</td>
                <td className="p-3">{v.cliente || <span className="text-gray-400">Sin nombre</span>}</td>
                <td className="p-3 font-semibold">S/ {Number(v.total).toFixed(2)}</td>
                <td className="p-3">
                  <button
                    onClick={() => descargarBoleta(v.id)}
                    className="text-blue-600 hover:underline"
                  >
                    📄 Descargar Boleta
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ventas.length === 0 && (
          <p className="text-center text-gray-500 mt-8">No hay ventas registradas aún.</p>
        )}
      </main>
    </div>
  );
}

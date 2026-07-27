'use client';

import { useEffect, useState } from 'react';

type Venta = {
  id: number;
  fecha: string;
  cliente: string;
  total: number;
  tipo: 'regular' | 'manual';
  numero_boleta: string | null;
};

export default function HistorialVentas() {
  const [ventas, setVentas] = useState<Venta[]>([]);

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/ventas');
        const data = await res.json();
        setVentas(data);
      } catch (err) {
        console.error('Error al cargar ventas:', err);
      }
    };

    fetchVentas();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🧾 Historial de Ventas</h1>
      {ventas.length === 0 ? (
        <p className="text-gray-500">No hay ventas registradas aún.</p>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Cliente</th>
              <th className="p-2 text-left">Tipo</th>
              <th className="p-2 text-left">Total (S/.)</th>
              <th className="p-2 text-left">N° Boleta</th>
              <th className="p-2 text-left">Ver PDF</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((venta) => (
              <tr key={venta.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{venta.id}</td>
                <td className="p-2">{new Date(venta.fecha).toLocaleString()}</td>
                <td className="p-2">{venta.cliente}</td>
                <td className="p-2 capitalize">{venta.tipo}</td>
                <td className="p-2">S/. {venta.total.toFixed(2)}</td>
                <td className="p-2">{venta.numero_boleta || '—'}</td>
                <td className="p-2">
                  <a
                    href={
                      venta.tipo === 'manual'
                        ? `http://localhost:4000/api/ventas/manual/pdf/${venta.id}`
                        : `http://localhost:4000/api/boleta/${venta.id}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Ver PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

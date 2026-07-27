'use client';

import Link from 'next/link';
import Sidebar from '../../components/Sidebar';

export default function VentaPanel() {
  const botones = [
    {
      titulo: '🧾 Registrar Venta',
      descripcion: 'Iniciar una nueva venta.',
      enlace: '/venta/registrar',
      color: 'bg-green-100 hover:bg-green-200',
    },
    {
      titulo: '📘 Historial de Ventas',
      descripcion: 'Revisa las ventas realizadas.',
      enlace: '/venta/historial',
      color: 'bg-blue-100 hover:bg-blue-200',
    },
    {
      titulo: '👤 Vendedores',
      descripcion: 'Gestiona a tu equipo de ventas.',
      enlace: '/venta/vendedores',
      color: 'bg-yellow-100 hover:bg-yellow-200',
    },
    {
      titulo: '📈 Reporte de Ventas',
      descripcion: 'Descarga reportes diarios o mensuales.',
      enlace: '/venta/reporte',
      color: 'bg-gray-100 hover:bg-gray-200',
    },
    {
      titulo: '🔍 Buscar Venta',
      descripcion: 'Encuentra una venta específica.',
      enlace: '/venta/buscar',
      color: 'bg-indigo-100 hover:bg-indigo-200',
    },
    {
      titulo: '📝 Emitir Boleta Manual',
      descripcion: 'Genera una boleta sin registro de inventario.',
      enlace: '/venta/manual',
      color: 'bg-red-100 hover:bg-red-200',
    },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">🧾 Módulo de Ventas</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {botones.map((boton, index) => (
            <Link
              key={index}
              href={boton.enlace}
              className={`block p-6 rounded-xl shadow-md transition-all ${boton.color}`}
            >
              <h2 className="text-xl font-semibold mb-1">{boton.titulo}</h2>
              <p className="text-gray-700">{boton.descripcion}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

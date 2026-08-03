'use client';

import HubCard from '@/components/ui/HubCard';

const ITEMS = [
  { href: '/venta/registrar', icon: '🧾', title: 'Registrar Venta', description: 'Iniciar una nueva venta.' },
  { href: '/venta/historial', icon: '📘', title: 'Historial de Ventas', description: 'Revisa las ventas realizadas.' },
  { href: '/venta/vendedores', icon: '👤', title: 'Vendedores', description: 'Gestiona a tu equipo de ventas.' },
  { href: '/venta/reporte', icon: '📈', title: 'Reporte de Ventas', description: 'Descarga reportes en PDF o Excel.' },
  { href: '/venta/manual', icon: '📝', title: 'Emitir Boleta Manual', description: 'Genera una boleta sin registro de inventario.' },
];

export default function VentaPanel() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">🧾 Módulo de Ventas</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ITEMS.map((item) => (
          <HubCard key={item.href} {...item} />
        ))}
      </div>
    </div>
  );
}

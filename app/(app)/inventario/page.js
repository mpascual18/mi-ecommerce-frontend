'use client';

import HubCard from '@/components/ui/HubCard';

const ITEMS = [
  {
    href: '/inventario/agregar',
    icon: '➕',
    title: 'Agregar productos a Inventario',
    description: 'Registra un nuevo producto con sus detalles.',
  },
  {
    href: '/inventario/modificar',
    icon: '✏️',
    title: 'Modificar Inventario',
    description: 'Edita stock, precios o elimina productos existentes.',
  },
  {
    href: '/inventario/bajo-stock',
    icon: '🚨',
    title: 'Productos con bajo stock',
    description: 'Revisa los productos que están por agotarse.',
  },
  {
    href: '/inventario/reportes',
    icon: '📄',
    title: 'Generar reporte de inventario',
    description: 'Descarga el inventario en PDF.',
  },
];

export default function InventarioPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gestión de Inventario</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ITEMS.map((item) => (
          <HubCard key={item.href} {...item} />
        ))}
      </div>
    </div>
  );
}

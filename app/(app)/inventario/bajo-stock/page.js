'use client';

import { useEffect, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import { useToast } from '@/components/ui/ToastProvider';

export default function BajoStockPage() {
  const toast = useToast();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtener = async () => {
      setCargando(true);
      try {
        const res = await fetch('http://localhost:4000/api/productos');
        const data = await res.json();
        setProductos(data.filter((p) => Number(p.stock) <= 5));
      } catch (error) {
        console.error('Error al obtener productos:', error);
        toast.error('No se pudieron cargar los productos.');
      } finally {
        setCargando(false);
      }
    };
    obtener();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-danger">🔴 Productos con Bajo Stock</h1>
      <DataTable
        loading={cargando}
        rows={productos}
        rowKey={(p) => p.id}
        emptyMessage="✅ Todos los productos tienen stock suficiente."
        columns={[
          { key: 'id', header: 'ID' },
          { key: 'nombre', header: 'Nombre', sortable: true, sortValue: (p) => p.nombre },
          { key: 'sku', header: 'SKU', render: (p) => p.sku || '—' },
          {
            key: 'stock',
            header: 'Stock',
            sortable: true,
            sortValue: (p) => Number(p.stock),
            render: (p) => <span className="text-danger font-semibold">{p.stock}</span>,
          },
        ]}
      />
    </div>
  );
}

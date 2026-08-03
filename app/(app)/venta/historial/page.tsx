'use client';

import { useEffect, useMemo, useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import { useToast } from '@/components/ui/ToastProvider';
import { API_URL } from '@/lib/api';

type Venta = {
  id: number;
  fecha: string;
  total: string | number;
  cliente: string;
  numero_boleta?: string;
};

export default function HistorialVentasPage() {
  const toast = useToast();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [descargando, setDescargando] = useState<number | null>(null);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const res = await fetch(`${API_URL}/api/ventas`);
        setVentas(await res.json());
      } catch (err) {
        console.error('Error al cargar historial:', err);
        toast.error('No se pudo cargar el historial de ventas.');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const formatearFecha = (fechaISO: string) =>
    new Date(fechaISO).toLocaleString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  const descargarBoleta = async (ventaId: number) => {
    setDescargando(ventaId);
    try {
      const res = await fetch(`${API_URL}/api/ventas/${ventaId}/pdf`);
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
      toast.error('No se pudo descargar la boleta.');
    } finally {
      setDescargando(null);
    }
  };

  const ventasFiltradas = useMemo(() => {
    return ventas.filter((v) => {
      const fechaVenta = v.fecha.slice(0, 10);
      if (desde && fechaVenta < desde) return false;
      if (hasta && fechaVenta > hasta) return false;
      return true;
    });
  }, [ventas, desde, hasta]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📚 Historial de Ventas</h1>

      <DataTable
        loading={cargando}
        rows={ventasFiltradas}
        rowKey={(v) => v.id}
        searchPlaceholder="Buscar por cliente..."
        searchableText={(v) => v.cliente ?? ''}
        emptyMessage="No hay ventas registradas aún."
        extraFilters={
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <label>Desde</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="border rounded-lg px-2 py-1"
            />
            <label>Hasta</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="border rounded-lg px-2 py-1"
            />
          </div>
        }
        columns={[
          { key: 'id', header: '# Venta', render: (v) => `#${v.id}` },
          {
            key: 'fecha',
            header: 'Fecha',
            sortable: true,
            sortValue: (v) => v.fecha,
            render: (v) => formatearFecha(v.fecha),
          },
          {
            key: 'cliente',
            header: 'Cliente',
            render: (v) => v.cliente || <span className="text-gray-400">Sin nombre</span>,
          },
          {
            key: 'total',
            header: 'Total',
            sortable: true,
            sortValue: (v) => Number(v.total),
            render: (v) => `S/ ${Number(v.total).toFixed(2)}`,
          },
          {
            key: 'accion',
            header: 'Acción',
            render: (v) => (
              <button
                onClick={() => descargarBoleta(v.id)}
                disabled={descargando === v.id}
                className="text-primary hover:underline disabled:opacity-50"
              >
                {descargando === v.id ? 'Descargando...' : '📄 Descargar Boleta'}
              </button>
            ),
          },
        ]}
      />
    </div>
  );
}

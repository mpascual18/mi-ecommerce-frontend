'use client';

import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastProvider';

type Venta = {
  id: number;
  fecha: string;
  total: number;
  cliente: string;
};

export default function ReporteVentasPage() {
  const toast = useToast();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const res = await fetch('http://localhost:4000/api/ventas');
        setVentas(await res.json());
      } catch (err) {
        console.error('Error al cargar ventas:', err);
        toast.error('No se pudieron cargar las ventas.');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const ventasFiltradas = useMemo(() => {
    return ventas.filter((v) => {
      const fechaVenta = v.fecha.slice(0, 10);
      if (desde && fechaVenta < desde) return false;
      if (hasta && fechaVenta > hasta) return false;
      return true;
    });
  }, [ventas, desde, hasta]);

  const totalGeneral = ventasFiltradas.reduce((acc, v) => acc + Number(v.total), 0);

  const formatearFecha = (fechaISO: string) =>
    new Date(fechaISO).toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' });

  const exportarExcel = () => {
    const data = ventasFiltradas.map((v) => ({
      'ID Venta': v.id,
      Fecha: formatearFecha(v.fecha),
      Cliente: v.cliente,
      Total: Number(v.total).toFixed(2),
    }));

    const hoja = XLSX.utils.json_to_sheet(data);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'ReporteVentas');

    const buffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
    const archivo = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(archivo, 'reporte_ventas.xlsx');
  };

  const exportarPDF = async () => {
    try {
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      const pdfFonts = pdfFontsModule.default || pdfFontsModule;
      pdfMake.vfs = pdfFonts.vfs;

      const tabla = [
        ['ID', 'Fecha', 'Cliente', 'Total S/'],
        ...ventasFiltradas.map((v) => [
          v.id.toString(),
          formatearFecha(v.fecha),
          v.cliente,
          `S/ ${Number(v.total).toFixed(2)}`,
        ]),
      ];

      const docDefinition = {
        content: [
          { text: '📊 Reporte de Ventas', style: 'header' },
          { text: `Generado: ${new Date().toLocaleDateString()}\n\n` },
          { table: { headerRows: 1, widths: ['auto', '*', '*', 'auto'], body: tabla } },
          { text: `\nTotal General: S/ ${totalGeneral.toFixed(2)}`, style: 'total' },
        ],
        styles: {
          header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
          total: { fontSize: 14, bold: true, alignment: 'right', margin: [0, 10, 0, 0] },
        },
      };

      pdfMake.createPdf(docDefinition).download('reporte_ventas.pdf');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('No se pudo generar el PDF.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📊 Reporte de Ventas</h1>

      <div className="mb-4 flex gap-4">
        <Button onClick={exportarPDF} disabled={ventasFiltradas.length === 0}>
          📄 Descargar PDF
        </Button>
        <Button variant="success" onClick={exportarExcel} disabled={ventasFiltradas.length === 0}>
          📊 Descargar Excel
        </Button>
      </div>

      <DataTable
        loading={cargando}
        rows={ventasFiltradas}
        rowKey={(v) => v.id}
        emptyMessage="No hay ventas registradas en este rango."
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
          { key: 'cliente', header: 'Cliente' },
          {
            key: 'total',
            header: 'Total',
            sortable: true,
            sortValue: (v) => Number(v.total),
            render: (v) => `S/ ${Number(v.total).toFixed(2)}`,
          },
        ]}
      />

      <div className="text-right mt-4 text-lg font-bold">Total General: S/ {totalGeneral.toFixed(2)}</div>
    </div>
  );
}

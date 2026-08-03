'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/ToastProvider';

export default function ReporteInventarioPage() {
  const toast = useToast();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    const obtener = async () => {
      setCargando(true);
      try {
        const res = await fetch('http://localhost:4000/api/productos');
        setProductos(await res.json());
      } catch (error) {
        console.error('Error al obtener productos:', error);
        toast.error('No se pudieron cargar los productos.');
      } finally {
        setCargando(false);
      }
    };
    obtener();
  }, []);

  const generarPDF = async () => {
    setGenerando(true);
    try {
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

      const pdfMake = pdfMakeModule.default || pdfMakeModule;
      const pdfFonts = pdfFontsModule.default || pdfFontsModule;

      pdfMake.vfs = pdfFonts.vfs;

      const tablaBody = [['ID', 'Producto', 'SKU', 'Color', 'Stock', 'Precio S/', 'Precio $']];

      productos.forEach((p) => {
        tablaBody.push([
          p.id.toString(),
          p.nombre,
          p.sku || '—',
          p.color || '—',
          p.stock.toString(),
          `S/ ${p.price_soles}`,
          `$ ${p.price_dolares}`,
        ]);
      });

      const docDefinition = {
        content: [
          { text: '📦 Reporte de Inventario', style: 'header' },
          { text: `Fecha: ${new Date().toLocaleDateString()}`, margin: [0, 0, 0, 20] },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
              body: tablaBody,
            },
          },
        ],
        styles: {
          header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        },
      };

      pdfMake.createPdf(docDefinition).download('reporte_inventario.pdf');
    } catch (error) {
      console.error('❌ Error al generar PDF:', error);
      toast.error('No se pudo generar el PDF.');
    } finally {
      setGenerando(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📄 Reporte de Inventario</h1>

      <Button onClick={generarPDF} loading={generando} disabled={cargando || productos.length === 0}>
        📥 Descargar PDF
      </Button>

      <div className="mt-8 bg-white p-4 shadow rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Vista previa del inventario</h2>
        {cargando ? (
          <Spinner className="mx-auto" />
        ) : productos.length === 0 ? (
          <EmptyState message="No hay productos registrados." />
        ) : (
          <ul className="space-y-1 text-gray-700">
            {productos.map((p) => (
              <li key={p.id}>
                <strong>{p.nombre}</strong> – Stock: {p.stock} – S/ {p.price_soles}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

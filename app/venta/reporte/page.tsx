'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

type Venta = {
  id: number;
  fecha: string;
  total: number;
  cliente: string;
};

export default function ReporteVentasPage() {
  const [ventas, setVentas] = useState<Venta[]>([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/ventas')
      .then(res => res.json())
      .then(data => setVentas(data))
      .catch(err => console.error('Error al cargar ventas:', err));
  }, []);

  const totalGeneral = ventas.reduce((acc, v) => acc + Number(v.total), 0);

  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const exportarExcel = () => {
    const data = ventas.map(v => ({
      'ID Venta': v.id,
      'Fecha': formatearFecha(v.fecha),
      'Cliente': v.cliente,
      'Total': Number(v.total).toFixed(2),
    }));

    const hoja = XLSX.utils.json_to_sheet(data);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'ReporteVentas');

    const buffer = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
    const archivo = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(archivo, 'reporte_ventas.xlsx');
  };

  const exportarPDF = async () => {
    const pdfMakeModule = await import('pdfmake/build/pdfmake');
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
    const pdfMake = pdfMakeModule.default || pdfMakeModule;
    const pdfFonts = pdfFontsModule.default || pdfFontsModule;
    pdfMake.vfs = pdfFonts.vfs;

    const tabla = [
      ['ID', 'Fecha', 'Cliente', 'Total S/'],
      ...ventas.map(v => [
        v.id.toString(),
        formatearFecha(v.fecha),
        v.cliente,
        `S/ ${Number(v.total).toFixed(2)}`
      ])
    ];

    const docDefinition = {
      content: [
        { text: '📊 Reporte de Ventas', style: 'header' },
        { text: `Generado: ${new Date().toLocaleDateString()}\n\n` },
        {
          table: {
            headerRows: 1,
            widths: ['auto', '*', '*', 'auto'],
            body: tabla
          }
        },
        {
          text: `\nTotal General: S/ ${totalGeneral.toFixed(2)}`,
          style: 'total'
        }
      ],
      styles: {
        header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
        total: { fontSize: 14, bold: true, alignment: 'right', margin: [0, 10, 0, 0] }
      }
    };

    pdfMake.createPdf(docDefinition).download('reporte_ventas.pdf');
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">📊 Reporte de Ventas</h1>

        <div className="mb-4 flex gap-4">
          <button
            onClick={exportarPDF}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            📄 Descargar PDF
          </button>
          <button
            onClick={exportarExcel}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            📊 Descargar Excel
          </button>
        </div>

        <table className="w-full border bg-white shadow-sm text-sm rounded-xl">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3"># Venta</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v) => (
              <tr key={v.id} className="border-t hover:bg-gray-50">
                <td className="p-3">#{v.id}</td>
                <td className="p-3">{formatearFecha(v.fecha)}</td>
                <td className="p-3">{v.cliente}</td>
                <td className="p-3 font-semibold">S/ {Number(v.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-right mt-4 text-lg font-bold">
          Total General: S/ {totalGeneral.toFixed(2)}
        </div>
      </main>
    </div>
  );
}

'use client'

import { useEffect, useState } from 'react'
import Sidebar from '../../../components/Sidebar'

export default function ReporteInventarioPage() {
  const [productos, setProductos] = useState([])

  useEffect(() => {
    obtenerProductos()
  }, [])

  const obtenerProductos = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/productos')
      const data = await res.json()
      setProductos(data)
    } catch (error) {
      console.error('Error al obtener productos:', error)
    }
  }

  const generarPDF = async () => {
    try {
      const pdfMakeModule = await import('pdfmake/build/pdfmake')
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts')

      // ✅ Compatibilidad con diferentes exportaciones
      const pdfMake = pdfMakeModule.default || pdfMakeModule
      const pdfFonts = pdfFontsModule.default || pdfFontsModule

      pdfMake.vfs = pdfFonts.vfs

      const tablaBody = [
        ['ID', 'Producto', 'SKU', 'Color', 'Stock', 'Precio S/', 'Precio $']
      ]

      productos.forEach(p => {
        tablaBody.push([
          p.id.toString(),
          p.nombre,
          p.sku || '—',
          p.color || '—',
          p.stock.toString(),
          `S/ ${p.price_soles}`,
          `$ ${p.price_dolares}`
        ])
      })

      const docDefinition = {
        content: [
          { text: '📦 Reporte de Inventario', style: 'header' },
          { text: `Fecha: ${new Date().toLocaleDateString()}`, margin: [0, 0, 0, 20] },
          {
            table: {
              headerRows: 1,
              widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
              body: tablaBody
            }
          }
        ],
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 10]
          }
        }
      }

      pdfMake.createPdf(docDefinition).download('reporte_inventario.pdf')
    } catch (error) {
      console.error('❌ Error al generar PDF:', error)
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">📄 Reporte de Inventario</h1>

        <button
          onClick={generarPDF}
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          📥 Descargar PDF
        </button>

        <div className="mt-8 bg-white p-4 shadow rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Vista previa del inventario</h2>
          <ul className="space-y-1 text-gray-700">
            {productos.map(p => (
              <li key={p.id}>
                <strong>{p.nombre}</strong> – Stock: {p.stock} – S/ {p.price_soles}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}

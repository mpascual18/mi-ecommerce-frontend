'use client'

import Sidebar from '../../components/Sidebar'
import { useRouter } from 'next/navigation'

export default function InventarioPage() {
  const router = useRouter()

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Gestión de Inventario</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Botón 1 */}
          <div
            onClick={() => router.push('/inventario/agregar')}
            className="cursor-pointer bg-white shadow p-6 rounded-xl hover:bg-blue-50 transition"
          >
            <h2 className="text-xl font-semibold mb-2">➕ Agregar productos a Inventario</h2>
            <p className="text-gray-600">Registra un nuevo producto con sus detalles.</p>
          </div>

          {/* Botón 2 */}
          <div
            onClick={() => router.push('/inventario/modificar')}
            className="cursor-pointer bg-white shadow p-6 rounded-xl hover:bg-blue-50 transition"
          >
            <h2 className="text-xl font-semibold mb-2">✏️ Modificar Inventario</h2>
            <p className="text-gray-600">Edita stock, precios o elimina productos existentes.</p>
          </div>

          {/* Botón 3 */}
          <div
            onClick={() => router.push('/inventario/bajo-stock')}
            className="cursor-pointer bg-white shadow p-6 rounded-xl hover:bg-blue-50 transition"
          >
            <h2 className="text-xl font-semibold mb-2">🚨 Productos con bajo stock</h2>
            <p className="text-gray-600">Revisa los productos que están por agotarse.</p>
          </div>

          {/* Botón 4 */}
          <div
            onClick={() => router.push('/inventario/reportes')}
            className="cursor-pointer bg-white shadow p-6 rounded-xl hover:bg-blue-50 transition"
          >
            <h2 className="text-xl font-semibold mb-2">📄 Generar reporte de inventario</h2>
            <p className="text-gray-600">Descarga el inventario en PDF o Excel.</p>
          </div>

          {/* Botón 5 */}
          <div
            onClick={() => router.push('/inventario/historial')}
            className="cursor-pointer bg-white shadow p-6 rounded-xl hover:bg-blue-50 transition"
          >
            <h2 className="text-xl font-semibold mb-2">📚 Historial de ingresos</h2>
            <p className="text-gray-600">Consulta los registros de entrada al inventario.</p>
          </div>

          {/* Botón 6 */}
          <div
            onClick={() => router.push('/inventario/buscar')}
            className="cursor-pointer bg-white shadow p-6 rounded-xl hover:bg-blue-50 transition"
          >
            <h2 className="text-xl font-semibold mb-2">🔍 Buscar producto</h2>
            <p className="text-gray-600">Encuentra productos por SKU o nombre.</p>
          </div>

          {/* Botón 7 */}
          <div
            onClick={() => router.push('/inventario/vencimientos')}
            className="cursor-pointer bg-white shadow p-6 rounded-xl hover:bg-blue-50 transition"
          >
            <h2 className="text-xl font-semibold mb-2">⏳ Productos próximos a vencer</h2>
            <p className="text-gray-600">Controla productos perecibles o con fecha crítica.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'

export default function DashboardPage() {
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

  const productosBajoStock = productos.filter(p => Number(p.stock) <= 5)

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">📊 Panel de Control</h1>

        {/* Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg">Ingresos diarios</h2>
            <p className="text-2xl font-semibold text-green-600">S/ 1,200.00</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg">Ventas</h2>
            <p className="text-2xl font-semibold text-blue-600">S/ 520.00</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg">Utilidad</h2>
            <p className="text-2xl font-semibold text-yellow-600">S/ 320.00</p>
          </div>
        </div>

        {/* Gráfico */}
        <div className="bg-white p-6 rounded-xl shadow mb-10">
          <h3 className="text-xl font-bold mb-4">Ventas por día</h3>
          <div className="bg-gray-100 h-48 rounded flex items-center justify-center text-gray-500">
            Aquí irá el gráfico 📈
          </div>
        </div>

        {/* Alerta de bajo stock */}
        <div className="bg-white p-6 rounded-xl shadow mb-10">
          <h3 className="text-xl font-bold mb-4 text-red-600">🛑 Productos con Bajo Stock</h3>
          {productosBajoStock.length === 0 ? (
            <p className="text-gray-600">✅ Todo el inventario está en buen nivel.</p>
          ) : (
            <ul className="list-disc pl-6 text-red-600">
              {productosBajoStock.map((p) => (
                <li key={p.id}>
                  {p.nombre} – Stock: <strong>{p.stock}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}

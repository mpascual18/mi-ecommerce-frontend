'use client'

import { useEffect, useState } from 'react'
import Sidebar from '../../../components/Sidebar'

export default function BajoStockPage() {
  const [productos, setProductos] = useState([])

  useEffect(() => {
    obtenerProductos()
  }, [])

  const obtenerProductos = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/productos')
      const data = await res.json()
      setProductos(data.filter(p => Number(p.stock) <= 5)) // 🔴 solo los de bajo stock
    } catch (error) {
      console.error('Error al obtener productos:', error)
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-4 text-red-600">🔴 Productos con Bajo Stock</h1>

        {productos.length === 0 ? (
          <p className="text-gray-600">✅ Todos los productos tienen stock suficiente.</p>
        ) : (
          <div className="overflow-x-auto bg-white p-4 shadow rounded-xl">
            <table className="min-w-full table-auto border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Nombre</th>
                  <th className="px-4 py-2 text-left">SKU</th>
                  <th className="px-4 py-2 text-left">Stock</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-2">{p.id}</td>
                    <td className="px-4 py-2">{p.nombre}</td>
                    <td className="px-4 py-2">{p.sku || '—'}</td>
                    <td className="px-4 py-2 text-red-600 font-semibold">{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

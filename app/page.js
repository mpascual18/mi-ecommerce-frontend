'use client'

import { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'

export default function Home() {
  const [productos, setProductos] = useState([])
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    sku: '',
    price_soles: '',
    price_dolares: '',
    color: '',
    descripcion: '',
    stock: ''
  })

  useEffect(() => {
    obtenerProductos()
  }, [])

  const obtenerProductos = async () => {
    try {
      const res = await fetch('http://localhost:4000/productos')
      const data = await res.json()
      setProductos(data)
    } catch (error) {
      console.error('Error al obtener productos:', error)
    }
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido principal */}
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Lista de Productos</h1>

        {/* Tarjetas de métricas */}
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

        {/* Gráfico de ventas */}
        <div className="bg-white p-6 rounded-xl shadow mb-10">
          <h3 className="text-xl font-bold mb-4">Ventas por día</h3>
          <div className="bg-gray-100 h-48 rounded flex items-center justify-center text-gray-500">
            Aquí irá el gráfico 📈
          </div>
        </div>

        {/* Productos con bajo stock */}
        <div className="bg-gray-100 p-4 rounded mb-6">
          <h2 className="text-lg font-semibold mb-4">📦 Productos con bajo stock</h2>
          <ul className="divide-y">
            {productos.filter(p => Number(p.stock) <= 5).map(p => (
              <li key={p.id} className="py-2 flex justify-between items-center">
                <span>
                  <strong>{p.nombre}</strong> (SKU: {p.sku})
                </span>
                <span className="text-red-600 font-semibold">Stock: {p.stock}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Lista de productos completa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {productos.map((p) => (
            <div key={p.id} className="border p-4 rounded shadow bg-white">
              <h2 className="text-xl font-semibold">{p.nombre}</h2>
              <p className="text-gray-600">SKU: {p.sku}</p>
              <p>S/. {p.price_soles} | $ {p.price_dolares}</p>
              <p>Color: {p.color}</p>
              <p className="italic">{p.descripcion}</p>
              <p className="mt-2">Stock: {p.stock}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

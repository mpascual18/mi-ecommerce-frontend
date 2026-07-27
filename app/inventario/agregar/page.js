'use client'

import { useState } from 'react'
import Sidebar from '../../../components/Sidebar'

export default function AgregarProductoPage() {
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    sku: '',
    price_soles: '',
    price_dolares: '',
    color: '',
    descripcion: '',
    stock: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setNuevoProducto({ ...nuevoProducto, [name]: value })
  }

  const agregarProducto = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoProducto)
      })

      if (res.ok) {
        alert('✅ Producto agregado con éxito.')
        setNuevoProducto({
          nombre: '',
          sku: '',
          price_soles: '',
          price_dolares: '',
          color: '',
          descripcion: '',
          stock: ''
        })
      } else {
        alert('❌ Error al agregar producto')
      }
    } catch (error) {
      console.error('Error al hacer POST:', error)
    }
  }

  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">➕ Agregar Producto</h1>

        <div className="bg-white p-6 rounded-xl shadow">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {['nombre', 'sku', 'price_soles', 'price_dolares', 'color', 'descripcion', 'stock'].map((campo) => (
              <input
                key={campo}
                name={campo}
                value={nuevoProducto[campo]}
                onChange={handleChange}
                placeholder={campo.charAt(0).toUpperCase() + campo.slice(1)}
                className="p-2 border rounded"
              />
            ))}
          </div>

          <button
            onClick={agregarProducto}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Agregar Producto
          </button>
        </div>
      </main>
    </div>
  )
}

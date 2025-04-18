'use client'
import { useEffect, useState } from 'react'

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

  const handleChange = (e) => {
    const { name, value } = e.target
    setNuevoProducto({ ...nuevoProducto, [name]: value })
  }

  const agregarProducto = async () => {
    try {
      const res = await fetch('http://localhost:4000/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoProducto)
      })

      if (res.ok) {
        setNuevoProducto({
          nombre: '',
          sku: '',
          price_soles: '',
          price_dolares: '',
          color: '',
          descripcion: '',
          stock: ''
        })
        obtenerProductos()
      } else {
        console.error('Error al agregar producto')
      }
    } catch (error) {
      console.error('Error al hacer POST:', error)
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Lista de Productos</h1>

      {/* Formulario */}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Agregar nuevo producto</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {['nombre', 'sku', 'price_soles', 'price_dolares', 'color', 'descripcion', 'stock'].map((campo) => (
            <input
              key={campo}
              name={campo}
              value={nuevoProducto[campo]}
              onChange={handleChange}
              placeholder={campo}
              className="p-2 border rounded"
            />
          ))}
        </div>
        <button
          onClick={agregarProducto}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Agregar Producto
        </button>
      </div>

      {/* Lista de productos */}
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
  )
}

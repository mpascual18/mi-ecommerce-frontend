'use client'

import { useEffect, useState } from 'react'
import Sidebar from '../../../components/Sidebar'

export default function ModificarInventarioPage() {
  const [productos, setProductos] = useState([])
  const [productoEditando, setProductoEditando] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [motivoEliminacion, setMotivoEliminacion] = useState('')

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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProductoEditando(prev => ({ ...prev, [name]: value }))
  }

  const guardarCambios = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/productos/${productoEditando.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...productoEditando,
          price_soles: Number(productoEditando.price_soles),
          price_dolares: Number(productoEditando.price_dolares),
          stock: Number(productoEditando.stock)
        })
      })

      if (res.ok) {
        alert('✅ Producto actualizado')
        setProductoEditando(null)
        obtenerProductos()
      } else {
        alert('❌ Error al actualizar')
      }
    } catch (error) {
      console.error('Error al guardar cambios:', error)
    }
  }

  const eliminarProducto = async () => {
    if (!motivoEliminacion.trim()) {
      alert('⚠️ Debes ingresar un motivo de eliminación.')
      return
    }

    const confirmar = confirm(`¿Estás seguro de eliminar el producto "${productoEditando.nombre}"?`)
    if (!confirmar) return

    try {
      const res = await fetch(`http://localhost:4000/api/productos/${productoEditando.id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        alert(`🗑️ Producto eliminado. Motivo: ${motivoEliminacion}`)
        setProductoEditando(null)
        setMotivoEliminacion('')
        obtenerProductos()
      } else {
        alert('❌ Error al eliminar')
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error)
    }
  }

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(busqueda.toLowerCase()))
  )

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">✏️ Modificar Inventario</h1>

        {/* Barra de búsqueda */}
        <input
          type="text"
          placeholder="🔍 Buscar por nombre o SKU..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="p-2 border rounded mb-4 w-full max-w-md"
        />

        {/* Tabla */}
        <div className="overflow-x-auto bg-white p-4 shadow rounded-xl">
          <table className="min-w-full table-auto border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Producto</th>
                <th className="px-4 py-2 text-left">SKU</th>
                <th className="px-4 py-2 text-left">Stock</th>
                <th className="px-4 py-2 text-left">Precio S/</th>
                <th className="px-4 py-2 text-left">Precio $</th>
                <th className="px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-2">{p.id}</td>
                  <td className="px-4 py-2">{p.nombre}</td>
                  <td className="px-4 py-2">{p.sku}</td>
                  <td className="px-4 py-2">{p.stock}</td>
                  <td className="px-4 py-2">S/ {p.price_soles}</td>
                  <td className="px-4 py-2">$ {p.price_dolares}</td>
                  <td className="px-4 py-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => {
                        setProductoEditando(p)
                        setMotivoEliminacion('')
                      }}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal de edición */}
        {productoEditando && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4">Editar producto: {productoEditando.nombre}</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {['nombre', 'sku', 'price_soles', 'price_dolares', 'stock', 'color', 'descripcion'].map(campo => (
                  <input
                    key={campo}
                    name={campo}
                    value={productoEditando[campo]}
                    onChange={handleInputChange}
                    placeholder={campo}
                    className="p-2 border rounded"
                  />
                ))}
              </div>

              <textarea
                placeholder="Motivo para eliminar este producto (si aplica)"
                value={motivoEliminacion}
                onChange={(e) => setMotivoEliminacion(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              />

              <div className="flex justify-between">
                <button
                  onClick={() => setProductoEditando(null)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={eliminarProducto}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={guardarCambios}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

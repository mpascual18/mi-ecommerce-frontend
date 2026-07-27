'use client'

import { useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'

type Cliente = {
  id: number
  nombre: string
  apellido: string
  documento: string
  direccion: string
  referencia: string
  distrito: string
  departamento: string
  provincia: string
  celular: string
  correo: string
  fecha_registro: string
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [nuevoCliente, setNuevoCliente] = useState<Omit<Cliente, 'id' | 'fecha_registro'>>({
    nombre: '',
    apellido: '',
    documento: '',
    direccion: '',
    referencia: '',
    distrito: '',
    departamento: '',
    provincia: '',
    celular: '',
    correo: '',
  })

  useEffect(() => {
    obtenerClientes()
  }, [])

  const obtenerClientes = async () => {
    const res = await fetch('http://localhost:4000/api/clientes')
    const data = await res.json()
    setClientes(data)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNuevoCliente(prev => ({ ...prev, [name]: value }))
  }

  const registrarCliente = async () => {
    const res = await fetch('http://localhost:4000/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoCliente),
    })

    if (res.ok) {
      setMostrarModal(false)
      setNuevoCliente({
        nombre: '',
        apellido: '',
        documento: '',
        direccion: '',
        referencia: '',
        distrito: '',
        departamento: '',
        provincia: '',
        celular: '',
        correo: '',
      })
      obtenerClientes()
      alert('✅ Cliente registrado correctamente')
    } else {
      alert('❌ Error al registrar cliente')
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">👤 Clientes</h1>
          <button
            onClick={() => setMostrarModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Registrar Cliente
          </button>
        </div>

        <table className="w-full text-sm bg-white shadow rounded-xl border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Documento</th>
              <th className="p-3">Dirección</th>
              <th className="p-3">Celular</th>
              <th className="p-3">Correo</th>
              <th className="p-3">Registrado</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{c.nombre} {c.apellido}</td>
                <td className="p-3">{c.documento}</td>
                <td className="p-3">{c.direccion}</td>
                <td className="p-3">{c.celular}</td>
                <td className="p-3">{c.correo}</td>
                <td className="p-3">{new Date(c.fecha_registro).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal de registro */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-2xl relative">
              <button
                onClick={() => setMostrarModal(false)}
                className="absolute top-2 right-4 text-gray-500 hover:text-black text-xl"
              >
                ✖
              </button>
              <h2 className="text-xl font-semibold mb-4">Registrar Nuevo Cliente</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(nuevoCliente).map(([key, value]) => (
                  <input
                    key={key}
                    name={key}
                    value={value}
                    onChange={handleChange}
                    placeholder={key.toUpperCase()}
                    className="p-2 border rounded"
                    type="text"
                  />
                ))}
              </div>

              <div className="mt-4 text-right">
                <button
                  onClick={registrarCliente}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                >
                  Registrar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

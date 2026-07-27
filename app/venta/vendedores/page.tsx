'use client';

import { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar';

type Vendedor = {
  id: number;
  codigo: string;
  nombre: string;
  apellido: string;
  tipo_documento: string;
  numero_documento: string;
  celular: string;
  correo: string;
  fecha_registro: string;
};

export default function VendedoresPage() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoVendedor, setNuevoVendedor] = useState({
    nombre: '',
    apellido: '',
    tipo_documento: '',
    numero_documento: '',
    celular: '',
    correo: ''
  });

  const cargarVendedores = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/vendedores');
      const data = await res.json();
      setVendedores(data);
    } catch (err) {
      console.error('Error al cargar vendedores:', err);
    }
  };

  useEffect(() => {
    cargarVendedores();
  }, []);

  const eliminarVendedor = async (codigo: string) => {
    const confirmar = window.confirm(`¿Seguro que deseas eliminar al vendedor ${codigo}?`);
    if (!confirmar) return;

    try {
      const res = await fetch(`http://localhost:4000/api/vendedores/${codigo}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('✅ Vendedor eliminado correctamente');
        cargarVendedores();
      } else {
        alert('❌ Error al eliminar vendedor');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('❌ No se pudo conectar con el servidor');
    }
  };

  const registrarVendedor = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/vendedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoVendedor)
      });

      if (res.ok) {
        alert('✅ Vendedor registrado');
        setMostrarModal(false);
        setNuevoVendedor({
          nombre: '',
          apellido: '',
          tipo_documento: '',
          numero_documento: '',
          celular: '',
          correo: ''
        });
        cargarVendedores();
      } else {
        alert('❌ Error al registrar vendedor');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('❌ No se pudo conectar con el servidor');
    }
  };

  const formatearFecha = (fechaISO: string) => {
    return new Date(fechaISO).toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">🧑‍💼 Vendedores</h1>
          <button
            onClick={() => setMostrarModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Registrar Vendedor
          </button>
        </div>

        <table className="w-full border text-sm bg-white rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Código</th>
              <th className="p-2">Nombre</th>
              <th className="p-2">Documento</th>
              <th className="p-2">Celular</th>
              <th className="p-2">Correo</th>
              <th className="p-2">Fecha Registro</th>
              <th className="p-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {vendedores.map((v) => (
              <tr key={v.id} className="border-t hover:bg-gray-50">
                <td className="p-2 font-bold">{v.codigo}</td>
                <td className="p-2">{v.nombre} {v.apellido}</td>
                <td className="p-2">{v.tipo_documento} {v.numero_documento}</td>
                <td className="p-2">{v.celular}</td>
                <td className="p-2">{v.correo}</td>
                <td className="p-2">{formatearFecha(v.fecha_registro)}</td>
                <td className="p-2">
                  <button
                    onClick={() => eliminarVendedor(v.codigo)}
                    className="text-red-600 hover:underline"
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {vendedores.length === 0 && (
          <p className="text-center text-gray-500 mt-6">No hay vendedores registrados.</p>
        )}

        {/* MODAL REGISTRO */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Registrar Vendedor</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {Object.entries(nuevoVendedor).map(([key, val]) => (
                  <input
                    key={key}
                    name={key}
                    value={val}
                    onChange={(e) =>
                      setNuevoVendedor((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    placeholder={key.replace('_', ' ').toUpperCase()}
                    className="p-2 border rounded text-sm col-span-2"
                  />
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setMostrarModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={registrarVendedor}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Registrar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

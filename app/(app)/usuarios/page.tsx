'use client';

import { useEffect, useState } from 'react';

type Usuario = {
  id: number;
  nombre: string;
  correo: string;
  rol: 'admin' | 'vendedor' | 'almacen';
  estado: string;
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  // Form states
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<'admin' | 'vendedor' | 'almacen'>('vendedor');
  const [mensaje, setMensaje] = useState('');

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const res = await fetch('http://localhost:4000/api/auth/usuarios');
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');

    try {
      const res = await fetch('http://localhost:4000/api/auth/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, password, rol }),
      });

      if (res.ok) {
        setMensaje('✅ Usuario registrado exitosamente.');
        setNombre('');
        setCorreo('');
        setPassword('');
        cargarUsuarios();
      } else {
        const errorData = await res.json();
        setMensaje(`❌ Error: ${errorData.error}`);
      }
    } catch (err) {
      setMensaje('❌ Error de conexión al servidor.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900">👥 Gestión de Usuarios y Roles</h1>
        <p className="text-sm text-gray-500">Administra los permisos y accesos del personal en PYR Store</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORMULARIO CREAR USUARIO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">➕ Registrar Nuevo Usuario</h2>

          {mensaje && (
            <div className="text-xs font-bold p-3 rounded-xl bg-gray-100 border border-gray-200">
              {mensaje}
            </div>
          )}

          <form onSubmit={handleCrearUsuario} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Carlos Ramírez"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico *</label>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="ejemplo@pyrstore.pe"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Contraseña *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Rol / Perfil *</label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value as any)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="admin">👑 Administrador (Acceso Total)</option>
                <option value="vendedor">💼 Vendedor (Registro de Ventas)</option>
                <option value="almacen">📦 Almacén & E-Commerce (Inventario / Fotos)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition shadow-sm"
            >
              REGISTRAR USUARIO
            </button>
          </form>
        </div>

        {/* TABLA DE USUARIOS EXISTENTES */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="font-bold text-gray-900 text-sm">Usuarios Registrados en el Sistema</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Correo</th>
                  <th className="p-3">Rol / Perfil</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cargando ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-400">Cargando usuarios...</td>
                  </tr>
                ) : usuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-gray-900">{u.nombre}</td>
                    <td className="p-3 text-gray-600">{u.correo}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        u.rol === 'admin' ? 'bg-red-100 text-red-700' :
                        u.rol === 'vendedor' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {u.rol === 'admin' ? '👑 Admin' : u.rol === 'vendedor' ? '💼 Vendedor' : '📦 Almacén'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {u.estado || 'Activo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

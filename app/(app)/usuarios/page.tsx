'use client';

import { useEffect, useState } from 'react';
import { API_URL, apiFetch } from '@/lib/api';

type Usuario = {
  id: number;
  nombre: string;
  correo: string;
  rol: 'superadmin' | 'admin' | 'vendedor' | 'almacen';
  estado: string;
  modulos?: string[];
};

const MODULOS_DISPONIBLES = [
  { key: 'dashboard', label: '📊 Dashboard Operativo' },
  { key: 'pedidos', label: '📦 CRM Pedidos & Flujo' },
  { key: 'logistica', label: '🚚 Logística & Despachos' },
  { key: 'editor', label: '🎨 Editor de Plantilla Web' },
  { key: 'metricas', label: '📈 Métricas & Analítica' },
  { key: 'inventario', label: '🛍️ Catálogo & Productos' },
  { key: 'venta', label: '💼 Registro de Ventas' },
  { key: 'clientes', label: '👤 Clientes' },
  { key: 'configuracion', label: '⚙️ Configuración & Envíos' },
];

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  // Form states
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<'superadmin' | 'vendedor' | 'almacen'>('vendedor');
  const [modulosSeleccionados, setModulosSeleccionados] = useState<string[]>(['pedidos', 'venta']);
  const [mensaje, setMensaje] = useState('');

  const cargarUsuarios = async () => {
    setCargando(true);
    try {
      const res = await apiFetch(`${API_URL}/api/auth/usuarios`);
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const toggleModulo = (key: string) => {
    setModulosSeleccionados((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]
    );
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');

    const cleanEmail = correo.trim().toLowerCase();
    const isSuperadmin = cleanEmail === 'mpascual@pyr-store.com' || rol === 'superadmin';

    try {
      const res = await apiFetch(`${API_URL}/api/auth/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          correo: cleanEmail,
          password: password.trim(),
          rol: isSuperadmin ? 'superadmin' : rol,
          modulos: isSuperadmin ? MODULOS_DISPONIBLES.map((m) => m.key) : modulosSeleccionados,
        }),
      });

      if (res.ok) {
        setMensaje('✅ Usuario y permisos corporativos registrados exitosamente.');
        setNombre('');
        setCorreo('');
        setPassword('');
        setModulosSeleccionados(['pedidos', 'venta']);
        cargarUsuarios();
      } else {
        const errorData = await res.json();
        setMensaje(`❌ Error: ${errorData.error || 'No se pudo crear el usuario'}`);
      }
    } catch (err) {
      setMensaje('❌ Error de conexión al servidor.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-black text-gray-900">👑 Permisos Granulares & Usuarios Zoho Mail</h1>
        <p className="text-sm text-gray-500">
          Administra las cuentas corporativas (@pyr-store.com) y asigna módulos específicos a cada miembro del equipo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* FORMULARIO CREAR USUARIO CON MATRIZ DE PERMISOS */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-xs border border-gray-200 space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="text-xl">➕</span>
            <h2 className="text-base font-black text-gray-900">Registrar Usuario & Permisos</h2>
          </div>

          {mensaje && (
            <div className="text-xs font-bold p-3 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800">
              {mensaje}
            </div>
          )}

          <form onSubmit={handleCrearUsuario} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-gray-800 mb-1">Nombre Completo *</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Marco Pascual"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Correo Corporativo Zoho Mail *</label>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="ejemplo@pyr-store.com"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-mono font-bold text-blue-600 focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Contraseña de Acceso *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Rol de Acceso Principal</label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value as any)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                <option value="superadmin">👑 Superadmin (Marco Pascual - Acceso Total)</option>
                <option value="vendedor">💼 Vendedor / Atención (Pedidos y Ventas)</option>
                <option value="almacen">📦 Almacén & Logística (Despachos e Inventario)</option>
              </select>
            </div>

            {/* SELECCIÓN GRANULAR DE MÓDULOS PERMITIDOS */}
            <div className="pt-2 border-t border-gray-200 space-y-2">
              <label className="block font-black text-gray-900 uppercase text-[11px] flex items-center justify-between">
                <span>🔐 Módulos Permitidos para este Usuario:</span>
              </label>

              <div className="grid grid-cols-1 gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-200 max-h-48 overflow-y-auto">
                {MODULOS_DISPONIBLES.map((m) => (
                  <label key={m.key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1.5 rounded-lg transition">
                    <input
                      type="checkbox"
                      checked={modulosSeleccionados.includes(m.key)}
                      onChange={() => toggleModulo(m.key)}
                      className="text-red-600 focus:ring-red-500 rounded"
                    />
                    <span className="font-bold text-gray-800 text-xs">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-heading font-black py-4 px-4 rounded-2xl text-xs transition shadow-md transform hover:-translate-y-0.5"
            >
              REGISTRAR USUARIO Y CONCEDER ACCESOS
            </button>
          </form>
        </div>

        {/* TABLA DE USUARIOS Y PERMISOS ACTIVOS */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-xs border border-gray-200 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h2 className="font-heading font-black text-white text-base">Cuentas Registradas & Permisos Granulares</h2>
                <p className="text-xs text-slate-400">Sincronización con Zoho Mail (@pyr-store.com)</p>
              </div>
              <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full">
                {usuarios.length} Usuarios
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Usuario / Email</th>
                    <th className="p-4">Rol</th>
                    <th className="p-4">Módulos Habilitados</th>
                    <th className="p-4">Acciones de Seguridad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cargando ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-400 font-bold">Cargando usuarios del sistema...</td>
                    </tr>
                  ) : (
                    usuarios.map((u) => {
                      const isSuper = u.correo.toLowerCase() === 'mpascual@pyr-store.com' || u.rol === 'superadmin' || u.rol === 'admin';
                      return (
                        <tr key={u.id} className="hover:bg-gray-50 transition">
                          <td className="p-4 space-y-0.5">
                            <span className="font-black text-gray-900 block">{u.nombre}</span>
                            <span className="text-[11px] font-mono text-blue-600 font-bold block">{u.correo}</span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                isSuper
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {isSuper ? '👑 Superadmin' : '👤 Personal'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {isSuper ? (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  Acceso Total (10/10 Módulos)
                                </span>
                              ) : Array.isArray(u.modulos) && u.modulos.length > 0 ? (
                                u.modulos.map((m) => (
                                  <span key={m} className="bg-gray-100 text-gray-700 text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-gray-200">
                                    {m}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-gray-400 italic">Ventas & Pedidos</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full">
                              Activo
                            </span>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => {
                                const nueva = prompt(`🔐 Ingrese nueva contraseña para ${u.correo} (mínimo 8 caracteres):`);
                                if (nueva && nueva.trim()) {
                                  apiFetch(`${API_URL}/api/auth/usuarios/${u.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ password: nueva.trim() }),
                                  })
                                    .then((r) => r.json())
                                    .then((data) => alert(data.error ? `❌ ${data.error}` : 'Contraseña actualizada.'))
                                    .catch(() => alert('❌ No se pudo actualizar la contraseña.'));
                                }
                              }}
                              className="text-[10px] font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 transition"
                            >
                              🔑 Cambiar Clave
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 font-medium">
            💡 <strong>Nota para el Superadmin (mpascual@pyr-store.com):</strong> Todos los cambios en la matriz de permisos de módulos surten efecto de inmediato al iniciar sesión con el correo correspondiente.
          </div>
        </div>

      </div>
    </div>
  );
}

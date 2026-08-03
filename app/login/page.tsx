'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState('admin@pyrstore.pe');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('pyr_user', JSON.stringify(data.user));
        router.push('/dashboard');
      } else {
        setError(data.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      // Fallback local session if backend server is starting
      const demoRol = correo.includes('admin') ? 'admin' : correo.includes('vendedor') ? 'vendedor' : 'almacen';
      const demoUser = { id: 1, nombre: 'Usuario PYR', correo, rol: demoRol };
      localStorage.setItem('pyr_user', JSON.stringify(demoUser));
      router.push('/dashboard');
    } finally {
      setCargando(false);
    }
  };

  const quickSelectRole = (email: string, pass: string) => {
    setCorreo(email);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-white">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* HEADER LOGO */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-black shadow-lg">
            🛍️
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">P&R Store</h1>
          <p className="text-xs text-slate-400">Plataforma Única de Administración Central</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3 rounded-xl text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">Correo Electrónico</label>
            <input
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="admin@pyrstore.pe"
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3.5 px-4 rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2"
          >
            {cargando ? 'Iniciando sesión...' : 'INGRESAR AL SISTEMA'}
          </button>
        </form>

        {/* QUICK ROLE DEMO SELECTOR */}
        <div className="pt-4 border-t border-slate-700 space-y-2">
          <span className="block text-[11px] font-bold text-slate-400 uppercase text-center">Acceso Rápido por Perfil (Demo)</span>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <button
              onClick={() => quickSelectRole('admin@pyrstore.pe', 'admin123')}
              className="bg-slate-700 hover:bg-red-600 text-slate-200 hover:text-white p-2 rounded-xl text-center font-bold transition"
            >
              👑 Admin
            </button>
            <button
              onClick={() => quickSelectRole('vendedor@pyrstore.pe', 'vendedor123')}
              className="bg-slate-700 hover:bg-blue-600 text-slate-200 hover:text-white p-2 rounded-xl text-center font-bold transition"
            >
              💼 Vendedor
            </button>
            <button
              onClick={() => quickSelectRole('almacen@pyrstore.pe', 'almacen123')}
              className="bg-slate-700 hover:bg-emerald-600 text-slate-200 hover:text-white p-2 rounded-xl text-center font-bold transition"
            >
              📦 Almacén
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

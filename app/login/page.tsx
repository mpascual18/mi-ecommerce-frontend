'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState('mpascual@pyr-store.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
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
      console.error('Error de conexión al iniciar sesión:', err);
      setError('No se pudo conectar con el servidor. Intenta nuevamente en unos segundos.');
    } finally {
      setCargando(false);
    }
  };

  const quickSelectRole = (email: string, pass: string) => {
    setCorreo(email);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-white">
      <div className="bg-slate-900 border-2 border-red-600/40 w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Glow light */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* HEADER LOGO */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-16 h-16 bg-white rounded-2xl p-2.5 flex items-center justify-center mx-auto shadow-xl border border-white/20">
            <img src="/logo-icono.png" alt="P&R Store" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-heading font-black text-white tracking-tight pt-1">P&R STORE ERP</h1>
          <p className="text-xs text-amber-300 font-mono">Acceso por Correo Corporativo Zoho Mail (@pyr-store.com)</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3.5 rounded-2xl text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
              Correo Corporativo *
            </label>
            <input
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="ejemplo@pyr-store.com"
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
              Contraseña *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-heading font-black py-4 px-4 rounded-2xl text-sm transition shadow-xl flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {cargando ? 'VALIDANDO SESIÓN...' : '🔑 INGRESAR AL SISTEMA INTEGRAL'}
          </button>
        </form>

        {/* QUICK ACCESOS CORPORATIVOS ZOHO MAIL */}
        <div className="pt-4 border-t border-slate-800 space-y-2 relative z-10">
          <span className="block text-[11px] font-bold text-slate-400 uppercase text-center">
            Accesos de Prueba Zoho Mail (@pyr-store.com)
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              onClick={() => quickSelectRole('mpascual@pyr-store.com', 'admin123')}
              className="bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 p-2.5 rounded-xl text-center font-black transition border border-amber-400/30"
            >
              👑 mpascual (Superadmin)
            </button>
            <button
              onClick={() => quickSelectRole('info@pyr-store.com', 'info123')}
              className="bg-slate-800 hover:bg-blue-600 text-slate-200 p-2.5 rounded-xl text-center font-bold transition border border-slate-700"
            >
              💬 info (Atención)
            </button>
            <button
              onClick={() => quickSelectRole('vendedor@pyr-store.com', 'vendedor123')}
              className="bg-slate-800 hover:bg-emerald-600 text-slate-200 p-2.5 rounded-xl text-center font-bold transition border border-slate-700"
            >
              💼 vendedor (Ventas)
            </button>
            <button
              onClick={() => quickSelectRole('almacen@pyr-store.com', 'almacen123')}
              className="bg-slate-800 hover:bg-purple-600 text-slate-200 p-2.5 rounded-xl text-center font-bold transition border border-slate-700"
            >
              📦 almacen (Logística)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

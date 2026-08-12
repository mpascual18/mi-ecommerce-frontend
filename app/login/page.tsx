'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Modal de Restablecer Contraseña con Código de 6 dígitos
  const [modalResetOpen, setModalResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [pasoReset, setPasoReset] = useState<1 | 2>(1);
  const [codigoIngresado, setCodigoIngresado] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [mensajeReset, setMensajeReset] = useState('');
  const [cargandoReset, setCargandoReset] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const cleanEmail = correo.trim().toLowerCase();

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: cleanEmail, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('pyr_user', JSON.stringify(data.user));
        localStorage.setItem('pyr_token', data.token);
        // Redirigir según el primer módulo permitido
        const modulos = Array.isArray(data.user.modulos) ? data.user.modulos : [];
        if (cleanEmail === 'mpascual@pyr-store.com' || data.user.rol === 'superadmin') {
          router.push('/dashboard');
        } else if (modulos.length > 0) {
          const rutaInicial = modulos.includes('dashboard') ? '/dashboard' : `/${modulos[0]}`;
          router.push(rutaInicial);
        } else {
          router.push('/pedidos');
        }
        return;
      }

      setError(data.error || 'Correo no registrado o contraseña incorrecta.');
    } catch (err) {
      console.warn('⚠️ No se pudo contactar backend API:', err);
      setError('No se pudo conectar con el servidor. Intenta nuevamente.');
    } finally {
      setCargando(false);
    }
  };

  const handleSolicitarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeReset('');
    setCargandoReset(true);

    const cleanEmail = resetEmail.trim().toLowerCase();
    try {
      const res = await fetch(`${API_URL}/api/auth/solicitar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: cleanEmail }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMensajeReset(data.mensaje || 'Si tu correo está registrado, te enviamos un código de 6 dígitos.');
        setPasoReset(2);
      } else {
        setMensajeReset(`❌ Error: ${data.error || 'No se pudo enviar el código.'}`);
      }
    } catch (err) {
      setMensajeReset('❌ No se pudo conectar con el servidor. Intenta nuevamente.');
    } finally {
      setCargandoReset(false);
    }
  };

  const handleConfirmarCambioPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeReset('');
    setCargandoReset(true);

    const cleanEmail = resetEmail.trim().toLowerCase();

    try {
      const res = await fetch(`${API_URL}/api/auth/cambiar-password-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          correo: cleanEmail,
          codigo: codigoIngresado.trim(),
          nuevaPassword: nuevaPassword.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert('✅ ¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión con tu nueva clave.');
        setModalResetOpen(false);
        setPasoReset(1);
        setCorreo(cleanEmail);
        setPassword(nuevaPassword);
      } else {
        setMensajeReset(`❌ Error: ${data.error || 'Código incorrecto'}`);
      }
    } catch (err) {
      setMensajeReset('❌ No se pudo conectar con el servidor. Intenta nuevamente.');
    } finally {
      setCargandoReset(false);
    }
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
          <p className="text-xs text-amber-300 font-mono">Autenticación por Correo Corporativo Zoho Mail</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3.5 rounded-2xl text-center font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
              Correo Corporativo (@pyr-store.com) *
            </label>
            <input
              type="email"
              required
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="ej: mpascual@pyr-store.com"
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none font-medium"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Contraseña *
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(correo);
                  setPasoReset(1);
                  setMensajeReset('');
                  setModalResetOpen(true);
                }}
                className="text-[11px] text-amber-400 font-bold hover:underline"
              >
                🔐 ¿Olvidaste tu clave?
              </button>
            </div>
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
            {cargando ? 'VERIFICANDO CREDENCIALES...' : '🔑 INGRESAR AL SISTEMA'}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            🛡️ Sistema protegido con autenticación corporativa y permisos por módulo.
          </p>
        </div>
      </div>

      {/* MODAL DE RESTABLECIMIENTO DE CONTRASEÑA CON CÓDIGO DE 6 DÍGITOS */}
      {modalResetOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-heading font-black text-white text-sm flex items-center gap-2">
                <span>🔐</span> Restablecer Contraseña (Código 6 dígitos)
              </h3>
              <button
                onClick={() => setModalResetOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {mensajeReset && (
              <div className="p-3 bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs rounded-xl font-bold">
                {mensajeReset}
              </div>
            )}

            {pasoReset === 1 ? (
              <form onSubmit={handleSolicitarCodigo} className="space-y-4 text-xs">
                <p className="text-slate-300">
                  Ingresa tu correo corporativo Zoho Mail para enviarte un <strong>código de seguridad de 6 dígitos</strong>.
                </p>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Correo Corporativo *</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="ej: mpascual@pyr-store.com"
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={cargandoReset}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition text-xs"
                >
                  {cargandoReset ? 'GENERANDO CÓDIGO...' : '📩 ENVIAR CÓDIGO DE 6 DÍGITOS'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmarCambioPassword} className="space-y-4 text-xs">
                <p className="text-slate-300">
                  Introduce el <strong>código de 6 dígitos</strong> recibido en tu correo y tu nueva contraseña.
                </p>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Código de Confirmación (6 dígitos) *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={codigoIngresado}
                    onChange={(e) => setCodigoIngresado(e.target.value)}
                    placeholder="Ej: 849201"
                    className="w-full bg-slate-950 border border-slate-700 text-amber-300 font-mono font-black text-lg tracking-widest text-center rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Nueva Contraseña *</label>
                  <input
                    type="password"
                    required
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPasoReset(1)}
                    className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition text-xs"
                  >
                    ← Volver
                  </button>
                  <button
                    type="submit"
                    disabled={cargandoReset}
                    className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition text-xs"
                  >
                    {cargandoReset ? 'VERIFICANDO...' : '🔐 CONFIRMAR CAMBIO'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const ALL_LINKS = [
  { href: '/dashboard', label: '📊 Dashboard Operativo', key: 'dashboard' },
  { href: '/pedidos', label: '📦 CRM Pedidos & Flujo', key: 'pedidos' },
  { href: '/logistica', label: '🚚 Logística & Despachos', key: 'logistica' },
  { href: '/editor', label: '🎨 Editor de Plantilla Web', key: 'editor' },
  { href: '/metricas', label: '📈 Métricas & Analítica', key: 'metricas' },
  { href: '/inventario/modificar', label: '🛍️ Catálogo & Productos', key: 'inventario' },
  { href: '/venta', label: '💼 Registro de Ventas', key: 'venta' },
  { href: '/clientes', label: '👤 Clientes', key: 'clientes' },
  { href: '/usuarios', label: '👑 Usuarios & Permisos', key: 'usuarios' },
  { href: '/configuracion', label: '⚙️ Configuración & Envíos', key: 'configuracion' },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pyr_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      setUser(null);
    }
  }, []);

  const correo = user?.correo?.toLowerCase() || '';
  const isSuperadmin = correo === 'mpascual@pyr-store.com' || user?.rol === 'superadmin' || user?.rol === 'admin';
  const modulosUsuario = Array.isArray(user?.modulos) ? user.modulos : [];

  // Filtrar links según permisos de módulos asignados por el Superadmin
  const visibleLinks = ALL_LINKS.filter((link) => {
    if (isSuperadmin) return true;
    if (link.key === 'usuarios') return false; // Solo Superadmin puede administrar usuarios
    return modulosUsuario.includes(link.key);
  });

  return (
    <div className="w-64 min-h-screen bg-slate-900 text-white flex flex-col justify-between shadow-xl">
      <div>
        <div className="p-5 border-b border-slate-800 space-y-1">
          <div className="flex items-center gap-2 text-lg font-black">
            <span className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center text-sm shadow-md">🛍️</span>
            <span>P&R STORE</span>
          </div>

          {user && (
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
              <div className="truncate max-w-[130px]">
                <span className="font-bold text-slate-200 block truncate">{user.nombre}</span>
                <span className="text-[9px] text-amber-400 block truncate font-mono">{user.correo}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                  isSuperadmin
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {isSuperadmin ? '👑 Superadmin' : '👤 Personal'}
              </span>
            </div>
          )}
        </div>

        <ul className="mt-4 space-y-1 px-3">
          {visibleLinks.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block px-3.5 py-2.5 rounded-xl font-bold text-xs transition ${
                    active ? 'bg-red-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          href="/"
          className="block w-full text-center bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 rounded-xl transition border border-slate-700"
        >
          🛍️ Ver Tienda Web
        </Link>
        <button
          onClick={() => {
            try {
              localStorage.removeItem('pyr_user');
              localStorage.removeItem('pyr_token');
            } catch (e) {}
            window.location.href = '/login';
          }}
          className="block w-full text-center bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 rounded-xl transition border border-slate-700"
        >
          🔑 Cambiar Perfil / Salir
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

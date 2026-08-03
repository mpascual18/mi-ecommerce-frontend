'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const ALL_LINKS = [
  { href: '/dashboard', label: '📊 Dashboard Operativo', roles: ['admin'] },
  { href: '/pedidos', label: '📦 CRM Pedidos & Flujo', roles: ['admin', 'vendedor', 'almacen'] },
  { href: '/logistica', label: '🚚 Logística & Despachos', roles: ['admin', 'almacen'] },
  { href: '/editor', label: '🎨 Editor de Plantilla Web', roles: ['admin'] },
  { href: '/metricas', label: '📈 Métricas & Analítica', roles: ['admin'] },
  { href: '/inventario/modificar', label: '🛍️ Catálogo & Productos', roles: ['admin', 'vendedor', 'almacen'] },
  { href: '/venta', label: '💼 Registro de Ventas', roles: ['admin', 'vendedor'] },
  { href: '/clientes', label: '👤 Clientes', roles: ['admin', 'vendedor'] },
  { href: '/usuarios', label: '👑 Usuarios & Roles', roles: ['admin'] },
  { href: '/configuracion', label: '⚙️ Configuración', roles: ['admin'] },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pyr_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default Super Admin for demo
        setUser({ nombre: 'Administrador PYR', correo: 'admin@pyrstore.pe', rol: 'admin' });
      }
    } catch (e) {
      setUser({ nombre: 'Administrador PYR', correo: 'admin@pyrstore.pe', rol: 'admin' });
    }
  }, []);

  const currentRol = user?.rol || 'admin';
  const visibleLinks = ALL_LINKS.filter(link => link.roles.includes(currentRol));

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
              <span className="font-bold text-slate-200 truncate max-w-[130px]">{user.nombre}</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                currentRol === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                currentRol === 'vendedor' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {currentRol === 'admin' ? '👑 Admin' : currentRol === 'vendedor' ? '💼 Vendedor' : '📦 Almacén'}
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
          href="/login"
          className="block w-full text-center bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 rounded-xl transition border border-slate-700"
        >
          🔑 Cambiar Perfil / Salir
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;

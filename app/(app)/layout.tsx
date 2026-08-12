'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ToastProvider from '@/components/ui/ToastProvider';
import ConfirmDialogProvider from '@/components/ui/ConfirmDialogProvider';

const ROUTE_MODULE_MAP: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/pedidos': 'pedidos',
  '/logistica': 'logistica',
  '/editor': 'editor',
  '/metricas': 'metricas',
  '/inventario': 'inventario',
  '/venta': 'venta',
  '/clientes': 'clientes',
  '/usuarios': 'usuarios',
  '/configuracion': 'configuracion',
};

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pyr_user');
      const token = localStorage.getItem('pyr_token');
      if (!stored || !token) {
        router.replace('/login');
        return;
      }

      const user = JSON.parse(stored);
      const correo = user?.correo?.toLowerCase() || '';
      const isSuperadmin = correo === 'mpascual@pyr-store.com' || user?.rol === 'superadmin' || user?.rol === 'admin';

      if (isSuperadmin) {
        setAutorizado(true);
        return;
      }

      // Para usuarios normales de personal, verificar permisos de módulo por ruta
      const modulosUsuario: string[] = Array.isArray(user?.modulos) ? user.modulos : [];
      
      // Encontrar la clave del módulo requerido para la ruta actual
      const matchedPrefix = Object.keys(ROUTE_MODULE_MAP).find(
        (prefix) => pathname === prefix || pathname?.startsWith(`${prefix}/`)
      );

      if (matchedPrefix) {
        const requiredModule = ROUTE_MODULE_MAP[matchedPrefix];
        if (requiredModule === 'usuarios' || !modulosUsuario.includes(requiredModule)) {
          // Si no tiene acceso al módulo actual, redirigir al primer módulo permitido
          if (modulosUsuario.length > 0) {
            const firstAllowedRoute = Object.keys(ROUTE_MODULE_MAP).find(
              (route) => ROUTE_MODULE_MAP[route] !== 'usuarios' && modulosUsuario.includes(ROUTE_MODULE_MAP[route])
            );
            router.replace(firstAllowedRoute || '/pedidos');
          } else {
            localStorage.removeItem('pyr_user');
            router.replace('/login');
          }
          return;
        }
      }

      setAutorizado(true);
    } catch {
      router.replace('/login');
    }
  }, [pathname, router]);

  if (!autorizado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400 text-sm font-bold">
        Verificando permisos de acceso...
      </div>
    );
  }

  return (
    <ToastProvider>
      <ConfirmDialogProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-6 bg-background min-h-screen">{children}</main>
        </div>
      </ConfirmDialogProvider>
    </ToastProvider>
  );
}

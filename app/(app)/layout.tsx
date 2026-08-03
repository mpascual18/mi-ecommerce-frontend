'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import ToastProvider from '@/components/ui/ToastProvider';
import ConfirmDialogProvider from '@/components/ui/ConfirmDialogProvider';

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pyr_user');
      if (stored) {
        setAutorizado(true);
      } else {
        router.replace('/login');
      }
    } catch {
      router.replace('/login');
    }
  }, [router]);

  if (!autorizado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400 text-sm font-bold">
        Verificando sesión...
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

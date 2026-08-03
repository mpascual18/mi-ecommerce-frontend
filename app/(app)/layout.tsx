import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import ToastProvider from '@/components/ui/ToastProvider';
import ConfirmDialogProvider from '@/components/ui/ConfirmDialogProvider';

export default function AppLayout({ children }: { children: ReactNode }) {
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

'use client';

import { createContext, useCallback, useContext, useRef, useState, ReactNode } from 'react';

type ToastVariant = 'success' | 'error' | 'info';
type ToastItem = { id: number; message: string; variant: ToastVariant };

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'bg-emerald-600',
  error: 'bg-red-600',
  info: 'bg-slate-800',
};

const VARIANT_ICON: Record<ToastVariant, string> = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
};

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const push = useCallback((variant: ToastVariant, message: string) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const value: ToastContextValue = {
    success: (message) => push('success', message),
    error: (message) => push('error', message),
    info: (message) => push('info', message),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)] pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`${VARIANT_STYLES[t.variant]} text-white rounded-lg shadow-lg px-4 py-3 flex items-start gap-2 pointer-events-auto animate-[toast-in_0.2s_ease-out]`}
          >
            <span>{VARIANT_ICON[t.variant]}</span>
            <span className="text-sm leading-snug">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

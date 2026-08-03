'use client';

import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import Modal from './Modal';
import Button from './Button';

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type ConfirmFn = (options: ConfirmOptions | string) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de <ConfirmDialogProvider>');
  return ctx;
}

type PendingState = {
  options: ConfirmOptions;
  resolve: (value: boolean) => void;
} | null;

export default function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingState>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    const normalized: ConfirmOptions = typeof options === 'string' ? { message: options } : options;
    return new Promise<boolean>((resolve) => {
      setPending({ options: normalized, resolve });
    });
  }, []);

  const handle = (result: boolean) => {
    pending?.resolve(result);
    setPending(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <Modal onClose={() => handle(false)} title={pending.options.title ?? 'Confirmar'} widthClassName="max-w-md">
          <p className="text-sm text-gray-600 mb-6">{pending.options.message}</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => handle(false)}>
              {pending.options.cancelLabel ?? 'Cancelar'}
            </Button>
            <Button variant={pending.options.danger ? 'danger' : 'primary'} onClick={() => handle(true)}>
              {pending.options.confirmLabel ?? 'Confirmar'}
            </Button>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

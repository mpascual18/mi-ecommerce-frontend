'use client';

import { ReactNode, useEffect } from 'react';

type Props = {
  title?: string;
  onClose: () => void;
  children: ReactNode;
  widthClassName?: string;
};

export default function Modal({ title, onClose, children, widthClassName = 'max-w-lg' }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl shadow-xl w-full ${widthClassName} p-6 relative max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl leading-none"
          aria-label="Cerrar"
        >
          ✕
        </button>
        {title && <h2 className="text-lg font-semibold mb-4 pr-6">{title}</h2>}
        {children}
      </div>
    </div>
  );
}

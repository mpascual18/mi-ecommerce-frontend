'use client';

import { ButtonHTMLAttributes } from 'react';
import Spinner from './Spinner';

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-primary hover:bg-primary-hover text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  danger: 'bg-danger hover:bg-danger-hover text-white',
  success: 'bg-success hover:bg-success-hover text-white',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
};

export default function Button({
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}

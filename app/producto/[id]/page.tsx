'use client';

import { useParams } from 'next/navigation';
import StoreShell from '@/components/store/StoreShell';
import ProductPage from '@/components/store/ProductPage';

export default function ProductoRoute() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <StoreShell>
      {id ? <ProductPage id={id} /> : <div className="py-24 text-center text-sm font-bold text-slate-400">Cargando...</div>}
    </StoreShell>
  );
}

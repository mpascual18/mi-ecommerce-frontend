'use client';

import { useParams } from 'next/navigation';
import StoreShell from '@/components/store/StoreShell';
import ProductPage from '@/components/store/ProductPage';

export default function ProductoPorSlugRoute() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  return (
    <StoreShell hideFloatingCart>
      {slug ? <ProductPage slug={slug} /> : <div className="py-24 text-center text-sm font-bold text-slate-400">Cargando...</div>}
    </StoreShell>
  );
}

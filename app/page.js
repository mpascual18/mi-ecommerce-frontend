import { Suspense } from 'react';
import StoreShell from '@/components/store/StoreShell';
import HomeCatalog from '@/components/store/HomeCatalog';

export default function Home() {
  return (
    <StoreShell>
      <Suspense fallback={<div className="py-20 text-center text-sm font-bold text-slate-400">Cargando tienda...</div>}>
        <HomeCatalog />
      </Suspense>
    </StoreShell>
  );
}

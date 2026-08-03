'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { slugify } from '@/components/store/constants';

/**
 * Ruta de compatibilidad: /producto/123 → redirige a /nombre-del-producto.
 * Se mantiene solo por si algún link antiguo (ej. un anuncio ya publicado) apunta aquí.
 */
export default function ProductoLegacyRedirect() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [error, setError] = useState(false);
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/productos/${id}`);
        if (res.ok) {
          const data = await res.json();
          const slug = slugify(data.nombre);
          router.replace(slug ? `/${slug}` : '/');
          return;
        }
      } catch {}
      setError(true);
    })();
  }, [id, router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-sm font-bold text-slate-400">
      {error ? 'No encontramos este producto.' : 'Redirigiendo...'}
    </div>
  );
}

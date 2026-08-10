'use client';

import { Suspense, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

const PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || '';

// useSearchParams requiere un limite de Suspense en Next.js app router,
// por eso el seguimiento de navegacion vive en un componente aparte.
function PageViewOnNavigate() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const primerRender = useRef(true);

  useEffect(() => {
    // El script base ya dispara el primer PageView al cargar; en las
    // navegaciones siguientes (client-side routing de Next.js) hay que
    // dispararlo a mano, porque no hay recarga de pagina real.
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams]);

  return null;
}

export default function MetaPixel() {
  if (!PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <Suspense fallback={null}>
        <PageViewOnNavigate />
      </Suspense>
    </>
  );
}

import "./globals.css";

const SITE_URL = "https://www.pyr-store.com";
const TITLE = "P&R Store | Calidad que te acompaña";
const DESCRIPTION =
  "Productos importados de calidad para el hogar, cocina, tecnología y bienestar. Envíos a todo el Perú, pago contra entrega en Lima.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "P&R Store",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "P&R Store" }],
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="font-sans antialiased bg-gray-50 text-gray-900"
      >
        {children}
      </body>
    </html>
  );
}

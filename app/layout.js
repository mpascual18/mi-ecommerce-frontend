import "./globals.css";

export const metadata = {
  title: "P&R Store | Sistema ERP/CRM",
  description: "Sistema unificado de gestión de inventario, e-commerce y ventas de P&R Store",
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

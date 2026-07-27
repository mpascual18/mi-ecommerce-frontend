import Link from 'next/link';

const Sidebar = () => {
  return (
    <div className="w-64 min-h-screen bg-gray-800 text-white">
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        🛍️ P&R STORE
        </div>
      <ul className="mt-6 space-y-2">
        <li className="px-6 py-2 hover:bg-gray-700">
          <Link href="/dashboard">Dashboard</Link>
        </li>
        <li className="px-6 py-2 hover:bg-gray-700">
          <Link href="/inventario">Inventario</Link>
        </li>
        <li className="px-6 py-2 hover:bg-gray-700">
          <Link href="/venta">Ventas</Link>
        </li>
        <li className="px-6 py-2 hover:bg-gray-700">
          <Link href="/clientes">Clientes</Link>
        </li>
        <li className="px-6 py-2 hover:bg-gray-700">
          <Link href="/configuracion">Configuración</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

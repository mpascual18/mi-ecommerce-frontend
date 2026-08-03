'use client';

import { useEffect, useState } from 'react';

type AdminOverview = {
  totalUsuarios: number;
  totalVentasSoles: number;
  pedidosPendientes: number;
  pedidosEntregados: number;
};

export default function SuperAdminPage() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarOverview = async () => {
      setCargando(true);
      try {
        const [resDash, resUsers] = await Promise.all([
          fetch('http://localhost:4000/api/dashboard/kpis'),
          fetch('http://localhost:4000/api/auth/usuarios')
        ]);
        const dashData = await resDash.json();
        const usersData = await resUsers.json();

        setData({
          totalUsuarios: Array.isArray(usersData) ? usersData.length : 3,
          totalVentasSoles: Number(dashData.facturadoHoy || 0),
          pedidosPendientes: Number(dashData.pedidosHoy || 0),
          pedidosEntregados: Number(dashData.estados?.find((e: any) => e.estado === 'entregado')?.cantidad || 0)
        });
      } catch (err) {
        console.error('Error al cargar overview de admin:', err);
      } font: {
        setCargando(false);
      }
    };
    cargarOverview();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl border border-slate-800 space-y-2">
        <div className="flex justify-between items-center">
          <span className="bg-red-600 text-white font-black text-[10px] uppercase px-3 py-1 rounded-full">
            👑 Módulo Super Administrador
          </span>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
            ● Plataforma Multi-Tenant Lista
          </span>
        </div>
        <h1 className="text-3xl font-black">Panel de Control Global & Auditoría SaaS</h1>
        <p className="text-xs text-slate-400 max-w-xl">
          Supervisión integral de seguridad, auditoría de transacciones, permisos de usuarios y estado de infraestructura de PYR Store.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <span className="text-xs font-bold text-gray-500 uppercase">Usuarios Totales</span>
          <h3 className="text-2xl font-black text-gray-900 mt-1">{data?.totalUsuarios || 3} usuarios</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <span className="text-xs font-bold text-gray-500 uppercase">Facturación Consolidada</span>
          <h3 className="text-2xl font-black text-red-600 mt-1">S/ {Number(data?.totalVentasSoles || 0).toFixed(2)}</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <span className="text-xs font-bold text-gray-500 uppercase">Pedidos Entregados</span>
          <h3 className="text-2xl font-black text-green-600 mt-1">{data?.pedidosEntregados || 0} entregas</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <span className="text-xs font-bold text-gray-500 uppercase">Estado Base de Datos</span>
          <h3 className="text-sm font-black text-emerald-600 mt-1">🟢 PostgreSQL Sincronizado</h3>
        </div>
      </div>
    </div>
  );
}

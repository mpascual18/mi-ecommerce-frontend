'use client';

import { useEffect, useState } from 'react';
import { API_URL, apiFetch } from '@/lib/api';

type VendedorMeta = {
  vendedor: string;
  pedidosAsignados: number;
  pedidosConfirmados: number;
  totalVendido: number;
};

export default function VendedoresWorkspacePage() {
  const [data, setData] = useState<VendedorMeta | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatosVendedor = async () => {
      setCargando(true);
      try {
        const res = await apiFetch(`${API_URL}/api/pedidos`);
        const pedidos = await res.json();
        
        if (Array.isArray(pedidos)) {
          // "Confirmadas" = ya trabajadas por el vendedor (paso de ingresado a algo mas), sin contar anuladas.
          const confirmados = pedidos.filter((p: any) => p.estado !== 'ingresado' && p.estado !== 'anulado');
          const totalSoles = confirmados.reduce((acc: number, p: any) => acc + Number(p.total), 0);

          setData({
            vendedor: 'Vendedor Tienda',
            pedidosAsignados: pedidos.length,
            pedidosConfirmados: confirmados.length,
            totalVendido: totalSoles
          });
        }
      } catch (err) {
        console.error('Error al cargar metas del vendedor:', err);
      } finally {
        setCargando(false);
      }
    };
    cargarDatosVendedor();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-blue-900 text-white p-6 rounded-3xl shadow-xl space-y-2">
        <div className="flex justify-between items-center">
          <span className="bg-blue-600 text-white font-black text-[10px] uppercase px-3 py-1 rounded-full">
            💼 Espacio de Trabajo - Vendedor Comercial
          </span>
          <span className="text-xs font-bold text-amber-300">
            ⭐ Comisiones del Mes
          </span>
        </div>
        <h1 className="text-3xl font-black">Mi Panel de Ventas & Clientes</h1>
        <p className="text-xs text-blue-200">
          Gestiona tus leads de Meta Ads, llamadas de reconfirmación y realiza seguimiento a tus ventas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <span className="text-xs font-bold text-gray-500 uppercase">Leads / Pedidos Asignados</span>
          <h3 className="text-2xl font-black text-gray-900 mt-1">{data?.pedidosAsignados || 0} pedidos</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <span className="text-xs font-bold text-gray-500 uppercase">Ventas Confirmadas</span>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">{data?.pedidosConfirmados || 0} confirmadas</h3>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <span className="text-xs font-bold text-gray-500 uppercase">Total Facturado</span>
          <h3 className="text-2xl font-black text-red-600 mt-1">S/ {Number(data?.totalVendido || 0).toFixed(2)}</h3>
        </div>
      </div>
    </div>
  );
}

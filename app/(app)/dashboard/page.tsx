'use client';

import { useEffect, useState } from 'react';

type DashboardData = {
  estados: Array<{ estado: string; cantidad: number; monto: number }>;
  regiones: Array<{ region: string; cantidad: number; monto: number }>;
  montoCalle: number;
  facturadoHoy: number;
  pedidosHoy: number;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDashboard = async () => {
      setCargando(true);
      try {
        const res = await fetch('http://localhost:4000/api/dashboard/kpis');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Error al cargar dashboard:', err);
      } finally {
        setCargando(false);
      }
    };
    cargarDashboard();
  }, []);

  if (cargando || !data) {
    return (
      <div className="p-8 text-center text-gray-500 font-bold">
        📊 Cargando métricas operativas de PYR Store...
      </div>
    );
  }

  const getCantEstado = (est: string) => data.estados.find(e => e.estado === est)?.cantidad || 0;
  const getMontoEstado = (est: string) => Number(data.estados.find(e => e.estado === est)?.monto || 0);

  const cantIngresados = getCantEstado('ingresado');
  const cantConfirmados = getCantEstado('confirmado');
  const cantEnCamino = getCantEstado('en_camino');
  const cantEntregados = getCantEstado('entregado');
  const cantAnulados = getCantEstado('anulado');

  const limaData = data.regiones.find(r => r.region === 'lima') || { cantidad: 0, monto: 0 };
  const provData = data.regiones.find(r => r.region === 'provincia') || { cantidad: 0, monto: 0 };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">📊 Panel de Control Operativo</h1>
        <p className="text-sm text-gray-500">Métricas en tiempo real de e-commerce, pedidos contra entrega y despachos</p>
      </div>

      {/* TOP FINANCIAL CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <span className="text-xs font-bold text-gray-500 uppercase">Facturado Hoy</span>
          <p className="text-3xl font-black text-emerald-600 mt-2">S/ {Number(data.facturadoHoy).toFixed(2)}</p>
          <span className="text-xs text-gray-400 font-semibold">{data.pedidosHoy} pedidos procesados hoy</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <span className="text-xs font-bold text-gray-500 uppercase">🚚 Monto en Camino (Por Cobrar)</span>
          <p className="text-3xl font-black text-purple-600 mt-2">S/ {Number(data.montoCalle).toFixed(2)}</p>
          <span className="text-xs text-gray-400 font-semibold">{cantEnCamino} paquetes con motorizados/agencias</span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <span className="text-xs font-bold text-gray-500 uppercase">🔴 Perdido por Anulaciones</span>
          <p className="text-3xl font-black text-red-600 mt-2">S/ {getMontoEstado('anulado').toFixed(2)}</p>
          <span className="text-xs text-gray-400 font-semibold">{cantAnulados} pedidos cancelados (Stock devuelto)</span>
        </div>
      </div>

      {/* PEDIDOS BY STATUS PIPELINE */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-lg font-extrabold text-gray-900">📦 Estado Actual de Pedidos en Sistema</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-1">
            <span className="text-xs font-bold text-amber-800 uppercase">📥 Ingresados</span>
            <p className="text-2xl font-black text-amber-900">{cantIngresados}</p>
            <span className="text-[11px] text-amber-700 font-semibold">S/ {getMontoEstado('ingresado').toFixed(2)}</span>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1">
            <span className="text-xs font-bold text-emerald-800 uppercase">🟢 Confirmados</span>
            <p className="text-2xl font-black text-emerald-900">{cantConfirmados}</p>
            <span className="text-[11px] text-emerald-700 font-semibold">S/ {getMontoEstado('confirmado').toFixed(2)}</span>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-center space-y-1">
            <span className="text-xs font-bold text-purple-800 uppercase">🚚 En Camino</span>
            <p className="text-2xl font-black text-purple-900">{cantEnCamino}</p>
            <span className="text-[11px] text-purple-700 font-semibold">S/ {getMontoEstado('en_camino').toFixed(2)}</span>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center space-y-1">
            <span className="text-xs font-bold text-green-800 uppercase">✅ Entregados</span>
            <p className="text-2xl font-black text-green-900">{cantEntregados}</p>
            <span className="text-[11px] text-green-700 font-semibold">S/ {getMontoEstado('entregado').toFixed(2)}</span>
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center space-y-1">
            <span className="text-xs font-bold text-red-800 uppercase">🔴 Anulados</span>
            <p className="text-2xl font-black text-red-900">{cantAnulados}</p>
            <span className="text-[11px] text-red-700 font-semibold">S/ {getMontoEstado('anulado').toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* GEOGRAPHIC COMPARISON: LIMA VS PROVINCIAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-3">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-extrabold text-gray-900 text-base">🏢 Lima Metropolitana</h3>
            <span className="bg-red-100 text-red-700 text-xs font-black px-2.5 py-0.5 rounded-full">Contra Entrega</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-bold text-gray-600">Total Pedidos:</span>
            <span className="text-xl font-black text-gray-900">{limaData.cantidad} pedidos</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-bold text-gray-600">Monto Acumulado:</span>
            <span className="text-xl font-black text-red-600">S/ {Number(limaData.monto).toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-3">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-extrabold text-gray-900 text-base">🚛 Provincias (Agencias)</h3>
            <span className="bg-blue-100 text-blue-700 text-xs font-black px-2.5 py-0.5 rounded-full">Shalom / Olva</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-bold text-gray-600">Total Pedidos:</span>
            <span className="text-xl font-black text-gray-900">{provData.cantidad} pedidos</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-bold text-gray-600">Monto Acumulado:</span>
            <span className="text-xl font-black text-blue-600">S/ {Number(provData.monto).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

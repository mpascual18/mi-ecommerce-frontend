'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';

type MetricasData = {
  totales: { total_pedidos: number; total_ingresos: number };
  canales: Array<{ origen: string; cantidad: number; ingresos: number }>;
  topProductos: Array<{ nombre: string; total_vendido: number; total_soles: number }>;
  vendedores: Array<{ nombre: string; apellido: string; total_ventas: number; ingresos_generados: number }>;
};

export default function MetricasPage() {
  const [data, setData] = useState<MetricasData | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarMetricas = async () => {
      setCargando(true);
      try {
        const res = await fetch(`${API_URL}/api/metricas`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Error al cargar métricas:', err);
      } finally {
        setCargando(false);
      }
    };
    cargarMetricas();
  }, []);

  if (cargando || !data) {
    return (
      <div className="p-8 text-center text-gray-500 font-bold">
        📊 Cargando métricas consolidadas de PYR Store...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">📈 Métricas Consolidadas y Analítica</h1>
        <p className="text-sm text-gray-500">Rendimiento por canales de venta (Meta Ads vs. Tienda Física) y vendedores</p>
      </div>

      {/* CARDS DE TOTALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <span className="text-xs font-bold text-gray-500 uppercase">Ingresos Totales</span>
          <p className="text-3xl font-black text-red-600 mt-2">S/ {Number(data.totales.total_ingresos).toFixed(2)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <span className="text-xs font-bold text-gray-500 uppercase">Total de Pedidos</span>
          <p className="text-3xl font-black text-gray-900 mt-2">{data.totales.total_pedidos} pedidos</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <span className="text-xs font-bold text-gray-500 uppercase">Ticket Promedio</span>
          <p className="text-3xl font-black text-blue-600 mt-2">
            S/ {data.totales.total_pedidos > 0 ? (Number(data.totales.total_ingresos) / Number(data.totales.total_pedidos)).toFixed(2) : '0.00'}
          </p>
        </div>
      </div>

      {/* DESGLOSE POR CANAL DE VENTA */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
        <h2 className="text-lg font-bold text-gray-900">🚀 Rendimiento por Canal de Venta</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {data.canales.map((c) => (
            <div key={c.origen} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
              <span className="text-xs font-bold uppercase text-gray-500">
                {c.origen === 'landing_meta' ? '📲 Meta Ads / Landings' : c.origen === 'whatsapp' ? '💬 WhatsApp Directo' : '🏬 Tienda Física'}
              </span>
              <p className="text-xl font-black text-gray-900">S/ {Number(c.ingresos).toFixed(2)}</p>
              <span className="text-xs text-gray-500 font-semibold">{c.cantidad} pedidos</span>
            </div>
          ))}
        </div>
      </div>

      {/* TOP PRODUCTOS Y VENDEDORES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TOP PRODUCTOS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 text-sm">🏆 Productos Más Vendidos</h3>
          </div>
          <div className="p-4 divide-y divide-gray-100">
            {data.topProductos.map((p, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-xs text-gray-900">{p.nombre}</p>
                  <span className="text-[11px] text-gray-500">{p.total_vendido} unidades vendidas</span>
                </div>
                <span className="font-black text-red-600 text-sm">S/ {Number(p.total_soles).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* DESEMPENO DE VENDEDORES */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 text-sm">👔 Rendimiento por Vendedor</h3>
          </div>
          <div className="p-4 divide-y divide-gray-100">
            {data.vendedores.map((v, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-xs text-gray-900">{v.nombre} {v.apellido}</p>
                  <span className="text-[11px] text-gray-500">{v.total_ventas} ventas registradas</span>
                </div>
                <span className="font-black text-green-600 text-sm">S/ {Number(v.ingresos_generados).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

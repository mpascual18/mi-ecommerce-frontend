'use client';

import { useEffect, useState } from 'react';
import { API_URL, apiFetch } from '@/lib/api';
import Link from 'next/link';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ESTADOS_PEDIDO } from '@/lib/estadosPedido';

type DashboardData = {
  estados: Array<{ estado: string; cantidad: number; monto: number }>;
  regiones: Array<{ region: string; cantidad: number; monto: number }>;
  montoCalle: number;
  facturadoHoy: number;
  pedidosHoy: number;
};

type EtapaTiempo = {
  id: string;
  label: string;
  promedioMinutos: number | null;
  muestras: number;
};

function formatearDuracion(minutos: number): string {
  if (minutos < 60) return `${Math.round(minutos)} min`;
  const horas = minutos / 60;
  if (horas < 24) return `${horas.toFixed(1)} h`;
  return `${(horas / 24).toFixed(1)} días`;
}

const COLOR_MAP: Record<string, string> = Object.fromEntries(ESTADOS_PEDIDO.map((e) => [e.id, e.hex]));

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [tiempos, setTiempos] = useState<EtapaTiempo[]>([]);

  useEffect(() => {
    const cargarDashboard = async () => {
      setCargando(true);
      try {
        const res = await apiFetch(`${API_URL}/api/dashboard/kpis`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Error al cargar dashboard:', err);
      } finally {
        setCargando(false);
      }
    };
    cargarDashboard();

    apiFetch(`${API_URL}/api/dashboard/tiempos`)
      .then((r) => r.json())
      .then((j) => setTiempos(Array.isArray(j.etapas) ? j.etapas : []))
      .catch((err) => console.error('Error al cargar tiempos:', err));
  }, []);

  if (cargando || !data) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-bold text-gray-500">Cargando métricas de inteligencia SaaS PYR Store...</p>
      </div>
    );
  }

  const getCantEstado = (est: string) => data.estados.find((e) => e.estado === est)?.cantidad || 0;
  const getMontoEstado = (est: string) => Number(data.estados.find((e) => e.estado === est)?.monto || 0);

  const cantIngresados = getCantEstado('ingresado');
  const cantEnProceso = getCantEstado('en_proceso');
  const cantLogistica = getCantEstado('logistica');
  const cantEmpacado = getCantEstado('empacado');
  const cantEnCamino = getCantEstado('en_camino');
  const cantEntregados = getCantEstado('entregado');
  const cantAnulados = getCantEstado('anulado');

  const totalPedidosSuma = cantIngresados + cantEnProceso + cantLogistica + cantEmpacado + cantEnCamino + cantEntregados + cantAnulados;
  const efectividadEntregas = totalPedidosSuma > 0 ? Math.round((cantEntregados / (cantEntregados + cantAnulados || 1)) * 100) : 100;

  const limaData = data.regiones.find((r) => r.region === 'lima') || { cantidad: 0, monto: 0 };
  const provData = data.regiones.find((r) => r.region === 'provincia') || { cantidad: 0, monto: 0 };

  const chartPipelineData = [
    { name: 'Ingresados', cantidad: cantIngresados, monto: getMontoEstado('ingresado') },
    { name: 'En Gestión', cantidad: cantEnProceso, monto: getMontoEstado('en_proceso') },
    { name: 'Por Empacar', cantidad: cantLogistica, monto: getMontoEstado('logistica') },
    { name: 'Empacado', cantidad: cantEmpacado, monto: getMontoEstado('empacado') },
    { name: 'En Tránsito', cantidad: cantEnCamino, monto: getMontoEstado('en_camino') },
    { name: 'Entregados', cantidad: cantEntregados, monto: getMontoEstado('entregado') },
    { name: 'Anulados', cantidad: cantAnulados, monto: getMontoEstado('anulado') },
  ];

  const pieRegionesData = [
    { name: 'Lima Metropolitana (Contra Entrega)', value: Number(limaData.monto) || 1, color: '#dc2626' },
    { name: 'Provincias (Agencias)', value: Number(provData.monto) || 1, color: '#2563eb' },
  ];

  return (
    <div className="space-y-8 pb-10">
      
      {/* HEADER CON RESUMEN DE SALUD DE NEGOCIO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-red-100 text-red-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
              SaaS Operational Intelligence
            </span>
            <span className="text-xs text-gray-400 font-bold">• Actualizado en tiempo real</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 mt-1">📊 Dashboard Operativo & Analítica</h1>
        </div>

        {/* INDICADOR DE EFECTIVIDAD */}
        <div className="bg-white border border-gray-200 p-3 rounded-2xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg">
            {efectividadEntregas}%
          </div>
          <div>
            <span className="text-xs font-bold text-gray-900 block">Tasa de Efectividad de Entregas</span>
            <span className="text-[11px] text-gray-500">Pedidos entregados vs anulados</span>
          </div>
        </div>
      </div>

      {/* RECOMENDACIÓN E INSIGHT INTELIGENTE */}
      {cantIngresados > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-extrabold text-sm">Alerta Operativa de Contacto Inmediato</h3>
              <p className="text-xs text-amber-100">
                Tienes <strong className="underline font-black">{cantIngresados} pedido(s) ingresados</strong> pendientes de contactar. ¡Un tiempo de respuesta menor a 15 min aumenta la conversión un 40%!
              </p>
            </div>
          </div>
          <Link
            href="/pedidos"
            className="bg-white text-amber-900 font-black text-xs px-4 py-2 rounded-xl shadow-xs hover:bg-amber-50 transition shrink-0"
          >
            Ir a CRM Pedidos →
          </Link>
        </div>
      )}

      {/* TOP FINANCIAL METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* FACTURADO HOY */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-xl border border-slate-700 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Facturado Hoy</span>
            <span className="text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-md">🟢 En Línea</span>
          </div>
          <p className="text-4xl font-black text-emerald-400 tracking-tight">S/ {Number(data.facturadoHoy).toFixed(2)}</p>
          <div className="flex justify-between items-center text-xs text-slate-300 pt-2 border-t border-slate-700/60">
            <span>{data.pedidosHoy} pedidos procesados hoy</span>
            <span className="text-emerald-400 font-bold">100% Cobrado</span>
          </div>
        </div>

        {/* MONTO EN CAMINO */}
        <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white p-6 rounded-3xl shadow-xl border border-purple-800 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-bold text-purple-300 uppercase tracking-wider">
            <span>🚚 Monto En Camino (Por Cobrar)</span>
            <span className="text-purple-200 font-bold bg-purple-500/20 px-2 py-0.5 rounded-md">Por Liquidar</span>
          </div>
          <p className="text-4xl font-black text-purple-300 tracking-tight">S/ {Number(data.montoCalle).toFixed(2)}</p>
          <div className="flex justify-between items-center text-xs text-purple-200 pt-2 border-t border-purple-800/60">
            <span>{cantEnCamino} paquetes con motorizados/agencias</span>
            <span className="text-purple-300 font-bold">Pendiente Caja</span>
          </div>
        </div>

        {/* PERDIDO POR ANULACIONES */}
        <div className="bg-gradient-to-br from-red-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-red-900 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-bold text-red-300 uppercase tracking-wider">
            <span>🔴 Pérdida por Anulaciones</span>
            <span className="text-red-300 font-bold bg-red-500/20 px-2 py-0.5 rounded-md">Stock Devuelto</span>
          </div>
          <p className="text-4xl font-black text-red-400 tracking-tight">S/ {getMontoEstado('anulado').toFixed(2)}</p>
          <div className="flex justify-between items-center text-xs text-red-200 pt-2 border-t border-red-900/60">
            <span>{cantAnulados} pedidos cancelados</span>
            <span className="text-red-400 font-bold">Stock Reingresado</span>
          </div>
        </div>

      </div>

      {/* PIPELINE CARDS DE ESTADO DE PEDIDOS */}
      <div className="bg-white p-6 rounded-3xl shadow-xs border border-gray-200 space-y-4">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <span>📦 Embudo de Pedidos en Sistema</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl text-center space-y-1 shadow-2xs hover:shadow-md transition">
            <span className="text-xs font-black text-amber-800 uppercase block">📥 1. Ingresados</span>
            <p className="text-3xl font-black text-amber-900">{cantIngresados}</p>
            <span className="text-xs font-black text-amber-700 block">S/ {getMontoEstado('ingresado').toFixed(2)}</span>
          </div>

          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl text-center space-y-1 shadow-2xs hover:shadow-md transition">
            <span className="text-xs font-black text-blue-800 uppercase block">📞 2. En Gestión</span>
            <p className="text-3xl font-black text-blue-900">{cantEnProceso}</p>
            <span className="text-xs font-black text-blue-700 block">S/ {getMontoEstado('en_proceso').toFixed(2)}</span>
          </div>

          <div className="p-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl text-center space-y-1 shadow-2xs hover:shadow-md transition">
            <span className="text-xs font-black text-indigo-800 uppercase block">📦 3. Por Empacar</span>
            <p className="text-3xl font-black text-indigo-900">{cantLogistica}</p>
            <span className="text-xs font-black text-indigo-700 block">S/ {getMontoEstado('logistica').toFixed(2)}</span>
          </div>

          <div className="p-4 bg-cyan-50 border-2 border-cyan-200 rounded-2xl text-center space-y-1 shadow-2xs hover:shadow-md transition">
            <span className="text-xs font-black text-cyan-800 uppercase block">🗳️ 4. Empacado</span>
            <p className="text-3xl font-black text-cyan-900">{cantEmpacado}</p>
            <span className="text-xs font-black text-cyan-700 block">S/ {getMontoEstado('empacado').toFixed(2)}</span>
          </div>

          <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl text-center space-y-1 shadow-2xs hover:shadow-md transition">
            <span className="text-xs font-black text-purple-800 uppercase block">🚚 5. En Tránsito</span>
            <p className="text-3xl font-black text-purple-900">{cantEnCamino}</p>
            <span className="text-xs font-black text-purple-700 block">S/ {getMontoEstado('en_camino').toFixed(2)}</span>
          </div>

          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-2xl text-center space-y-1 shadow-2xs hover:shadow-md transition">
            <span className="text-xs font-black text-green-800 uppercase block">✅ 6. Entregados</span>
            <p className="text-3xl font-black text-green-900">{cantEntregados}</p>
            <span className="text-xs font-black text-green-700 block">S/ {getMontoEstado('entregado').toFixed(2)}</span>
          </div>

          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-center space-y-1 shadow-2xs hover:shadow-md transition">
            <span className="text-xs font-black text-red-800 uppercase block">🔴 7. Anulados</span>
            <p className="text-3xl font-black text-red-900">{cantAnulados}</p>
            <span className="text-xs font-black text-red-700 block">S/ {getMontoEstado('anulado').toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* RECHARTS VISUALES INTELIGENTES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GRÁFICO BARRA DE PIPELINE */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl shadow-xs border border-gray-200 space-y-4">
          <h3 className="font-black text-gray-900 text-base">📈 Distribución de Montos por Estado de Pedido</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartPipelineData}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any) => [`S/ ${Number(value).toFixed(2)}`, 'Monto Acumulado']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="monto" radius={[10, 10, 0, 0]}>
                  {chartPipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(COLOR_MAP)[index % Object.keys(COLOR_MAP).length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COMPARATIVA GEOGRÁFICA LIMA VS PROVINCIAS */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl shadow-xs border border-gray-200 space-y-4 flex flex-col justify-between">
          <h3 className="font-black text-gray-900 text-base">🗺️ Venta por Región (Lima vs Provincia)</h3>
          
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieRegionesData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4}>
                  {pieRegionesData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`S/ ${Number(value).toFixed(2)}`, 'Monto Total']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-bold text-red-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block"></span> 🏢 Lima (Contra Entrega):
              </span>
              <strong className="text-gray-900 font-black">S/ {Number(limaData.monto).toFixed(2)} ({limaData.cantidad} pds)</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-blue-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span> 🚛 Provincia (Agencias):
              </span>
              <strong className="text-gray-900 font-black">S/ {Number(provData.monto).toFixed(2)} ({provData.cantidad} pds)</strong>
            </div>
          </div>
        </div>

      </div>

      {/* TIEMPOS PROMEDIO POR ETAPA */}
      <div className="bg-white p-6 rounded-3xl shadow-xs border border-gray-200 space-y-4">
        <div>
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <span>🕒 Tiempos Promedio por Etapa</span>
          </h2>
          <p className="text-xs text-gray-500">Calculado sobre el historial real de tickets que pasaron por cada etapa.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tiempos.map((etapa) => (
            <div key={etapa.id} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-1">
              <span className="text-xs font-black text-slate-700 uppercase block">{etapa.label}</span>
              {etapa.promedioMinutos !== null ? (
                <>
                  <p className="text-2xl font-black text-slate-900">{formatearDuracion(etapa.promedioMinutos)}</p>
                  <span className="text-[11px] text-slate-500">Promedio sobre {etapa.muestras} ticket{etapa.muestras === 1 ? '' : 's'}</span>
                </>
              ) : (
                <p className="text-xs text-slate-400 pt-1">Aún sin datos suficientes</p>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

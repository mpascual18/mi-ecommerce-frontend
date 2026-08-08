// Fuente unica de verdad para los estados del pipeline de pedidos.
// Ventas (pedidos/page.tsx) trabaja los primeros 2 estados; al enviar a
// logistica, el ticket pasa a ser responsabilidad de logistica/page.tsx.

export type EstadoPedido =
  | 'ingresado'
  | 'en_proceso'
  | 'logistica'
  | 'empacado'
  | 'en_camino'
  | 'entregado'
  | 'anulado';

export type EstadoConfig = {
  id: EstadoPedido;
  label: string;
  color: string;
  icon: string;
  hex: string;
};

export const ESTADOS_PEDIDO: EstadoConfig[] = [
  { id: 'ingresado', label: '1. Por Atender', color: 'bg-amber-100 text-amber-900 border-amber-300', icon: '📥', hex: '#f59e0b' },
  { id: 'en_proceso', label: '2. En Gestión', color: 'bg-blue-100 text-blue-900 border-blue-300', icon: '📞', hex: '#3b82f6' },
  { id: 'logistica', label: '3. Por Empacar', color: 'bg-indigo-100 text-indigo-900 border-indigo-300', icon: '📦', hex: '#6366f1' },
  { id: 'empacado', label: '4. Empacado', color: 'bg-cyan-100 text-cyan-900 border-cyan-300', icon: '🗳️', hex: '#06b6d4' },
  { id: 'en_camino', label: '5. En Tránsito', color: 'bg-purple-100 text-purple-900 border-purple-300', icon: '🚚', hex: '#a855f7' },
  { id: 'entregado', label: '6. Entregado / Conforme', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: '✅', hex: '#16a34a' },
  { id: 'anulado', label: '7. Anulado', color: 'bg-red-100 text-red-900 border-red-300', icon: '🔴', hex: '#ef4444' },
];

export const ESTADOS_VENTA: EstadoPedido[] = ['ingresado', 'en_proceso'];
export const ESTADOS_LOGISTICA: EstadoPedido[] = ['logistica', 'empacado', 'en_camino', 'entregado', 'anulado'];

export function getEstadoConfig(estado: string): EstadoConfig {
  return ESTADOS_PEDIDO.find((e) => e.id === estado) || ESTADOS_PEDIDO[0];
}

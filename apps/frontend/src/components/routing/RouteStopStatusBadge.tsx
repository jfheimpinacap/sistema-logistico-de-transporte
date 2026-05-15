import type { RouteStopStatus, RouteStopType, RouteShipmentStatus } from '../../types/routing'

export const routeStopStatusOptions: Array<{ value: RouteStopStatus; label: string }> = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'arrived', label: 'Llegó' },
  { value: 'completed', label: 'Completada' },
  { value: 'failed', label: 'Fallida' },
  { value: 'skipped', label: 'Saltada' },
  { value: 'cancelled', label: 'Cancelada' },
]
export const routeStopTypeOptions: Array<{ value: RouteStopType; label: string }> = [
  { value: 'pickup', label: 'Retiro' }, { value: 'delivery', label: 'Entrega' }, { value: 'transfer', label: 'Transferencia' }, { value: 'warehouse', label: 'Bodega' }, { value: 'return', label: 'Retorno' },
]
export const routeShipmentStatusOptions: Array<{ value: RouteShipmentStatus; label: string }> = [
  { value: 'assigned', label: 'Asignada' }, { value: 'loaded', label: 'Cargada' }, { value: 'in_transit', label: 'En tránsito' }, { value: 'delivered', label: 'Entregada' }, { value: 'failed_delivery', label: 'Entrega fallida' }, { value: 'returned', label: 'Devuelta' }, { value: 'cancelled', label: 'Cancelada' },
]
const styles: Record<string, string> = { pending: 'bg-slate-100 text-slate-700', arrived: 'bg-cyan-50 text-cyan-700', completed: 'bg-emerald-50 text-emerald-700', failed: 'bg-rose-50 text-rose-700', skipped: 'bg-amber-50 text-amber-700', cancelled: 'bg-slate-200 text-slate-600' }
export function getRouteStopStatusLabel(value?: string | null) { return routeStopStatusOptions.find((option) => option.value === value)?.label ?? value ?? '—' }
export function getRouteStopTypeLabel(value?: string | null) { return routeStopTypeOptions.find((option) => option.value === value)?.label ?? value ?? '—' }
export function getRouteShipmentStatusLabel(value?: string | null) { return routeShipmentStatusOptions.find((option) => option.value === value)?.label ?? value ?? '—' }
export function RouteStopStatusBadge({ value }: { value?: string | null }) { return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[value ?? ''] ?? 'bg-slate-100 text-slate-700'}`}>{getRouteStopStatusLabel(value)}</span> }

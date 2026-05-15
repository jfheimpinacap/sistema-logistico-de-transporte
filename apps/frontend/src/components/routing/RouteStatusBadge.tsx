import type { RouteStatus } from '../../types/routing'

export const routeStatusOptions: Array<{ value: RouteStatus; label: string }> = [
  { value: 'draft', label: 'Borrador' },
  { value: 'planned', label: 'Planificada' },
  { value: 'assigned', label: 'Asignada' },
  { value: 'loaded', label: 'Cargada' },
  { value: 'in_progress', label: 'En curso' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'with_incidents', label: 'Con incidencias' },
]

const styles: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700', planned: 'bg-sky-50 text-sky-700', assigned: 'bg-indigo-50 text-indigo-700', loaded: 'bg-violet-50 text-violet-700', in_progress: 'bg-amber-50 text-amber-700', completed: 'bg-emerald-50 text-emerald-700', cancelled: 'bg-rose-50 text-rose-700', with_incidents: 'bg-orange-50 text-orange-700',
}

export function getRouteStatusLabel(value?: string | null) {
  return routeStatusOptions.find((option) => option.value === value)?.label ?? value ?? '—'
}

export function RouteStatusBadge({ value }: { value?: string | null }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[value ?? ''] ?? 'bg-slate-100 text-slate-700'}`}>{getRouteStatusLabel(value)}</span>
}

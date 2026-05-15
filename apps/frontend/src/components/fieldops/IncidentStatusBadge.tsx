import { incidentStatusLabels } from './badgeLabels'
export function IncidentStatusBadge({ status }: { status?: string }) {
  const colors: Record<string, string> = { open: 'bg-rose-50 text-rose-700', in_review: 'bg-amber-50 text-amber-700', resolved: 'bg-emerald-50 text-emerald-700', cancelled: 'bg-slate-100 text-slate-600' }
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status ?? ''] ?? 'bg-slate-100 text-slate-600'}`}>{incidentStatusLabels[status ?? ''] ?? status ?? '—'}</span>
}

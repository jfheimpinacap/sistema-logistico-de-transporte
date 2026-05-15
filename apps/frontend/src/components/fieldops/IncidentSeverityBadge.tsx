import { incidentSeverityLabels } from './badgeLabels'
export function IncidentSeverityBadge({ severity }: { severity?: string }) {
  const colors: Record<string, string> = { low: 'bg-slate-100 text-slate-600', medium: 'bg-amber-50 text-amber-700', high: 'bg-orange-50 text-orange-700', critical: 'bg-rose-50 text-rose-700' }
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors[severity ?? ''] ?? 'bg-slate-100 text-slate-600'}`}>{incidentSeverityLabels[severity ?? ''] ?? severity ?? '—'}</span>
}

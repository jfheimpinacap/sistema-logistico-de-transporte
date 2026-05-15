import { proofStatusLabels } from './badgeLabels'
export function DeliveryProofStatusBadge({ status }: { status?: string }) {
  const colors: Record<string, string> = { pending_review: 'bg-amber-50 text-amber-700', accepted: 'bg-emerald-50 text-emerald-700', rejected: 'bg-rose-50 text-rose-700' }
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status ?? ''] ?? 'bg-slate-100 text-slate-600'}`}>{proofStatusLabels[status ?? ''] ?? status ?? '—'}</span>
}

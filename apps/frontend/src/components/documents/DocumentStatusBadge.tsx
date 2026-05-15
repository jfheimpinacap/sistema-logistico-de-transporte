import { getDocumentStatusLabel } from './labels'

const styles: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  issued: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-rose-50 text-rose-700',
  archived: 'bg-amber-50 text-amber-700',
}

export function DocumentStatusBadge({ status, label }: { status?: string | null; label?: string | null }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status ?? ''] ?? 'bg-slate-100 text-slate-600'}`}>{label ?? getDocumentStatusLabel(status)}</span>
}

import { getDocumentTypeLabel } from './labels'

export function DocumentTypeBadge({ type, label }: { type?: string | null; label?: string | null }) {
  return <span className="inline-flex rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">{label ?? getDocumentTypeLabel(type)}</span>
}

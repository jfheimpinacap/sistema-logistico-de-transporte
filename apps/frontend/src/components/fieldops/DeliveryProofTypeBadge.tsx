import { proofTypeLabels } from './badgeLabels'
export function DeliveryProofTypeBadge({ type }: { type?: string }) {
  return <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">{proofTypeLabels[type ?? ''] ?? type ?? '—'}</span>
}

import { incidentCategoryLabels } from './badgeLabels'
export function IncidentCategoryBadge({ category }: { category?: string }) {
  return <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{incidentCategoryLabels[category ?? ''] ?? category ?? '—'}</span>
}

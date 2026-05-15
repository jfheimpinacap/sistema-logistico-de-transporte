import type { KeyValueCount, ReportCountMap, ReportFilters } from '../../types/reports'
import { getReportLabel, toNumber } from '../../utils/reportLabels'

export function countMapToItems(map: ReportCountMap | undefined, labels: Record<string, string> = {}) {
  return Object.entries(map ?? {}).map(([key, value]) => ({ label: getReportLabel(key, labels), value: toNumber(value) }))
}

export function dateRowsToItems(rows: KeyValueCount[] | ReportCountMap | undefined) {
  if (!rows) return []
  if (Array.isArray(rows)) return rows.map((row) => ({ label: row.date ?? row.label ?? row.key ?? row.name ?? 'Sin fecha', value: toNumber(row.total ?? row.value ?? row.count) }))
  return Object.entries(rows).map(([key, value]) => ({ label: key, value: toNumber(value) }))
}

export const selectClass = 'mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm'
export const initialFilters: ReportFilters = { is_active: 'all' }

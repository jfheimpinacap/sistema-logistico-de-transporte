import { formatNumber, toNumber } from '../../utils/reportLabels'
import { EmptyReportState } from './EmptyReportState'
export function SimpleStatusGrid({ items }: { items: { label: string; value: number | null | undefined }[] }) {
  const visible = items.filter((item) => toNumber(item.value) > 0)
  if (!visible.length) return <EmptyReportState />
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{visible.map((item) => <div key={item.label} className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{formatNumber(item.value)}</p></div>)}</div>
}

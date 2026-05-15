import { formatNumber, toNumber } from '../../utils/reportLabels'
import { EmptyReportState } from './EmptyReportState'
export type SimpleBarItem = { label: string; value: number | null | undefined }
export function SimpleBarList({ items, total }: { items: SimpleBarItem[]; total?: number }) {
  const visible = items.filter((item) => toNumber(item.value) > 0)
  const max = Math.max(total ?? 0, ...visible.map((item) => toNumber(item.value)), 1)
  if (visible.length === 0) return <EmptyReportState />
  return <div className="space-y-3">{visible.map((item) => { const value = toNumber(item.value); return <div key={item.label}><div className="mb-1 flex justify-between gap-3 text-sm"><span className="font-medium text-slate-700">{item.label}</span><span className="font-bold text-slate-900">{formatNumber(value)}</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cyan-500" style={{ width: `${Math.max(4, (value / max) * 100)}%` }} /></div></div> })}</div>
}

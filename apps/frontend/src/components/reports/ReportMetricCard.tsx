import { formatNumber } from '../../utils/reportLabels'

type Props = { key?: string; title: string; value: string | number | null | undefined; subtitle?: string; status?: string; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }
const variants = { default: 'bg-white text-slate-900 border-slate-200', success: 'bg-emerald-50 text-emerald-900 border-emerald-100', warning: 'bg-amber-50 text-amber-900 border-amber-100', danger: 'bg-rose-50 text-rose-900 border-rose-100', info: 'bg-cyan-50 text-cyan-900 border-cyan-100' }
export function ReportMetricCard({ title, value, subtitle, status, variant = 'default' }: Props) {
  const displayValue = typeof value === 'number' || value === null || value === undefined ? formatNumber(value) : value
  return <article className={`rounded-2xl border p-5 shadow-sm ${variants[variant]}`}><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold opacity-70">{title}</p><p className="mt-2 text-3xl font-bold tracking-tight">{displayValue}</p>{subtitle ? <p className="mt-2 text-xs font-medium opacity-70">{subtitle}</p> : null}</div>{status ? <span className="rounded-full bg-white/70 px-2 py-1 text-xs font-semibold opacity-80">{status}</span> : null}</div></article>
}

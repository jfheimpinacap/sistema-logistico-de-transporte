import type { GeoSummaryMetric } from '../../types/geo'

const toneClasses: Record<NonNullable<GeoSummaryMetric['tone']>, string> = {
  slate: 'border-slate-200 bg-white text-slate-950',
  cyan: 'border-cyan-200 bg-cyan-50 text-cyan-950',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  amber: 'border-amber-200 bg-amber-50 text-amber-950',
  rose: 'border-rose-200 bg-rose-50 text-rose-950',
}

export function GeoMetricCard({ label, value, description, tone = 'slate' }: GeoSummaryMetric) {
  return (
    <article className={`rounded-2xl border p-5 shadow-sm ${toneClasses[tone]}`}>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
      {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
    </article>
  )
}

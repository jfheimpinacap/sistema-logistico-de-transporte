import type { GeoMapPoint } from '../../types/geo'

export function RouteMissingPointsList({ points }: { points: GeoMapPoint[] }) {
  if (points.length === 0) return <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">Todas las paradas consideradas tienen coordenadas utilizables.</div>
  return (
    <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-950">Paradas sin coordenadas</h3>
      <p className="mt-1 text-sm text-amber-700">Completa latitud/longitud en Maestros &gt; Direcciones.</p>
      <div className="mt-4 space-y-3">
        {points.map((point) => (
          <div key={String(point.id)} className="rounded-xl bg-amber-50 p-3 text-sm">
            <p className="font-semibold text-slate-900">#{point.sequence ?? '—'} · {point.label}</p>
            <p className="mt-1 text-slate-600">{String(point.metadata?.address_display ?? point.metadata?.address_label ?? 'Dirección no informada')}</p>
            <p className="mt-1 text-xs text-slate-500">{[point.metadata?.commune, point.metadata?.city].filter(Boolean).join(' · ') || 'Comuna/ciudad no informada'}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

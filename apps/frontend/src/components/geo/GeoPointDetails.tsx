import type { GeoMapPoint } from '../../types/geo'
import { normalizeCoordinateLabel } from '../../utils/geoProjection'

export function GeoPointDetails({ point }: { point?: GeoMapPoint | null }) {
  if (!point) return <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">Selecciona un punto del mapa para ver su detalle técnico.</div>
  const metadata = point.metadata ?? {}
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">Punto seleccionado</p>
      <h3 className="mt-2 break-words text-lg font-bold text-slate-950">{point.label}</h3>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-4"><dt className="text-slate-500">Secuencia</dt><dd className="font-semibold text-slate-900">{point.sequence ?? '—'}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-slate-500">Tipo</dt><dd className="font-semibold text-slate-900">{point.kind}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-slate-500">Estado</dt><dd className="font-semibold text-slate-900">{point.status ?? '—'}</dd></div>
        <div><dt className="text-slate-500">Coordenadas</dt><dd className="mt-1 font-mono text-xs text-slate-900">{normalizeCoordinateLabel(point.latitude, point.longitude)}</dd></div>
        {Object.entries(metadata).map(([key, value]) => value === null || value === undefined || value === '' ? null : (
          <div key={key}><dt className="text-slate-500">{key}</dt><dd className="mt-1 break-words text-slate-900">{String(value)}</dd></div>
        ))}
      </dl>
    </div>
  )
}

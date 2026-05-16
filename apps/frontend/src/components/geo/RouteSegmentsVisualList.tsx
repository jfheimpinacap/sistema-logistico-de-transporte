import type { GeoMapPoint, GeoMapSegment } from '../../types/geo'
import { normalizeCoordinateLabel } from '../../utils/geoProjection'

export function RouteSegmentsVisualList({ segments, points }: { segments: GeoMapSegment[]; points: GeoMapPoint[] }) {
  const pointMap = new Map(points.map((point) => [String(point.id), point]))
  if (segments.length === 0) return <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">No hay segmentos lineales disponibles: se requiere al menos dos paradas consecutivas con coordenadas válidas.</div>
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-slate-950">Segmentos lineales</h3>
      <div className="mt-4 max-h-[36rem] space-y-3 overflow-y-auto pr-1">
        {segments.map((segment, index) => {
          const from = pointMap.get(String(segment.fromPointId))
          const to = pointMap.get(String(segment.toPointId))
          return (
            <div key={`${segment.fromPointId}-${segment.toPointId}-${index}`} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold text-slate-900">#{segment.fromSequence ?? from?.sequence ?? '—'} → #{segment.toSequence ?? to?.sequence ?? '—'}</p>
                <p className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800">{segment.distance_km ?? '—'} km · {segment.estimated_duration_minutes ?? '—'} min</p>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                <p className="break-words"><span className="font-semibold text-slate-800">Origen:</span> {from?.label ?? '—'}<br /><span className="font-mono">{normalizeCoordinateLabel(from?.latitude, from?.longitude)}</span></p>
                <p className="break-words"><span className="font-semibold text-slate-800">Destino:</span> {to?.label ?? '—'}<br /><span className="font-mono">{normalizeCoordinateLabel(to?.latitude, to?.longitude)}</span></p>
              </div>
              {segment.warning ? <p className="mt-2 text-xs text-amber-700">{segment.warning}</p> : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

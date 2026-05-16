import type { GeoCoordinate, RouteDistanceSegment } from '../../types/geo'

type Props = {
  segments: RouteDistanceSegment[]
}

function stopLabel(segment: RouteDistanceSegment, side: 'from' | 'to') {
  if (side === 'from') return segment.from_label ?? segment.from_stop?.address_label ?? segment.from_stop?.address_display ?? `Parada ${segment.from_sequence ?? segment.from_stop?.sequence ?? '—'}`
  return segment.to_label ?? segment.to_stop?.address_label ?? segment.to_stop?.address_display ?? `Parada ${segment.to_sequence ?? segment.to_stop?.sequence ?? '—'}`
}

function coordinates(segment: RouteDistanceSegment, side: 'from' | 'to'): GeoCoordinate | null | undefined {
  return side === 'from' ? segment.from_coordinates ?? segment.from_stop?.coordinates : segment.to_coordinates ?? segment.to_stop?.coordinates
}

function formatCoordinates(value: GeoCoordinate | null | undefined) {
  if (value?.latitude === null || value?.latitude === undefined || value?.latitude === '' || value?.longitude === null || value?.longitude === undefined || value?.longitude === '') return '—'
  return `${value.latitude}, ${value.longitude}`
}

export function RouteSegmentsTable({ segments }: Props) {
  if (segments.length === 0) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">La ruta no tiene segmentos consecutivos para mostrar.</div>
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Desde parada</th>
              <th className="px-4 py-3">Hasta parada</th>
              <th className="px-4 py-3">Distancia km</th>
              <th className="px-4 py-3">Duración estimada</th>
              <th className="px-4 py-3">Coordenadas origen</th>
              <th className="px-4 py-3">Coordenadas destino</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {segments.map((segment, index) => (
              <tr key={`${segment.from_stop_id ?? segment.from_stop?.stop_id ?? index}-${segment.to_stop_id ?? segment.to_stop?.stop_id ?? index}`} className="align-top">
                <td className="px-4 py-3 font-medium text-slate-900">{stopLabel(segment, 'from')}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{stopLabel(segment, 'to')}</td>
                <td className="px-4 py-3 text-slate-600">{segment.distance_km ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{segment.estimated_duration_minutes !== null && segment.estimated_duration_minutes !== undefined ? `${segment.estimated_duration_minutes} min` : '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{formatCoordinates(coordinates(segment, 'from'))}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{formatCoordinates(coordinates(segment, 'to'))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

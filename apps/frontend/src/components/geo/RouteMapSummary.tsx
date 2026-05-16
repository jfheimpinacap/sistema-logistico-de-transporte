import type { RouteMapViewData } from '../../types/geo'
import { GeoMetricCard } from './GeoMetricCard'

export function RouteMapSummary({ data }: { data: RouteMapViewData | null }) {
  if (!data) return <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">Selecciona una ruta y presiona “Ver mapa esquemático”.</div>
  const totalStops = data.stops_total ?? data.points.length + data.missing_points.length
  const stopsWithCoordinates = data.stops_with_coordinates ?? data.points.length
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <GeoMetricCard label="Ruta" value={data.route_code ?? '—'} description="Código de ruta" />
        <GeoMetricCard label="Paradas" value={totalStops} description={`${stopsWithCoordinates} con coordenadas válidas`} tone="cyan" />
        <GeoMetricCard label="Sin coordenadas" value={data.stops_missing_coordinates ?? data.missing_points.length} tone={data.missing_points.length > 0 ? 'amber' : 'emerald'} />
        <GeoMetricCard label="Distancia" value={`${data.distance_km ?? 0} km`} description={`${data.estimated_duration_minutes ?? 0} min`} tone="emerald" />
      </div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-bold">Método: Haversine lineal</p>
        <p className="mt-1">La visualización proyecta coordenadas en SVG y une paradas por secuencia. No es mapa de calles y no considera tráfico, sentido de tránsito, restricciones ni peajes.</p>
        {data.warnings.length > 0 ? <div className="mt-2 space-y-1">{data.warnings.map((warning) => <p key={warning}>• {warning}</p>)}</div> : null}
      </div>
    </div>
  )
}

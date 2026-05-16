import { useEffect, useMemo, useState } from 'react'
import { GeoMapLegend } from '../../components/geo/GeoMapLegend'
import { GeoPointDetails } from '../../components/geo/GeoPointDetails'
import { GeoSchematicMap } from '../../components/geo/GeoSchematicMap'
import { GeoWarningBanner } from '../../components/geo/GeoWarningBanner'
import { RouteMapSummary } from '../../components/geo/RouteMapSummary'
import { RouteMissingPointsList } from '../../components/geo/RouteMissingPointsList'
import { RouteSegmentsVisualList } from '../../components/geo/RouteSegmentsVisualList'
import { useAuth } from '../../hooks/useAuth'
import { geoService, getReadableGeoError } from '../../services/geoService'
import { getReadableRoutingError, listRoutes } from '../../services/routingService'
import type { GeoMapPoint, GeoMapSegment, RouteDistanceSegment, RouteDistanceStopPayload, RouteDistanceSummary, RouteMapViewData } from '../../types/geo'
import type { Route, RoutingId } from '../../types/routing'
import { buildGeoBounds, hasUsableCoordinates } from '../../utils/geoProjection'

function routeLabel(route: Route) {
  return route.route_name_or_code ?? `${route.route_code} — ${route.name}`
}

function pointId(stop: RouteDistanceStopPayload | null | undefined, fallback: string) {
  return stop?.stop_id ?? fallback
}

function stopLabel(stop: RouteDistanceStopPayload | null | undefined) {
  return stop?.address_label ?? stop?.address_display ?? `Parada ${stop?.sequence ?? '—'}`
}

function pointFromStop(stop: RouteDistanceStopPayload | null | undefined, fallback: string): GeoMapPoint {
  const coordinates = stop?.coordinates
  return {
    id: pointId(stop, fallback),
    label: stopLabel(stop),
    latitude: coordinates?.latitude,
    longitude: coordinates?.longitude,
    sequence: stop?.sequence,
    kind: hasUsableCoordinates({ latitude: coordinates?.latitude, longitude: coordinates?.longitude }) ? 'route_stop' : 'missing',
    metadata: {
      stop_id: stop?.stop_id,
      address_id: stop?.address_id,
      address_label: stop?.address_label,
      address_display: stop?.address_display,
    },
  }
}

function collectMapData(summary: RouteDistanceSummary): RouteMapViewData {
  const pointsById = new Map<string, GeoMapPoint>()
  const missingById = new Map<string, GeoMapPoint>()
  const segments: GeoMapSegment[] = []

  ;(summary.stops ?? []).forEach((stop, index) => {
    const point = pointFromStop(stop, `stop-${index}`)
    if (hasUsableCoordinates(point)) pointsById.set(String(point.id), { ...point, kind: 'route_stop' })
    else missingById.set(String(point.id), { ...point, kind: 'missing' })
  })

  ;(summary.segments ?? []).forEach((segment: RouteDistanceSegment, index) => {
    const fromPoint = pointFromStop(segment.from_stop, `from-${index}`)
    const toPoint = pointFromStop(segment.to_stop, `to-${index}`)

    ;[fromPoint, toPoint].forEach((point) => {
      if (hasUsableCoordinates(point)) pointsById.set(String(point.id), { ...point, kind: 'route_stop' })
      else missingById.set(String(point.id), { ...point, kind: 'missing' })
    })

    segments.push({
      fromPointId: fromPoint.id,
      toPointId: toPoint.id,
      fromSequence: segment.from_sequence ?? segment.from_stop?.sequence,
      toSequence: segment.to_sequence ?? segment.to_stop?.sequence,
      distance_km: segment.distance_km,
      estimated_duration_minutes: segment.estimated_duration_minutes,
      warning: segment.warning,
    })
  })

  const missingCount = Number(summary.stops_missing_coordinates ?? 0)
  while (missingById.size < missingCount) {
    const index = missingById.size + 1
    missingById.set(`missing-${index}`, {
      id: `missing-${index}`,
      label: `Parada sin coordenadas ${index}`,
      kind: 'missing',
      metadata: { address_display: 'No incluida en segmentos consecutivos del resumen.' },
    })
  }

  const points = Array.from(pointsById.values()).sort((a, b) => Number(a.sequence ?? 0) - Number(b.sequence ?? 0))
  const missingPoints = Array.from(missingById.values()).sort((a, b) => Number(a.sequence ?? 0) - Number(b.sequence ?? 0))
  return {
    route_id: summary.route_id,
    route_code: summary.route_code,
    points,
    missing_points: missingPoints,
    stops_total: summary.stops_total,
    stops_with_coordinates: summary.stops_with_coordinates,
    stops_missing_coordinates: summary.stops_missing_coordinates,
    segments: segments.filter((segment) => pointsById.has(String(segment.fromPointId)) && pointsById.has(String(segment.toPointId))),
    bounds: buildGeoBounds(points),
    distance_km: summary.distance_km,
    estimated_duration_minutes: summary.estimated_duration_minutes,
    warnings: summary.warnings ?? [],
  }
}

export function GeoMapPage() {
  const { accessToken } = useAuth()
  const [routes, setRoutes] = useState<Route[]>([])
  const [selectedRouteId, setSelectedRouteId] = useState<RoutingId | ''>('')
  const [averageSpeedKmh, setAverageSpeedKmh] = useState('35')
  const [mapData, setMapData] = useState<RouteMapViewData | null>(null)
  const [selectedPointId, setSelectedPointId] = useState<RoutingId | null>(null)
  const [routesLoading, setRoutesLoading] = useState(false)
  const [mapLoading, setMapLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showLabels, setShowLabels] = useState(true)

  useEffect(() => {
    if (!accessToken) return
    async function loadRoutes() {
      setRoutesLoading(true)
      try {
        const data = await listRoutes({ token: accessToken!, is_active: 'true' })
        setRoutes(data)
        setSelectedRouteId((current) => current || data[0]?.id || '')
        setError(null)
      } catch (err) {
        setError(getReadableRoutingError(err))
      } finally {
        setRoutesLoading(false)
      }
    }
    void loadRoutes()
  }, [accessToken])

  const selectedRoute = useMemo(() => routes.find((route) => String(route.id) === String(selectedRouteId)), [routes, selectedRouteId])
  const selectedPoint = useMemo(() => mapData?.points.find((point) => String(point.id) === String(selectedPointId)) ?? null, [mapData, selectedPointId])

  function speedValue() {
    const speed = Number(averageSpeedKmh)
    if (!Number.isFinite(speed) || speed <= 0) return null
    return speed
  }

  async function loadMapData() {
    const speed = speedValue()
    if (!selectedRouteId) {
      setError('Selecciona una ruta para ver el mapa esquemático.')
      return
    }
    if (!speed) {
      setError('La velocidad promedio debe ser un número mayor que cero.')
      return
    }
    if (!accessToken) return
    setMapLoading(true)
    try {
      const summary = await geoService.getRouteDistanceSummary(selectedRouteId, { token: accessToken, average_speed_kmh: speed })
      const nextMapData = collectMapData(summary)
      setMapData(nextMapData)
      setSelectedPointId(nextMapData.points[0]?.id ?? null)
      setError(null)
      setSuccess(null)
    } catch (err) {
      setError(getReadableGeoError(err))
      setMapData(null)
    } finally {
      setMapLoading(false)
    }
  }

  async function handleUpdateEstimates() {
    const speed = speedValue()
    if (!selectedRouteId) {
      setError('Selecciona una ruta antes de actualizar estimaciones.')
      return
    }
    if (!speed) {
      setError('La velocidad promedio debe ser un número mayor que cero.')
      return
    }
    if (!accessToken) return
    setUpdating(true)
    try {
      const response = await geoService.updateRouteEstimates(selectedRouteId, { average_speed_kmh: speed }, accessToken)
      const nextMapData = response.distance_summary ? collectMapData(response.distance_summary) : null
      setMapData(nextMapData)
      setSelectedPointId(nextMapData?.points[0]?.id ?? null)
      setSuccess(`Estimaciones actualizadas para la ruta ${response.route_code ?? selectedRoute?.route_code ?? selectedRouteId}.`)
      setError(null)
    } catch (err) {
      setError(getReadableGeoError(err))
      setSuccess(null)
    } finally {
      setUpdating(false)
    }
  }

  const hasIncompleteCoordinates = (mapData?.missing_points.length ?? 0) > 0
  const noEnoughCoordinates = mapData !== null && mapData.points.length < 2
  const hasNoStops = mapData !== null && Number(mapData.stops_total ?? mapData.points.length + mapData.missing_points.length) === 0

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">⌖ Prompt 023 — QA visual del mapa esquemático</span>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Mapa esquemático interno</h2>
        <p className="mt-3 max-w-3xl text-slate-600">Visualización interna basada en coordenadas y distancia lineal estimada. No es mapa de calles y no usa servicios externos.</p>
      </section>

      <GeoWarningBanner />

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_180px]">
          <label className="text-sm font-medium text-slate-700">
            Ruta
            <select value={String(selectedRouteId)} onChange={(event: { target: { value: string } }) => { setSelectedRouteId(event.target.value); setMapData(null); setSelectedPointId(null); setSuccess(null) }} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100" disabled={routesLoading || routes.length === 0}>
              {routes.length === 0 ? <option value="">Sin rutas disponibles</option> : null}
              {routes.map((route) => <option key={route.id} value={String(route.id)}>{routeLabel(route)}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Velocidad promedio km/h
            <input type="number" min="1" step="1" value={averageSpeedKmh} onChange={(event: { target: { value: string } }) => setAverageSpeedKmh(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100" />
          </label>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <button type="button" onClick={loadMapData} disabled={mapLoading || routesLoading || !selectedRouteId} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{mapLoading ? 'Dibujando...' : 'Ver mapa esquemático'}</button>
          <button type="button" onClick={handleUpdateEstimates} disabled={updating || routesLoading || !selectedRouteId} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">{updating ? 'Actualizando...' : 'Actualizar estimaciones de ruta'}</button>
          <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={showLabels} onChange={(event: { target: { checked: boolean } }) => setShowLabels(event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-cyan-600" />
            Mostrar etiquetas
          </label>
        </div>
        {routesLoading ? <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">Cargando rutas...</p> : null}
        {!routesLoading && routes.length === 0 ? <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">No hay rutas activas para seleccionar.</p> : null}
        {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        {success ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}
      </section>

      {mapData ? (
        <section className="space-y-5">
          {hasIncompleteCoordinates ? <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">La ruta tiene coordenadas incompletas o inválidas. Se dibujan solo los puntos utilizables y se listan las paradas pendientes. Completa coordenadas en Maestros &gt; Direcciones.</p> : null}
          {hasNoStops ? <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Esta ruta aún no tiene paradas para visualizar.</p> : null}
          {!hasNoStops && noEnoughCoordinates ? <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">No hay segmentos porque se requiere al menos dos paradas con coordenadas válidas.</p> : null}
          <RouteMapSummary data={mapData} />
          <GeoMapLegend hasMissingPoints={hasIncompleteCoordinates} />
          <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
            {hasNoStops ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">Esta ruta aún no tiene paradas para visualizar.</div>
            ) : (
              <GeoSchematicMap points={mapData.points} segments={mapData.segments} selectedPointId={selectedPointId} onSelectPoint={(point) => setSelectedPointId(point.id)} showLabels={showLabels} />
            )}
            <GeoPointDetails point={selectedPoint} />
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <RouteSegmentsVisualList points={mapData.points} segments={mapData.segments} />
            <RouteMissingPointsList points={mapData.missing_points} />
          </div>
        </section>
      ) : !mapLoading ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">Selecciona una ruta y presiona “Ver mapa esquemático” para visualizar paradas, segmentos lineales y advertencias.</section>
      ) : null}
    </div>
  )
}

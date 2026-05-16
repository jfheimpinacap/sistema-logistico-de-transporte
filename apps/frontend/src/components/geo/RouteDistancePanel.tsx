import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { geoService, getReadableGeoError } from '../../services/geoService'
import { getReadableRoutingError, listRoutes } from '../../services/routingService'
import type { RouteDistanceSummary } from '../../types/geo'
import type { Route, RoutingId } from '../../types/routing'
import { GeoMetricCard } from './GeoMetricCard'
import { MissingCoordinatesNotice } from './MissingCoordinatesNotice'
import { RouteSegmentsTable } from './RouteSegmentsTable'

function routeLabel(route: Route) {
  return route.route_name_or_code ?? `${route.route_code} — ${route.name}`
}

export function RouteDistancePanel() {
  const { accessToken } = useAuth()
  const [routes, setRoutes] = useState<Route[]>([])
  const [selectedRouteId, setSelectedRouteId] = useState<RoutingId | ''>('')
  const [averageSpeedKmh, setAverageSpeedKmh] = useState('35')
  const [summary, setSummary] = useState<RouteDistanceSummary | null>(null)
  const [routesLoading, setRoutesLoading] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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

  function speedValue() {
    const speed = Number(averageSpeedKmh)
    if (!Number.isFinite(speed) || speed <= 0) return null
    return speed
  }

  async function handleSummary() {
    const speed = speedValue()
    if (!selectedRouteId) {
      setError('Selecciona una ruta para revisar su resumen de distancia.')
      return
    }
    if (!speed) {
      setError('La velocidad promedio debe ser un número mayor que cero.')
      return
    }
    if (!accessToken) return
    setSummaryLoading(true)
    try {
      setSummary(await geoService.getRouteDistanceSummary(selectedRouteId, { token: accessToken, average_speed_kmh: speed }))
      setError(null)
      setSuccess(null)
    } catch (err) {
      setError(getReadableGeoError(err))
    } finally {
      setSummaryLoading(false)
    }
  }

  async function handleUpdate() {
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
      setSummary(response.distance_summary ?? null)
      setSuccess(`Estimaciones actualizadas para la ruta ${response.route_code ?? selectedRoute?.route_code ?? selectedRouteId}.`)
      setError(null)
    } catch (err) {
      setError(getReadableGeoError(err))
      setSuccess(null)
    } finally {
      setUpdating(false)
    }
  }

  const segments = summary?.segments ?? []

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-600">Rutas</p>
        <h3 className="mt-2 text-xl font-bold text-slate-950">Resumen de distancia de ruta</h3>
        <p className="mt-1 text-sm text-slate-500">Selecciona una ruta para ver distancia total, duración estimada y segmentos entre paradas.</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_180px]">
        <label className="text-sm font-medium text-slate-700">
          Ruta
          <select value={String(selectedRouteId)} onChange={(event: { target: { value: string } }) => { setSelectedRouteId(event.target.value); setSummary(null); setSuccess(null) }} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100" disabled={routesLoading || routes.length === 0}>
            {routes.length === 0 ? <option value="">Sin rutas disponibles</option> : null}
            {routes.map((route) => <option key={route.id} value={String(route.id)}>{routeLabel(route)}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Velocidad km/h
          <input value={averageSpeedKmh} onChange={(event: { target: { value: string } }) => setAverageSpeedKmh(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100" />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={handleSummary} disabled={summaryLoading || routesLoading || !selectedRouteId} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{summaryLoading ? 'Consultando...' : 'Ver resumen'}</button>
        <button type="button" onClick={handleUpdate} disabled={updating || routesLoading || !selectedRouteId} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">{updating ? 'Actualizando...' : 'Actualizar estimaciones de ruta'}</button>
      </div>

      {routesLoading ? <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">Cargando rutas...</p> : null}
      {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      {success ? <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}

      {summary ? (
        <div className="mt-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <GeoMetricCard label="Paradas" value={summary.stops_total ?? 0} description="Total activas en la ruta" />
            <GeoMetricCard label="Con coordenadas" value={summary.stops_with_coordinates ?? 0} tone="emerald" />
            <GeoMetricCard label="Distancia" value={`${summary.distance_km ?? 0} km`} tone="cyan" />
            <GeoMetricCard label="Duración" value={`${summary.estimated_duration_minutes ?? 0} min`} tone="amber" />
          </div>
          <MissingCoordinatesNotice missingCount={summary.stops_missing_coordinates ?? 0} />
          {summary.warnings?.length ? <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{summary.warnings.map((warning) => <p key={warning}>• {warning}</p>)}</div> : null}
          <div>
            <h4 className="text-base font-bold text-slate-950">Segmentos entre paradas</h4>
            <div className="mt-3"><RouteSegmentsTable segments={segments} /></div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

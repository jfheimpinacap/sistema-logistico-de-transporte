import { useEffect, useMemo, useState } from 'react'
import { DriverRouteCard } from '../../components/driver/DriverRouteCard'
import { useAuth } from '../../hooks/useAuth'
import { useAppRouter } from '../../routes/AppRoutes'
import { getReadableDriverError, listDriverRoutes, listMyDriverRoutes } from '../../services/driverService'
import type { Route } from '../../types/routing'
import { DriverRoutePanel } from './DriverRoutePanel'

const SELECTED_ROUTE_KEY = 'slt_driver_selected_route_id'

const statusOptions = [
  { value: 'all', label: 'Activas disponibles' },
  { value: 'planned', label: 'Planificadas' },
  { value: 'assigned', label: 'Asignadas' },
  { value: 'loaded', label: 'Cargadas' },
  { value: 'in_progress', label: 'En curso' },
]

const driverTypeLabels: Record<string, string> = {
  internal: 'Interno',
  external: 'Externo',
}

const locationSourceLabels: Record<string, string> = {
  mobile_web: 'Ubicación puntual desde web móvil',
  mobile_app: 'Ubicación puntual desde app móvil futura',
  vehicle_gps: 'GPS de vehículo configurado',
  manual: 'Registro manual puntual',
  unknown: 'Fuente no definida',
}

export function DriverHomePage() {
  const { accessToken, logout, user } = useAuth()
  const { navigate } = useAppRouter()
  const [routes, setRoutes] = useState<Route[]>([])
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [routeMessage, setRouteMessage] = useState<string | null>(null)

  const driverProfile = user?.driver_profile ?? null
  const hasDriverProfile = Boolean(driverProfile)

  async function loadRoutes() {
    if (!accessToken) return
    setIsLoading(true)
    setError(null)
    setRouteMessage(null)
    try {
      const data = hasDriverProfile
        ? await listMyDriverRoutes({ token: accessToken, search, status })
        : { results: await listDriverRoutes({ token: accessToken, search, status }), message: null }
      setRoutes(data.results)
      setRouteMessage(data.message ?? null)
      const storedRouteId = localStorage.getItem(SELECTED_ROUTE_KEY)
      if (storedRouteId && !selectedRoute) {
        const storedRoute = data.results.find((route) => String(route.id) === storedRouteId)
        if (storedRoute) setSelectedRoute(storedRoute)
      }
    } catch (err) {
      setError(getReadableDriverError(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const handle = window.setTimeout(() => void loadRoutes(), 250)
    return () => window.clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, search, status, hasDriverProfile])

  const activeRoutes = useMemo(() => routes.filter((route) => ['assigned', 'loaded', 'in_progress', 'planned'].includes(String(route.status))), [routes])

  function handleSelectRoute(route: Route) {
    localStorage.setItem(SELECTED_ROUTE_KEY, String(route.id))
    setSelectedRoute(route)
  }

  function handleBack() {
    localStorage.removeItem(SELECTED_ROUTE_KEY)
    setSelectedRoute(null)
    void loadRoutes()
  }

  if (selectedRoute && accessToken) {
    return <DriverRoutePanel token={accessToken} route={selectedRoute} onBack={handleBack} />
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">Prompt 025</span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Modo conductor</h2>
            <p className="mt-2 max-w-2xl text-slate-600">Selecciona una ruta para operar desde navegador móvil con tarjetas, botones grandes, evidencia, incidencias y ubicación puntual. No se promete GPS continuo.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => navigate('/operations/routes')} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">Administrar rutas</button>
            <button type="button" onClick={logout} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200">Salir</button>
          </div>
        </div>
      </section>

      {driverProfile ? (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Perfil conductor</p>
              <h3 className="mt-1 text-2xl font-black text-emerald-950">{driverProfile.first_name} {driverProfile.last_name}</h3>
              <p className="mt-2 text-sm font-medium text-emerald-800">Tus rutas se filtran según el conductor asociado a tu usuario.</p>
            </div>
            <div className="grid gap-2 text-sm text-emerald-950 sm:min-w-72">
              <span><strong>Tipo:</strong> {driverTypeLabels[driverProfile.driver_type] ?? driverProfile.driver_type}</span>
              <span><strong>Fuente ubicación:</strong> {locationSourceLabels[driverProfile.location_source] ?? driverProfile.location_source}</span>
              <span><strong>Estado:</strong> {driverProfile.status}</span>
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm">
          <h3 className="text-lg font-black">Modo demo/supervisor</h3>
          <p className="mt-1 text-sm font-medium">Este usuario no tiene conductor asociado. Se usa modo demo/supervisor con rutas disponibles.</p>
          <p className="mt-2 text-xs">Para probar “Mis rutas”: usuario conductor demo <strong>conductor</strong> / password <strong>conductor1234</strong>.</p>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
          <label className="block text-sm font-bold text-slate-700">Buscar por código o nombre
            <input value={search} onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setSearch(event.target.value)} placeholder="Ej: RUTA-DEMO" className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-slate-400" />
          </label>
          <label className="block text-sm font-bold text-slate-700">Estado
            <select value={status} onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setStatus(event.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-slate-400">
              {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>
      </section>

      {routeMessage ? <p className="rounded-2xl bg-slate-100 p-4 text-sm font-medium text-slate-700">{routeMessage}</p> : null}
      {error ? <p className="rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</p> : null}
      {isLoading ? <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Cargando {hasDriverProfile ? 'mis rutas' : 'rutas disponibles'}...</div> : null}

      {!isLoading && activeRoutes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <h3 className="text-xl font-black text-slate-950">{hasDriverProfile ? 'No tienes rutas asignadas en este momento.' : 'No hay rutas disponibles para operar.'}</h3>
          <p className="mt-2 text-slate-600">{hasDriverProfile ? 'Cuando operaciones asigne rutas al conductor vinculado, aparecerán como “Mis rutas”.' : 'Crea o asigna rutas desde Operación logística > Rutas. Para el MVP se muestran rutas planificadas, asignadas, cargadas o en curso.'}</p>
          {!hasDriverProfile ? <button type="button" onClick={() => navigate('/operations/routes')} className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800">Ir a Rutas</button> : null}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-950">{hasDriverProfile ? 'Mis rutas' : 'Rutas disponibles'}</h3>
        <span className="text-sm font-bold text-slate-500">{activeRoutes.length} ruta(s)</span>
      </div>
      <section className="grid gap-4 md:grid-cols-2">
        {activeRoutes.map((route) => <DriverRouteCard key={route.id} route={route} onSelect={handleSelectRoute} />)}
      </section>
    </div>
  )
}

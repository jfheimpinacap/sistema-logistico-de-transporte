import { useEffect, useMemo, useState } from 'react'
import { DriverRouteCard } from '../../components/driver/DriverRouteCard'
import { useAuth } from '../../hooks/useAuth'
import { useAppRouter } from '../../routes/AppRoutes'
import { getReadableDriverError, listDriverRoutes } from '../../services/driverService'
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

export function DriverHomePage() {
  const { accessToken, logout } = useAuth()
  const { navigate } = useAppRouter()
  const [routes, setRoutes] = useState<Route[]>([])
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadRoutes() {
    if (!accessToken) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await listDriverRoutes({ token: accessToken, search, status })
      setRoutes(data)
      const storedRouteId = localStorage.getItem(SELECTED_ROUTE_KEY)
      if (storedRouteId && !selectedRoute) {
        const storedRoute = data.find((route) => String(route.id) === storedRouteId)
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
  }, [accessToken, search, status])

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
            <span className="inline-flex rounded-full bg-slate-950 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">Prompt 012</span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Modo conductor</h2>
            <p className="mt-2 max-w-2xl text-slate-600">Selecciona una ruta para comenzar la operación desde teléfono o pantalla pequeña.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => navigate('/operations/routes')} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">Administrar rutas</button>
            <button type="button" onClick={logout} className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200">Salir</button>
          </div>
        </div>
      </section>

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

      {error ? <p className="rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</p> : null}
      {isLoading ? <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Cargando rutas disponibles...</div> : null}

      {!isLoading && activeRoutes.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <h3 className="text-xl font-black text-slate-950">No hay rutas disponibles para conductor</h3>
          <p className="mt-2 text-slate-600">Primero deben crearse y asignarse rutas en Operación logística &gt; Rutas. Para el MVP se muestran rutas planificadas, asignadas, cargadas o en curso.</p>
          <button type="button" onClick={() => navigate('/operations/routes')} className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800">Ir a Rutas</button>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        {activeRoutes.map((route) => <DriverRouteCard key={route.id} route={route} onSelect={handleSelectRoute} />)}
      </section>
    </div>
  )
}

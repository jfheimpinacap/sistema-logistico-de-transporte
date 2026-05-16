import type { Route } from '../../types/routing'
import { labelFor, routeStatusLabels, statusPillClass } from './driverLabels'

type DriverRouteCardProps = {
  key?: string | number
  route: Route
  onSelect: (route: Route) => void
}

export function DriverRouteCard({ route, onSelect }: DriverRouteCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Ruta</p>
          <h3 className="mt-1 text-2xl font-black text-slate-950">{route.route_code}</h3>
          <p className="mt-1 text-sm text-slate-600">{route.name || 'Sin nombre operativo'}</p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusPillClass(String(route.status))}`}>{labelFor(routeStatusLabels, String(route.status))}</span>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-3"><dt className="font-semibold text-slate-500">Fecha</dt><dd className="mt-1 font-bold text-slate-900">{route.route_date || 'Sin fecha'}</dd></div>
        <div className="rounded-2xl bg-slate-50 p-3"><dt className="font-semibold text-slate-500">Conductor</dt><dd className="mt-1 font-bold text-slate-900">{route.driver_name || 'Sin asignar'}</dd></div>
        <div className="rounded-2xl bg-slate-50 p-3"><dt className="font-semibold text-slate-500">Vehículo</dt><dd className="mt-1 font-bold text-slate-900">{route.vehicle_plate || 'Sin vehículo'}</dd></div>
        <div className="rounded-2xl bg-slate-50 p-3"><dt className="font-semibold text-slate-500">Encomiendas</dt><dd className="mt-1 font-bold text-slate-900">{route.total_shipments ?? 0}</dd></div>
        <div className="rounded-2xl bg-slate-50 p-3"><dt className="font-semibold text-slate-500">Bultos</dt><dd className="mt-1 font-bold text-slate-900">{route.total_packages ?? 0}</dd></div>
        <div className="rounded-2xl bg-slate-50 p-3"><dt className="font-semibold text-slate-500">Distancia</dt><dd className="mt-1 font-bold text-slate-900">{route.estimated_distance_km ? `${route.estimated_distance_km} km` : 'Sin estimar'}</dd></div>
      </dl>

      <button type="button" onClick={() => onSelect(route)} className="mt-5 min-h-12 w-full rounded-2xl bg-slate-950 px-5 py-3 text-base font-black text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400">
        Operar ruta
      </button>
    </article>
  )
}

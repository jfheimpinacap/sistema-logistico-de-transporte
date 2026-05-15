import type { Route } from '../../types/routing'
import { labelFor, routeStatusLabels, statusPillClass } from './driverLabels'

type DriverRouteCardProps = {
  key?: string | number
  route: Route
  onSelect: (route: Route) => void
}

export function DriverRouteCard({ route, onSelect }: DriverRouteCardProps) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Ruta</p>
          <h3 className="mt-1 text-xl font-bold text-slate-950">{route.route_code}</h3>
          <p className="mt-1 text-sm text-slate-600">{route.name || 'Sin nombre operativo'}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusPillClass(String(route.status))}`}>{labelFor(routeStatusLabels, String(route.status))}</span>
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-3"><dt className="font-semibold text-slate-500">Fecha</dt><dd className="mt-1 text-slate-900">{route.route_date || 'Sin fecha'}</dd></div>
        <div className="rounded-2xl bg-slate-50 p-3"><dt className="font-semibold text-slate-500">Conductor</dt><dd className="mt-1 text-slate-900">{route.driver_name || 'Sin asignar'}</dd></div>
        <div className="rounded-2xl bg-slate-50 p-3"><dt className="font-semibold text-slate-500">Vehículo</dt><dd className="mt-1 text-slate-900">{route.vehicle_plate || 'Sin vehículo'}</dd></div>
        <div className="rounded-2xl bg-slate-50 p-3"><dt className="font-semibold text-slate-500">Carga</dt><dd className="mt-1 text-slate-900">{route.total_shipments ?? 0} encomiendas</dd></div>
      </dl>

      <button type="button" onClick={() => onSelect(route)} className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-3 text-base font-bold text-white shadow-sm transition hover:bg-slate-800">
        Seleccionar ruta
      </button>
    </article>
  )
}

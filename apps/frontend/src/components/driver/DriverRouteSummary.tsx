import type { Route } from '../../types/routing'
import { labelFor, routeStatusLabels, statusPillClass } from './driverLabels'

type DriverRouteSummaryProps = {
  route: Route
}

function formatDuration(minutes?: number | null) {
  if (!minutes) return 'Sin dato'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} h ${rest} min` : `${hours} h`
}

export function DriverRouteSummary({ route }: DriverRouteSummaryProps) {
  const metrics = [
    { label: 'Encomiendas', value: route.total_shipments ?? 0 },
    { label: 'Bultos', value: route.total_packages ?? 0 },
    { label: 'Peso', value: `${route.total_weight_kg ?? '0'} kg` },
    { label: 'Volumen', value: `${route.total_volume_m3 ?? '0'} m³` },
    { label: 'Distancia est.', value: route.estimated_distance_km ? `${route.estimated_distance_km} km` : 'Sin dato' },
    { label: 'Duración est.', value: formatDuration(route.estimated_duration_minutes) },
  ]

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Resumen de ruta</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">{route.route_code}</h2>
          <p className="mt-1 text-sm text-slate-600">{route.name || 'Ruta operativa'}</p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusPillClass(String(route.status))}`}>{labelFor(routeStatusLabels, String(route.status))}</span>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-slate-50 p-3"><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Fecha</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{route.route_date || 'Sin fecha'}</dd></div>
        <div className="rounded-2xl bg-slate-50 p-3"><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Conductor</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{route.driver_name || 'Sin conductor'}</dd></div>
        <div className="rounded-2xl bg-slate-50 p-3"><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Vehículo</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{route.vehicle_plate || 'Sin vehículo'}</dd></div>
        <div className="rounded-2xl bg-slate-50 p-3"><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">Bodega origen</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{route.origin_warehouse_name || 'Sin bodega'}</dd></div>
      </dl>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-100 p-3 text-center">
            <p className="text-lg font-black text-slate-950">{metric.value}</p>
            <p className="text-xs font-semibold text-slate-500">{metric.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

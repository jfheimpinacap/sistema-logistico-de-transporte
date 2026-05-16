import type { RouteStop } from '../../types/routing'
import { labelFor, statusPillClass, stopStatusLabels, stopTypeLabels } from './driverLabels'

type DriverStopDetailProps = {
  stop: RouteStop | null
}

export function DriverStopDetail({ stop }: DriverStopDetailProps) {
  if (!stop) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">Selecciona una parada para enfocar sus encomiendas, evidencia e incidencias.</div>
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Parada seleccionada</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">#{stop.sequence} · {labelFor(stopTypeLabels, String(stop.stop_type))}</h3>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusPillClass(String(stop.status))}`}>{labelFor(stopStatusLabels, String(stop.status))}</span>
      </div>
      <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-3"><dt className="font-bold text-slate-500">Dirección</dt><dd className="mt-1 text-slate-900">{stop.address_label || 'Sin dirección'}</dd></div>
        <div className="rounded-2xl bg-slate-50 p-3"><dt className="font-bold text-slate-500">Zona</dt><dd className="mt-1 text-slate-900">{stop.zone_name || 'Sin zona'}</dd></div>
        <div className="rounded-2xl bg-slate-50 p-3"><dt className="font-bold text-slate-500">Contacto</dt><dd className="mt-1 text-slate-900">{stop.contact_name || 'Sin contacto'}</dd></div>
        <div className="rounded-2xl bg-slate-50 p-3"><dt className="font-bold text-slate-500">Teléfono</dt><dd className="mt-1 text-slate-900">{stop.contact_phone || 'Sin teléfono'}</dd></div>
        <div className="rounded-2xl bg-amber-50 p-3 sm:col-span-2"><dt className="font-bold text-amber-700">Instrucciones</dt><dd className="mt-1 text-amber-900">{stop.instructions || 'Sin instrucciones especiales'}</dd></div>
        <div className="rounded-2xl bg-slate-50 p-3 sm:col-span-2"><dt className="font-bold text-slate-500">Notas</dt><dd className="mt-1 text-slate-900">{stop.notes || 'Sin notas'}</dd></div>
      </dl>
      <p className="mt-4 rounded-2xl bg-blue-50 p-3 text-sm text-blue-800">Las encomiendas de esta parada y las acciones de evidencia/incidencia aparecen debajo. Selecciona una encomienda antes de guardar evidencia.</p>
    </section>
  )
}

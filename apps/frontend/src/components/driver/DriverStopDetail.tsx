import type { RouteStop } from '../../types/routing'
import { labelFor, stopStatusLabels, stopTypeLabels } from './driverLabels'

type DriverStopDetailProps = {
  stop: RouteStop | null
}

export function DriverStopDetail({ stop }: DriverStopDetailProps) {
  if (!stop) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">Selecciona una parada para enfocar sus encomiendas, evidencia e incidencias.</div>
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Parada seleccionada</p>
      <h3 className="mt-1 text-xl font-black text-slate-950">#{stop.sequence} · {labelFor(stopTypeLabels, String(stop.stop_type))}</h3>
      <dl className="mt-4 space-y-2 text-sm text-slate-600">
        <div><dt className="font-bold text-slate-500">Estado</dt><dd>{labelFor(stopStatusLabels, String(stop.status))}</dd></div>
        <div><dt className="font-bold text-slate-500">Dirección</dt><dd>{stop.address_label || 'Sin dirección'}</dd></div>
        <div><dt className="font-bold text-slate-500">Zona</dt><dd>{stop.zone_name || 'Sin zona'}</dd></div>
        <div><dt className="font-bold text-slate-500">Contacto</dt><dd>{stop.contact_name || 'Sin contacto'} · {stop.contact_phone || 'Sin teléfono'}</dd></div>
        {stop.instructions ? <div><dt className="font-bold text-slate-500">Instrucciones</dt><dd>{stop.instructions}</dd></div> : null}
      </dl>
    </section>
  )
}

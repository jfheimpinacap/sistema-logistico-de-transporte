import type { RouteStop, RouteStopStatus } from '../../types/routing'
import { labelFor, statusPillClass, stopStatusLabels, stopTypeLabels } from './driverLabels'

type DriverStopCardProps = {
  key?: string | number
  stop: RouteStop
  isSelected: boolean
  isBusy?: boolean
  shipmentCount: number
  onSelect: (stop: RouteStop) => void
  onChangeStatus: (stop: RouteStop, status: RouteStopStatus) => void
}

export function DriverStopCard({ stop, isSelected, isBusy = false, shipmentCount, onSelect, onChangeStatus }: DriverStopCardProps) {
  return (
    <article className={`rounded-3xl border bg-white p-4 shadow-sm ${isSelected ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200'}`}>
      <button type="button" onClick={() => onSelect(stop)} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white">{stop.sequence}</span>
            <div>
              <p className="font-bold text-slate-950">{labelFor(stopTypeLabels, String(stop.stop_type))}</p>
              <p className="mt-1 text-sm text-slate-600">{stop.address_label || 'Dirección no registrada'}</p>
            </div>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${statusPillClass(String(stop.status))}`}>{labelFor(stopStatusLabels, String(stop.status))}</span>
        </div>
        <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <p><span className="font-semibold text-slate-500">Zona:</span> {stop.zone_name || 'Sin zona'}</p>
          <p><span className="font-semibold text-slate-500">Encomiendas:</span> {shipmentCount}</p>
          <p><span className="font-semibold text-slate-500">Contacto:</span> {stop.contact_name || 'Sin contacto'}</p>
          <p><span className="font-semibold text-slate-500">Teléfono:</span> {stop.contact_phone || 'Sin teléfono'}</p>
        </div>
        {stop.instructions ? <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">{stop.instructions}</p> : null}
      </button>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button type="button" onClick={() => onChangeStatus(stop, 'arrived')} disabled={isBusy} className="rounded-2xl bg-blue-50 px-3 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-60">Marcar llegada</button>
        <button type="button" onClick={() => onChangeStatus(stop, 'completed')} disabled={isBusy} className="rounded-2xl bg-emerald-50 px-3 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60">Completada</button>
        <button type="button" onClick={() => onChangeStatus(stop, 'failed')} disabled={isBusy} className="rounded-2xl bg-rose-50 px-3 py-3 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60">Fallida</button>
      </div>
    </article>
  )
}

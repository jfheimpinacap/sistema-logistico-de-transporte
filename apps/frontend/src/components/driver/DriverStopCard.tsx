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

const closedStatuses = ['completed', 'cancelled', 'skipped']

export function DriverStopCard({ stop, isSelected, isBusy = false, shipmentCount, onSelect, onChangeStatus }: DriverStopCardProps) {
  const isClosed = closedStatuses.includes(String(stop.status))
  const isFailed = String(stop.status) === 'failed'
  const disableOperationalActions = isBusy || isClosed

  return (
    <article className={`rounded-3xl border bg-white p-4 shadow-sm ${isSelected ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200'}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-2xl font-black text-white" aria-label={`Parada ${stop.sequence}`}>{stop.sequence}</span>
          <div>
            <p className="text-lg font-black text-slate-950">{labelFor(stopTypeLabels, String(stop.stop_type))}</p>
            <p className="mt-1 text-sm text-slate-600">{stop.address_label || 'Dirección no registrada'}</p>
          </div>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusPillClass(String(stop.status))}`}>{labelFor(stopStatusLabels, String(stop.status))}</span>
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
        <p><span className="font-semibold text-slate-500">Zona:</span> {stop.zone_name || 'Sin zona'}</p>
        <p><span className="font-semibold text-slate-500">Encomiendas:</span> {shipmentCount}</p>
        <p><span className="font-semibold text-slate-500">Contacto:</span> {stop.contact_name || 'Sin contacto'}</p>
        <p><span className="font-semibold text-slate-500">Teléfono:</span> {stop.contact_phone || 'Sin teléfono'}</p>
      </div>
      {stop.instructions ? <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800"><span className="font-bold">Instrucciones:</span> {stop.instructions}</p> : null}
      {isClosed || isFailed ? <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-600">Estado actual: {labelFor(stopStatusLabels, String(stop.status))}. Las acciones innecesarias quedan deshabilitadas para evitar cambios accidentales.</p> : null}

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <button type="button" onClick={() => onSelect(stop)} className="min-h-12 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400">Ver detalle</button>
        <button type="button" onClick={() => onChangeStatus(stop, 'arrived')} disabled={disableOperationalActions || String(stop.status) === 'arrived'} className="min-h-12 rounded-2xl bg-blue-50 px-3 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50">Llegué</button>
        <button type="button" onClick={() => onChangeStatus(stop, 'completed')} disabled={disableOperationalActions} className="min-h-12 rounded-2xl bg-emerald-50 px-3 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50">Completar</button>
        <button type="button" onClick={() => onChangeStatus(stop, 'failed')} disabled={disableOperationalActions || isFailed} className="min-h-12 rounded-2xl bg-rose-50 px-3 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50">Fallida</button>
      </div>
    </article>
  )
}

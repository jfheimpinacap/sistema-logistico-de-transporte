import { OperationStatusBadge, getEventTypeLabel } from './OperationStatusBadge'
import type { TrackingEvent } from '../../types/operations'

type Props = {
  events: TrackingEvent[]
  isLoading?: boolean
  error?: string | null
}

function formatDateTime(value?: string | null) {
  return value ? new Date(value).toLocaleString('es-CL') : '—'
}

export function TrackingTimeline({ events, isLoading = false, error }: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-950">Timeline de tracking</h3>
          <p className="text-sm text-slate-500">Historial operativo de la encomienda y sus bultos.</p>
        </div>
      </div>
      {error ? <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div> : null}
      {isLoading ? <p className="py-6 text-center text-sm text-slate-500">Cargando tracking...</p> : null}
      {!isLoading && events.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No hay eventos de tracking registrados.</p> : null}
      <ol className="space-y-4">
        {events.map((event: any) => (
          <li key={event.id} className="relative rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <OperationStatusBadge value={event.status} />
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">{getEventTypeLabel(event.event_type)}</span>
              <span className="text-xs font-medium text-slate-500">{formatDateTime(event.occurred_at)}</span>
            </div>
            <h4 className="mt-3 font-bold text-slate-950">{event.title}</h4>
            {event.description ? <p className="mt-1 text-sm text-slate-600">{event.description}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              {event.location_text ? <span>Ubicación: {event.location_text}</span> : null}
              {event.package_code ? <span>Bulto: {event.package_code}</span> : null}
              {event.warehouse_name ? <span>Bodega: {event.warehouse_name}</span> : null}
              {event.created_by_username ? <span>Usuario: {event.created_by_username}</span> : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

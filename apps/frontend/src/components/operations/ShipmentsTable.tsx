import { OperationStatusBadge, getPriorityLabel, getServiceTypeLabel } from './OperationStatusBadge'
import type { Shipment } from '../../types/operations'

type Props = {
  shipments: Shipment[]
  isLoading: boolean
  error?: string | null
  selectedId?: string | number | null
  onView: (shipment: Shipment) => void
  onEdit: (shipment: Shipment) => void
  onDelete: (shipment: Shipment) => void
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString('es-CL') : '—'
}

export function ShipmentsTable({ shipments, isLoading, error, selectedId, onView, onEdit, onDelete }: Props) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {error ? <div className="border-b border-rose-100 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">{error}</div> : null}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-5 py-4">Tracking</th>
              <th className="px-5 py-4">Cliente</th>
              <th className="px-5 py-4">Remitente</th>
              <th className="px-5 py-4">Destinatario</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Prioridad</th>
              <th className="px-5 py-4">Servicio</th>
              <th className="px-5 py-4">Bultos</th>
              <th className="px-5 py-4">Creación</th>
              <th className="px-5 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
            {isLoading ? (
              <tr><td colSpan={10} className="px-5 py-8 text-center text-slate-500">Cargando encomiendas...</td></tr>
            ) : shipments.length === 0 ? (
              <tr><td colSpan={10} className="px-5 py-8 text-center text-slate-500">No hay encomiendas para los filtros seleccionados.</td></tr>
            ) : shipments.map((shipment) => (
              <tr key={shipment.id} className={selectedId === shipment.id ? 'bg-cyan-50/60' : 'hover:bg-slate-50/80'}>
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-950">{shipment.tracking_code || 'Autogenerado'}</td>
                <td className="whitespace-nowrap px-5 py-4">{shipment.customer_name || '—'}</td>
                <td className="whitespace-nowrap px-5 py-4">{shipment.sender_name}</td>
                <td className="whitespace-nowrap px-5 py-4">{shipment.recipient_name}</td>
                <td className="whitespace-nowrap px-5 py-4"><OperationStatusBadge value={shipment.current_status} /></td>
                <td className="whitespace-nowrap px-5 py-4">{getPriorityLabel(shipment.priority)}</td>
                <td className="whitespace-nowrap px-5 py-4">{getServiceTypeLabel(shipment.service_type)}</td>
                <td className="whitespace-nowrap px-5 py-4">{shipment.package_count_real ?? 0}/{shipment.package_count}</td>
                <td className="whitespace-nowrap px-5 py-4">{formatDate(shipment.created_at)}</td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => onView(shipment)} className="rounded-lg border border-cyan-200 px-3 py-1.5 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-50">Ver detalle</button>
                    <button type="button" onClick={() => onEdit(shipment)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">Editar</button>
                    <button type="button" onClick={() => onDelete(shipment)} disabled={!shipment.is_active} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300">Desactivar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

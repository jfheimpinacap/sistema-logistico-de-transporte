import type { PackageStatus, ShipmentPriority, ShipmentServiceType, ShipmentStatus, TrackingEventType } from '../../types/operations'

const shipmentStatusLabels: Record<string, string> = {
  draft: 'Borrador',
  received: 'Recibida',
  classified: 'Clasificada',
  ready_for_route: 'Lista para ruta',
  assigned_to_route: 'Asignada a ruta',
  in_transit: 'En tránsito',
  delivered: 'Entregada',
  failed_delivery: 'Entrega fallida',
  returned: 'Devuelta',
  cancelled: 'Cancelada',
}

const packageStatusLabels: Record<string, string> = {
  received: 'Recibido',
  classified: 'Clasificado',
  loaded: 'Cargado',
  in_transit: 'En tránsito',
  delivered: 'Entregado',
  failed_delivery: 'Entrega fallida',
  returned: 'Devuelto',
  cancelled: 'Cancelado',
}

const priorityLabels: Record<string, string> = {
  standard: 'Estándar',
  express: 'Express',
  urgent: 'Urgente',
}

const serviceTypeLabels: Record<string, string> = {
  pickup: 'Retiro',
  delivery: 'Entrega',
  transfer: 'Transferencia',
}

const eventTypeLabels: Record<string, string> = {
  status_change: 'Cambio de estado',
  manual_note: 'Nota manual',
  system: 'Sistema',
  exception: 'Excepción',
}

const toneByStatus: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  received: 'bg-cyan-50 text-cyan-700',
  classified: 'bg-indigo-50 text-indigo-700',
  ready_for_route: 'bg-amber-50 text-amber-700',
  assigned_to_route: 'bg-blue-50 text-blue-700',
  loaded: 'bg-blue-50 text-blue-700',
  in_transit: 'bg-violet-50 text-violet-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  failed_delivery: 'bg-rose-50 text-rose-700',
  returned: 'bg-orange-50 text-orange-700',
  cancelled: 'bg-slate-200 text-slate-600',
  urgent: 'bg-rose-50 text-rose-700',
  express: 'bg-amber-50 text-amber-700',
  standard: 'bg-slate-100 text-slate-700',
}

export const shipmentStatusOptions: { value: ShipmentStatus; label: string }[] = Object.entries(shipmentStatusLabels).map(([value, label]) => ({ value: value as ShipmentStatus, label }))
export const packageStatusOptions: { value: PackageStatus; label: string }[] = Object.entries(packageStatusLabels).map(([value, label]) => ({ value: value as PackageStatus, label }))
export const priorityOptions: { value: ShipmentPriority; label: string }[] = Object.entries(priorityLabels).map(([value, label]) => ({ value: value as ShipmentPriority, label }))
export const serviceTypeOptions: { value: ShipmentServiceType; label: string }[] = Object.entries(serviceTypeLabels).map(([value, label]) => ({ value: value as ShipmentServiceType, label }))

export function getShipmentStatusLabel(status?: string | null) {
  return status ? shipmentStatusLabels[status] ?? status : '—'
}

export function getPackageStatusLabel(status?: string | null) {
  return status ? packageStatusLabels[status] ?? status : '—'
}

export function getPriorityLabel(priority?: string | null) {
  return priority ? priorityLabels[priority] ?? priority : '—'
}

export function getServiceTypeLabel(serviceType?: string | null) {
  return serviceType ? serviceTypeLabels[serviceType] ?? serviceType : '—'
}

export function getEventTypeLabel(eventType?: TrackingEventType | string | null) {
  return eventType ? eventTypeLabels[eventType] ?? eventType : '—'
}

type OperationStatusBadgeProps = {
  value?: string | null
  type?: 'shipment' | 'package' | 'priority' | 'service' | 'event'
}

export function OperationStatusBadge({ value, type = 'shipment' }: OperationStatusBadgeProps) {
  const label =
    type === 'package'
      ? getPackageStatusLabel(value)
      : type === 'priority'
        ? getPriorityLabel(value)
        : type === 'service'
          ? getServiceTypeLabel(value)
          : type === 'event'
            ? getEventTypeLabel(value)
            : getShipmentStatusLabel(value)

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneByStatus[value ?? ''] ?? 'bg-slate-100 text-slate-700'}`}>{label}</span>
}

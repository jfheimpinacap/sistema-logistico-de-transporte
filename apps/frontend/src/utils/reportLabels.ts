export const shipmentStatusLabels: Record<string, string> = {
  draft: 'Borrador', received: 'Recibida', classified: 'Clasificada', ready_for_route: 'Lista para ruta', assigned_to_route: 'Asignada a ruta', in_transit: 'En tránsito', delivered: 'Entregada', failed_delivery: 'Entrega fallida', returned: 'Devuelta', cancelled: 'Cancelada',
}
export const routeStatusLabels: Record<string, string> = {
  draft: 'Borrador', planned: 'Planificada', assigned: 'Asignada', loaded: 'Cargada', in_progress: 'En curso', completed: 'Completada', cancelled: 'Cancelada', with_incidents: 'Con incidencias',
}
export const incidentStatusLabels: Record<string, string> = { open: 'Abierta', in_review: 'En revisión', resolved: 'Resuelta', cancelled: 'Cancelada' }
export const documentStatusLabels: Record<string, string> = { draft: 'Borrador', issued: 'Emitido interno', cancelled: 'Anulado', archived: 'Archivado' }
export const priorityLabels: Record<string, string> = { standard: 'Estándar', express: 'Express', urgent: 'Urgente' }
export const serviceTypeLabels: Record<string, string> = { pickup: 'Retiro', delivery: 'Entrega', transfer: 'Transferencia' }
export const incidentCategoryLabels: Record<string, string> = { delivery: 'Entrega', route: 'Ruta', vehicle: 'Vehículo', package: 'Bulto', customer: 'Cliente', other: 'Otra' }
export const severityLabels: Record<string, string> = { low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica' }
export const documentTypeLabels: Record<string, string> = { manifest: 'Manifiesto', delivery_note: 'Guía interna', transfer_note: 'Traslado interno', incident_report: 'Reporte de incidencia', other: 'Otro' }
export const vehicleStatusLabels: Record<string, string> = { available: 'Disponible', assigned: 'Asignado', maintenance: 'Mantención', inactive: 'Inactivo' }

export function getReportLabel(value?: string | null, labels: Record<string, string> = {}) {
  return value ? labels[value] ?? value : '—'
}

export function toNumber(value: unknown, fallback = 0) {
  if (value === null || value === undefined || value === '') return fallback
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

export function formatNumber(value: unknown, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2, ...options }).format(toNumber(value))
}

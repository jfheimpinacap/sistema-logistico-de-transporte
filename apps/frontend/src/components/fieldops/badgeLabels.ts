export const proofTypeLabels: Record<string, string> = {
  delivery: 'Entrega',
  failed_delivery: 'Entrega fallida',
  pickup: 'Retiro',
  return: 'Devolución',
}
export const proofStatusLabels: Record<string, string> = {
  pending_review: 'Pendiente revisión',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
}
export const incidentStatusLabels: Record<string, string> = {
  open: 'Abierta',
  in_review: 'En revisión',
  resolved: 'Resuelta',
  cancelled: 'Cancelada',
}
export const incidentSeverityLabels: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
}
export const incidentCategoryLabels: Record<string, string> = {
  customer_absent: 'Cliente ausente',
  wrong_address: 'Dirección incorrecta',
  damaged_package: 'Paquete dañado',
  rejected_by_recipient: 'Rechazado por receptor',
  inaccessible_zone: 'Zona inaccesible',
  vehicle_issue: 'Problema de vehículo',
  partial_delivery: 'Entrega parcial',
  rescheduled: 'Reprogramada',
  returned_to_warehouse: 'Devuelto a bodega',
  lost_package: 'Paquete perdido',
  other: 'Otro',
}
export const proofTypeOptions = Object.entries(proofTypeLabels).map(([value, label]) => ({ value, label }))
export const proofStatusOptions = Object.entries(proofStatusLabels).map(([value, label]) => ({ value, label }))
export const incidentStatusOptions = Object.entries(incidentStatusLabels).map(([value, label]) => ({ value, label }))
export const incidentSeverityOptions = Object.entries(incidentSeverityLabels).map(([value, label]) => ({ value, label }))
export const incidentCategoryOptions = Object.entries(incidentCategoryLabels).map(([value, label]) => ({ value, label }))

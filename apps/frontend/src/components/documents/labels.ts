import type { LogisticsDocumentStatus, LogisticsDocumentType } from '../../types/documents'

export const documentStatusLabels: Record<LogisticsDocumentStatus, string> = {
  draft: 'Borrador',
  issued: 'Emitido interno',
  cancelled: 'Anulado',
  archived: 'Archivado',
}

export const documentTypeLabels: Record<LogisticsDocumentType, string> = {
  transfer_note: 'Nota interna de traslado',
  route_manifest: 'Manifiesto de ruta',
  route_sheet: 'Hoja de ruta',
  delivery_receipt: 'Comprobante interno de entrega',
  incident_report: 'Reporte interno de incidencia',
  internal_note: 'Nota interna',
}

export const documentTypeOptions = Object.entries(documentTypeLabels).map(([value, label]) => ({ value, label }))
export const documentStatusOptions = Object.entries(documentStatusLabels).map(([value, label]) => ({ value, label }))

export function getDocumentTypeLabel(value?: string | null) {
  return value && value in documentTypeLabels ? documentTypeLabels[value as LogisticsDocumentType] : value ?? '—'
}

export function getDocumentStatusLabel(value?: string | null) {
  return value && value in documentStatusLabels ? documentStatusLabels[value as LogisticsDocumentStatus] : value ?? '—'
}

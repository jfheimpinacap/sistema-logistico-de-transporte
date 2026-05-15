import { API_BASE_URL, ApiClientError, type ApiErrorPayload } from './apiClient'
import type { ReportFilters } from '../types/reports'

type ExportParams = ReportFilters & { token: string }

function buildQuery(params: ReportFilters = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'all') return
    query.set(key, String(value))
  })
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

function filenameFromDisposition(disposition: string | null, fallback: string) {
  if (!disposition) return fallback
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1].replace(/"/g, ''))
  const asciiMatch = disposition.match(/filename="?([^";]+)"?/i)
  return asciiMatch?.[1] ?? fallback
}

async function parseError(response: Response, blob: Blob) {
  const text = await blob.text()
  const contentType = response.headers.get('content-type') ?? ''
  let payload: ApiErrorPayload | null = null
  if (contentType.includes('application/json') && text) {
    try {
      payload = JSON.parse(text) as ApiErrorPayload
    } catch {
      payload = null
    }
  }
  if (response.status === 401) {
    throw new ApiClientError('Tu sesión expiró o no está autorizada. Vuelve al login para continuar.', response.status, payload)
  }
  if (response.status === 400) {
    const detail = payload
      ? Object.entries(payload).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`).join(' · ')
      : text
    throw new ApiClientError(`Filtros inválidos para exportar CSV${detail ? `: ${detail}` : '.'}`, response.status, payload)
  }
  throw new ApiClientError(payload?.detail ?? payload?.message ?? `No fue posible exportar CSV (HTTP ${response.status}).`, response.status, payload)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

async function exportCsv(path: string, fallbackFilename: string, { token, ...params }: ExportParams) {
  const response = await fetch(`${API_BASE_URL}${path}${buildQuery(params)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const blob = await response.blob()
  if (!response.ok) await parseError(response, blob)

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) await parseError(response, blob)

  downloadBlob(blob, filenameFromDisposition(response.headers.get('content-disposition'), fallbackFilename))
}

export const exportService = {
  exportShipments: (params: ExportParams) => exportCsv('/reports/export/shipments.csv', 'reporte_encomiendas.csv', params),
  exportRoutes: (params: ExportParams) => exportCsv('/reports/export/routes.csv', 'reporte_rutas.csv', params),
  exportIncidents: (params: ExportParams) => exportCsv('/reports/export/incidents.csv', 'reporte_incidencias.csv', params),
  exportDocuments: (params: ExportParams) => exportCsv('/reports/export/documents.csv', 'reporte_documentos.csv', params),
  exportDriverPerformance: (params: ExportParams) => exportCsv('/reports/export/driver-performance.csv', 'reporte_rendimiento_conductores.csv', params),
  exportVehicleUsage: (params: ExportParams) => exportCsv('/reports/export/vehicle-usage.csv', 'reporte_uso_vehiculos.csv', params),
}

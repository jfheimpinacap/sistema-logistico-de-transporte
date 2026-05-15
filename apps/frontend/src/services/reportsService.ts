import { apiRequest, ApiClientError } from './apiClient'
import type { DocumentsSummary, DriverPerformanceRow, IncidentsSummary, ReportFilters, ReportListResponse, ReportsOverview, RoutesSummary, ShipmentsSummary, VehicleUsageRow } from '../types/reports'

type ServiceParams = ReportFilters & { token: string }

function buildQuery(params: ReportFilters = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'all') return
    query.set(key, String(value))
  })
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

function normalizeList<T>(payload: ReportListResponse<T>): T[] {
  return Array.isArray(payload) ? payload : payload.results ?? []
}

export function getReadableReportError(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.status === 401) return 'Tu sesión expiró o no está autorizada. Vuelve al login para continuar.'
    if (error.status === 400) {
      if (error.payload) {
        const fieldErrors = Object.entries(error.payload).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`)
        if (fieldErrors.length > 0) return `Filtros inválidos: ${fieldErrors.join(' · ')}`
      }
      return 'Filtros inválidos. Revisa las fechas y los valores seleccionados.'
    }
    return error.message || 'No fue posible cargar el reporte.'
  }
  if (error instanceof Error) return error.message
  return 'No fue posible cargar el reporte. Intenta nuevamente.'
}

async function getReport<T>(path: string, { token, ...params }: ServiceParams): Promise<T> {
  return apiRequest<T>(`${path}${buildQuery(params)}`, { token })
}

export const reportsService = {
  getOverview: (params: ServiceParams) => getReport<ReportsOverview>('/reports/overview/', params),
  getShipmentsSummary: (params: ServiceParams) => getReport<ShipmentsSummary>('/reports/shipments-summary/', params),
  getRoutesSummary: (params: ServiceParams) => getReport<RoutesSummary>('/reports/routes-summary/', params),
  getIncidentsSummary: (params: ServiceParams) => getReport<IncidentsSummary>('/reports/incidents-summary/', params),
  getDocumentsSummary: (params: ServiceParams) => getReport<DocumentsSummary>('/reports/documents-summary/', params),
  async getDriverPerformance(params: ServiceParams) {
    return normalizeList(await getReport<ReportListResponse<DriverPerformanceRow>>('/reports/driver-performance/', params))
  },
  async getVehicleUsage(params: ServiceParams) {
    return normalizeList(await getReport<ReportListResponse<VehicleUsageRow>>('/reports/vehicle-usage/', params))
  },
}

import { apiRequest, ApiClientError } from './apiClient'
import type { AddressCheckResponse, DistanceCalculationPayload, DistanceCalculationResponse, RouteDistanceSummary, UpdateRouteEstimatesPayload, UpdateRouteEstimatesResponse } from '../types/geo'
import type { RoutingId } from '../types/routing'

type AddressCheckParams = {
  token: string
  address_id?: RoutingId | null
  only_missing?: boolean | null
}

type RouteSummaryParams = {
  token: string
  average_speed_kmh?: number | string | null
}

function buildQuery(params: Record<string, unknown> = {}) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.set(key, typeof value === 'boolean' ? String(value) : String(value))
  })
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

function describePayloadErrors(payload: Record<string, unknown> | null) {
  if (!payload) return null
  const nestedErrors = payload.errors && typeof payload.errors === 'object' ? payload.errors as Record<string, unknown> : null
  const source = nestedErrors ?? payload
  const fieldErrors = Object.entries(source)
    .filter(([key]) => !['detail', 'message'].includes(key))
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}`)
  return fieldErrors.length > 0 ? fieldErrors.join(' · ') : null
}

export function getReadableGeoError(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.status === 401) return 'Tu sesión expiró o no está autorizada. Vuelve al login para continuar.'
    if (error.status === 400) {
      const details = describePayloadErrors(error.payload)
      return details ? `${error.message}: ${details}` : 'Datos geográficos inválidos. Revisa coordenadas y velocidad promedio.'
    }
    if (error.status === 404) return error.message || 'No se encontró el recurso solicitado.'
    const details = describePayloadErrors(error.payload)
    return details ? `${error.message}: ${details}` : error.message
  }
  if (error instanceof TypeError) return 'No fue posible conectar con el backend. Verifica que el servidor esté iniciado.'
  if (error instanceof Error) return error.message
  return 'No fue posible completar la operación geográfica. Intenta nuevamente.'
}

export const geoService = {
  async getAddressCheck({ token, ...params }: AddressCheckParams) {
    const payload = await apiRequest<AddressCheckResponse>(`/geo/address-check/${buildQuery(params)}`, { token })
    return { ...payload, addresses: Array.isArray(payload.addresses) ? payload.addresses : [] }
  },
  calculateDistance(payload: DistanceCalculationPayload, token: string) {
    return apiRequest<DistanceCalculationResponse>('/geo/calculate-distance/', { method: 'POST', token, body: JSON.stringify(payload) })
  },
  getRouteDistanceSummary(routeId: RoutingId, { token, ...params }: RouteSummaryParams) {
    return apiRequest<RouteDistanceSummary>(`/geo/routes/${routeId}/distance-summary/${buildQuery(params)}`, { token })
  },
  updateRouteEstimates(routeId: RoutingId, payload: UpdateRouteEstimatesPayload, token: string) {
    return apiRequest<UpdateRouteEstimatesResponse>(`/geo/routes/${routeId}/update-estimates/`, { method: 'POST', token, body: JSON.stringify(payload) })
  },
}

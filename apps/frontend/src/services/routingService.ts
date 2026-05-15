import { apiRequest, ApiClientError } from './apiClient'
import type { AssignShipmentsPayload, ChangeRouteStatusPayload, ChangeRouteStopStatusPayload, DrfListResponse, ReorderStopsPayload, Route, RoutePayload, RouteShipment, RouteShipmentPayload, RouteStop, RouteStopPayload, RoutingId, RoutingListParams } from '../types/routing'

function normalizeList<T>(payload: DrfListResponse<T>): T[] {
  return Array.isArray(payload) ? payload : payload.results ?? []
}

function buildQuery(params: Omit<RoutingListParams, 'token'> = {}) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'all') return
    if (typeof value === 'string' && value.trim() === '') return
    searchParams.set(key, typeof value === 'boolean' ? String(value) : String(value).trim())
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export function getReadableRoutingError(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.status === 401) return 'Tu sesión expiró o no está autorizada. Vuelve al login para continuar.'
    if (error.payload) {
      const fieldErrors = Object.entries(error.payload)
        .filter(([key]) => !['detail', 'message'].includes(key))
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`)
      if (fieldErrors.length > 0) return fieldErrors.join(' · ')
    }
    return error.message
  }
  if (error instanceof TypeError) return 'No fue posible conectar con el backend. Verifica que el servidor esté iniciado.'
  if (error instanceof Error) return error.message
  return 'No fue posible completar la operación. Intenta nuevamente.'
}

export async function listRoutes(params: RoutingListParams): Promise<Route[]> {
  const { token, ...filters } = params
  const payload = await apiRequest<DrfListResponse<Route>>(`/routes/${buildQuery(filters)}`, { token })
  return normalizeList(payload)
}
export function getRoute(id: RoutingId, token: string) { return apiRequest<Route>(`/routes/${id}/`, { token }) }
export function createRoute(payload: RoutePayload, token: string) { return apiRequest<Route>('/routes/', { method: 'POST', token, body: JSON.stringify(payload) }) }
export function updateRoute(id: RoutingId, payload: RoutePayload, token: string) { return apiRequest<Route>(`/routes/${id}/`, { method: 'PATCH', token, body: JSON.stringify(payload) }) }
export function deleteRoute(id: RoutingId, token: string) { return apiRequest<null>(`/routes/${id}/`, { method: 'DELETE', token }) }
export function changeRouteStatus(id: RoutingId, payload: ChangeRouteStatusPayload, token: string) { return apiRequest<Route>(`/routes/${id}/change-status/`, { method: 'POST', token, body: JSON.stringify(payload) }) }
export function recalculateRouteSummary(id: RoutingId, token: string) { return apiRequest<Route>(`/routes/${id}/recalculate-summary/`, { method: 'POST', token }) }
export function assignShipments(id: RoutingId, payload: AssignShipmentsPayload, token: string) { return apiRequest<{ route: Route; created_assignment_ids: number[]; reused_assignment_ids: number[]; skipped: unknown[] }>(`/routes/${id}/assign-shipments/`, { method: 'POST', token, body: JSON.stringify(payload) }) }
export function reorderStops(id: RoutingId, payload: ReorderStopsPayload, token: string) { return apiRequest<RouteStop[]>(`/routes/${id}/reorder-stops/`, { method: 'POST', token, body: JSON.stringify(payload) }) }

export async function listRouteStops(params: RoutingListParams): Promise<RouteStop[]> {
  const { token, ...filters } = params
  const payload = await apiRequest<DrfListResponse<RouteStop>>(`/route-stops/${buildQuery(filters)}`, { token })
  return normalizeList(payload)
}
export function getRouteStop(id: RoutingId, token: string) { return apiRequest<RouteStop>(`/route-stops/${id}/`, { token }) }
export function createRouteStop(payload: RouteStopPayload, token: string) { return apiRequest<RouteStop>('/route-stops/', { method: 'POST', token, body: JSON.stringify(payload) }) }
export function updateRouteStop(id: RoutingId, payload: RouteStopPayload, token: string) { return apiRequest<RouteStop>(`/route-stops/${id}/`, { method: 'PATCH', token, body: JSON.stringify(payload) }) }
export function deleteRouteStop(id: RoutingId, token: string) { return apiRequest<null>(`/route-stops/${id}/`, { method: 'DELETE', token }) }
export function changeRouteStopStatus(id: RoutingId, payload: ChangeRouteStopStatusPayload, token: string) { return apiRequest<RouteStop>(`/route-stops/${id}/change-status/`, { method: 'POST', token, body: JSON.stringify(payload) }) }

export async function listRouteShipments(params: RoutingListParams): Promise<RouteShipment[]> {
  const { token, ...filters } = params
  const payload = await apiRequest<DrfListResponse<RouteShipment>>(`/route-shipments/${buildQuery(filters)}`, { token })
  return normalizeList(payload)
}
export function getRouteShipment(id: RoutingId, token: string) { return apiRequest<RouteShipment>(`/route-shipments/${id}/`, { token }) }
export function createRouteShipment(payload: RouteShipmentPayload, token: string) { return apiRequest<RouteShipment>('/route-shipments/', { method: 'POST', token, body: JSON.stringify(payload) }) }
export function updateRouteShipment(id: RoutingId, payload: RouteShipmentPayload, token: string) { return apiRequest<RouteShipment>(`/route-shipments/${id}/`, { method: 'PATCH', token, body: JSON.stringify(payload) }) }
export function deleteRouteShipment(id: RoutingId, token: string) { return apiRequest<null>(`/route-shipments/${id}/`, { method: 'DELETE', token }) }

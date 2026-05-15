import { apiRequest, ApiClientError } from './apiClient'
import type {
  ChangeStatusPayload,
  DrfListResponse,
  OperationId,
  OperationListParams,
  Package,
  PackagePayload,
  Shipment,
  ShipmentPayload,
  TrackingEvent,
  TrackingEventPayload,
} from '../types/operations'

function normalizeList<T>(payload: DrfListResponse<T>): T[] {
  return Array.isArray(payload) ? payload : payload.results ?? []
}

function buildQuery(params: Omit<OperationListParams, 'token'> = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'all') {
      return
    }
    if (typeof value === 'string' && value.trim() === '') {
      return
    }
    searchParams.set(key, typeof value === 'boolean' ? String(value) : String(value).trim())
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export function getReadableOperationError(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.status === 401) {
      return 'Tu sesión expiró o no está autorizada. Vuelve al login para continuar.'
    }

    if (error.payload) {
      const fieldErrors = Object.entries(error.payload)
        .filter(([key]) => !['detail', 'message'].includes(key))
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`)

      if (fieldErrors.length > 0) {
        return fieldErrors.join(' · ')
      }
    }

    return error.message
  }

  if (error instanceof TypeError) {
    return 'No fue posible conectar con el backend. Verifica que el servidor esté iniciado.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'No fue posible completar la operación. Intenta nuevamente.'
}

export async function listShipments(params: OperationListParams): Promise<Shipment[]> {
  const { token, ...filters } = params
  const payload = await apiRequest<DrfListResponse<Shipment>>(`/shipments/${buildQuery(filters)}`, { token })
  return normalizeList(payload)
}

export function getShipment(id: OperationId, token: string) {
  return apiRequest<Shipment>(`/shipments/${id}/`, { token })
}

export function createShipment(payload: ShipmentPayload, token: string) {
  return apiRequest<Shipment>('/shipments/', { method: 'POST', token, body: JSON.stringify(payload) })
}

export function updateShipment(id: OperationId, payload: ShipmentPayload, token: string) {
  return apiRequest<Shipment>(`/shipments/${id}/`, { method: 'PATCH', token, body: JSON.stringify(payload) })
}

export function deleteShipment(id: OperationId, token: string) {
  return apiRequest<null>(`/shipments/${id}/`, { method: 'DELETE', token })
}

export function changeShipmentStatus(id: OperationId, payload: ChangeStatusPayload, token: string) {
  return apiRequest<TrackingEvent>(`/shipments/${id}/change-status/`, { method: 'POST', token, body: JSON.stringify(payload) })
}

export async function listPackages(params: OperationListParams): Promise<Package[]> {
  const { token, ...filters } = params
  const payload = await apiRequest<DrfListResponse<Package>>(`/packages/${buildQuery(filters)}`, { token })
  return normalizeList(payload)
}

export function getPackage(id: OperationId, token: string) {
  return apiRequest<Package>(`/packages/${id}/`, { token })
}

export function createPackage(payload: PackagePayload, token: string) {
  return apiRequest<Package>('/packages/', { method: 'POST', token, body: JSON.stringify(payload) })
}

export function updatePackage(id: OperationId, payload: PackagePayload, token: string) {
  return apiRequest<Package>(`/packages/${id}/`, { method: 'PATCH', token, body: JSON.stringify(payload) })
}

export function deletePackage(id: OperationId, token: string) {
  return apiRequest<null>(`/packages/${id}/`, { method: 'DELETE', token })
}

export async function listTrackingEvents(params: OperationListParams): Promise<TrackingEvent[]> {
  const { token, ...filters } = params
  const payload = await apiRequest<DrfListResponse<TrackingEvent>>(`/tracking-events/${buildQuery(filters)}`, { token })
  return normalizeList(payload)
}

export function getTrackingEvent(id: OperationId, token: string) {
  return apiRequest<TrackingEvent>(`/tracking-events/${id}/`, { token })
}

export function createTrackingEvent(payload: TrackingEventPayload, token: string) {
  return apiRequest<TrackingEvent>('/tracking-events/', { method: 'POST', token, body: JSON.stringify(payload) })
}

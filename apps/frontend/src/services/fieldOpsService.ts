import { apiRequest, ApiClientError } from './apiClient'
import type {
  AcceptProofPayload,
  DeliveryProof,
  DeliveryProofPayload,
  DrfListResponse,
  FieldOpsId,
  FieldOpsListParams,
  Incident,
  IncidentPayload,
  RejectProofPayload,
  ResolveIncidentPayload,
  CancelIncidentPayload,
} from '../types/fieldops'

function normalizeList<T>(payload: DrfListResponse<T>): T[] {
  return Array.isArray(payload) ? payload : payload.results ?? []
}

function buildQuery(params: Omit<FieldOpsListParams, 'token'> = {}) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'all') return
    if (typeof value === 'string' && value.trim() === '') return
    searchParams.set(key, typeof value === 'boolean' ? String(value) : String(value).trim())
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

function hasFile(payload: Record<string, unknown>, fileKeys: string[]) {
  return fileKeys.some((key) => payload[key] instanceof File)
}

function toFormData(payload: Record<string, unknown>) {
  const formData = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (value instanceof File) {
      formData.append(key, value)
      return
    }
    formData.append(key, String(value))
  })
  return formData
}

function makeBody(payload: Record<string, unknown>, fileKeys: string[]) {
  return hasFile(payload, fileKeys) ? toFormData(payload) : JSON.stringify(payload)
}

export function getReadableFieldOpsError(error: unknown) {
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

export async function listDeliveryProofs(params: FieldOpsListParams): Promise<DeliveryProof[]> {
  const { token, ...filters } = params
  const payload = await apiRequest<DrfListResponse<DeliveryProof>>(`/delivery-proofs/${buildQuery(filters)}`, { token })
  return normalizeList(payload)
}
export function getDeliveryProof(id: FieldOpsId, token: string) { return apiRequest<DeliveryProof>(`/delivery-proofs/${id}/`, { token }) }
export function createDeliveryProof(payload: DeliveryProofPayload, token: string) { return apiRequest<DeliveryProof>('/delivery-proofs/', { method: 'POST', token, body: makeBody(payload, ['photo', 'signature_file']) }) }
export function updateDeliveryProof(id: FieldOpsId, payload: DeliveryProofPayload, token: string) { return apiRequest<DeliveryProof>(`/delivery-proofs/${id}/`, { method: 'PATCH', token, body: makeBody(payload, ['photo', 'signature_file']) }) }
export function deleteDeliveryProof(id: FieldOpsId, token: string) { return apiRequest<null>(`/delivery-proofs/${id}/`, { method: 'DELETE', token }) }
export function acceptDeliveryProof(id: FieldOpsId, payload: AcceptProofPayload, token: string) { return apiRequest<DeliveryProof>(`/delivery-proofs/${id}/accept/`, { method: 'POST', token, body: JSON.stringify(payload) }) }
export function rejectDeliveryProof(id: FieldOpsId, payload: RejectProofPayload, token: string) { return apiRequest<DeliveryProof>(`/delivery-proofs/${id}/reject/`, { method: 'POST', token, body: JSON.stringify(payload) }) }

export async function listIncidents(params: FieldOpsListParams): Promise<Incident[]> {
  const { token, ...filters } = params
  const payload = await apiRequest<DrfListResponse<Incident>>(`/incidents/${buildQuery(filters)}`, { token })
  return normalizeList(payload)
}
export function getIncident(id: FieldOpsId, token: string) { return apiRequest<Incident>(`/incidents/${id}/`, { token }) }
export function createIncident(payload: IncidentPayload, token: string) { return apiRequest<Incident>('/incidents/', { method: 'POST', token, body: makeBody(payload, ['evidence_file']) }) }
export function updateIncident(id: FieldOpsId, payload: IncidentPayload, token: string) { return apiRequest<Incident>(`/incidents/${id}/`, { method: 'PATCH', token, body: makeBody(payload, ['evidence_file']) }) }
export function deleteIncident(id: FieldOpsId, token: string) { return apiRequest<null>(`/incidents/${id}/`, { method: 'DELETE', token }) }
export function resolveIncident(id: FieldOpsId, payload: ResolveIncidentPayload, token: string) { return apiRequest<Incident>(`/incidents/${id}/resolve/`, { method: 'POST', token, body: JSON.stringify(payload) }) }
export function cancelIncident(id: FieldOpsId, payload: CancelIncidentPayload, token: string) { return apiRequest<Incident>(`/incidents/${id}/cancel/`, { method: 'POST', token, body: JSON.stringify(payload) }) }

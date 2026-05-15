import { apiRequest, ApiClientError } from './apiClient'
import type {
  ArchiveDocumentPayload,
  CancelDocumentPayload,
  DocumentId,
  DocumentLinesListParams,
  DocumentsListParams,
  DrfListResponse,
  GenerateFromRoutePayload,
  GenerateFromShipmentPayload,
  IssueDocumentPayload,
  LogisticsDocument,
  LogisticsDocumentLine,
  LogisticsDocumentLinePayload,
  LogisticsDocumentPayload,
  PrintData,
} from '../types/documents'

function normalizeList<T>(payload: DrfListResponse<T>): T[] {
  return Array.isArray(payload) ? payload : payload.results ?? []
}

function buildQuery(params: Record<string, unknown> = {}) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'all') return
    if (typeof value === 'string' && value.trim() === '') return
    searchParams.set(key, typeof value === 'boolean' ? String(value) : String(value).trim())
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

function hasFile(payload: LogisticsDocumentPayload) {
  return payload.attachment instanceof File
}

function toFormData(payload: LogisticsDocumentPayload) {
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

function makeDocumentBody(payload: LogisticsDocumentPayload) {
  return hasFile(payload) ? toFormData(payload) : JSON.stringify(payload)
}

export function getReadableDocumentError(error: unknown) {
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

export async function listDocuments(params: DocumentsListParams): Promise<LogisticsDocument[]> {
  const { token, ...filters } = params
  const payload = await apiRequest<DrfListResponse<LogisticsDocument>>(`/documents/${buildQuery(filters)}`, { token })
  return normalizeList(payload)
}
export function getDocument(id: DocumentId, token: string) { return apiRequest<LogisticsDocument>(`/documents/${id}/`, { token }) }
export function createDocument(payload: LogisticsDocumentPayload, token: string) { return apiRequest<LogisticsDocument>('/documents/', { method: 'POST', token, body: makeDocumentBody(payload) }) }
export function updateDocument(id: DocumentId, payload: LogisticsDocumentPayload, token: string) { return apiRequest<LogisticsDocument>(`/documents/${id}/`, { method: 'PATCH', token, body: makeDocumentBody(payload) }) }
export function deleteDocument(id: DocumentId, token: string) { return apiRequest<null>(`/documents/${id}/`, { method: 'DELETE', token }) }
export function issueDocument(id: DocumentId, payload: IssueDocumentPayload, token: string) { return apiRequest<LogisticsDocument>(`/documents/${id}/issue/`, { method: 'POST', token, body: JSON.stringify(payload) }) }
export function cancelDocument(id: DocumentId, payload: CancelDocumentPayload, token: string) { return apiRequest<LogisticsDocument>(`/documents/${id}/cancel/`, { method: 'POST', token, body: JSON.stringify(payload) }) }
export function archiveDocument(id: DocumentId, payload: ArchiveDocumentPayload, token: string) { return apiRequest<LogisticsDocument>(`/documents/${id}/archive/`, { method: 'POST', token, body: JSON.stringify(payload) }) }
export function generateFromRoute(payload: GenerateFromRoutePayload, token: string) { return apiRequest<LogisticsDocument>('/documents/generate-from-route/', { method: 'POST', token, body: JSON.stringify(payload) }) }
export function generateFromShipment(payload: GenerateFromShipmentPayload, token: string) { return apiRequest<LogisticsDocument>('/documents/generate-from-shipment/', { method: 'POST', token, body: JSON.stringify(payload) }) }
export function getPrintData(id: DocumentId, token: string) { return apiRequest<PrintData>(`/documents/${id}/print-data/`, { token }) }

export async function listDocumentLines(params: DocumentLinesListParams): Promise<LogisticsDocumentLine[]> {
  const { token, ...filters } = params
  const payload = await apiRequest<DrfListResponse<LogisticsDocumentLine>>(`/document-lines/${buildQuery(filters)}`, { token })
  return normalizeList(payload)
}
export function getDocumentLine(id: DocumentId, token: string) { return apiRequest<LogisticsDocumentLine>(`/document-lines/${id}/`, { token }) }
export function createDocumentLine(payload: LogisticsDocumentLinePayload, token: string) { return apiRequest<LogisticsDocumentLine>('/document-lines/', { method: 'POST', token, body: JSON.stringify(payload) }) }
export function updateDocumentLine(id: DocumentId, payload: LogisticsDocumentLinePayload, token: string) { return apiRequest<LogisticsDocumentLine>(`/document-lines/${id}/`, { method: 'PATCH', token, body: JSON.stringify(payload) }) }
export function deleteDocumentLine(id: DocumentId, token: string) { return apiRequest<null>(`/document-lines/${id}/`, { method: 'DELETE', token }) }

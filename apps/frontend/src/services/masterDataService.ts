import { apiRequest, ApiClientError } from './apiClient'
import type { ActiveFilter, ListResponse, MasterEndpoint, MasterEntityMap, MasterPayload } from '../types/masterData'

type ListParams = {
  token: string
  search?: string
  activeFilter?: ActiveFilter
}

type MutationParams<T extends MasterEndpoint> = {
  token: string
  endpoint: T
  payload: MasterPayload<T>
}

type UpdateParams<T extends MasterEndpoint> = MutationParams<T> & {
  id: string | number
}

type DeleteParams<T extends MasterEndpoint> = {
  token: string
  endpoint: T
  id: string | number
}

function normalizeList<T>(payload: ListResponse<T>): T[] {
  if (Array.isArray(payload)) {
    return payload
  }

  return payload.results ?? []
}

function buildQuery({ search, activeFilter }: Omit<ListParams, 'token'>) {
  const params = new URLSearchParams()

  if (search?.trim()) {
    params.set('search', search.trim())
  }

  if (activeFilter === 'active') {
    params.set('is_active', 'true')
  }

  if (activeFilter === 'inactive') {
    params.set('is_active', 'false')
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

export function getReadableApiError(error: unknown) {
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

  if (error instanceof Error) {
    return error.message
  }

  return 'No fue posible completar la operación. Intenta nuevamente.'
}

export async function listMasterData<T extends MasterEndpoint>(endpoint: T, params: ListParams): Promise<MasterEntityMap[T][]> {
  const query = buildQuery(params)
  const payload = await apiRequest<ListResponse<MasterEntityMap[T]>>(`/${endpoint}/${query}`, {
    token: params.token,
  })

  return normalizeList(payload)
}

export async function createMasterData<T extends MasterEndpoint>({ endpoint, payload, token }: MutationParams<T>) {
  return apiRequest<MasterEntityMap[T]>(`/${endpoint}/`, {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  })
}

export async function updateMasterData<T extends MasterEndpoint>({ endpoint, id, payload, token }: UpdateParams<T>) {
  return apiRequest<MasterEntityMap[T]>(`/${endpoint}/${id}/`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  })
}

export async function deleteMasterData<T extends MasterEndpoint>({ endpoint, id, token }: DeleteParams<T>) {
  return apiRequest<null>(`/${endpoint}/${id}/`, {
    method: 'DELETE',
    token,
  })
}

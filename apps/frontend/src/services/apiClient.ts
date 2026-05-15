const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8002/api').replace(/\/$/, '')

export type ApiErrorPayload = {
  detail?: string
  message?: string
  [key: string]: unknown
}

export class ApiClientError extends Error {
  status: number
  payload: ApiErrorPayload | null

  constructor(message: string, status: number, payload: ApiErrorPayload | null = null) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.payload = payload
  }
}

type RequestOptions = RequestInit & {
  token?: string | null
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? ''

  if (response.status === 204) {
    return null
  }

  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...init } = options
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  const requestHeaders = new Headers(headers)
  if (!(init.body instanceof FormData) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json')
  }
  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...init,
    headers: requestHeaders,
  })

  const payload = await parseResponse(response)

  if (!response.ok) {
    const errorPayload = typeof payload === 'object' && payload !== null ? (payload as ApiErrorPayload) : null
    const message = errorPayload?.detail ?? errorPayload?.message ?? `Error HTTP ${response.status}`
    throw new ApiClientError(message, response.status, errorPayload)
  }

  return payload as T
}

export { API_BASE_URL }

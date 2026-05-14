import { apiRequest } from './apiClient'
import type { AuthTokens, AuthUser, LoginCredentials } from '../types/auth'

export function loginRequest(credentials: LoginCredentials) {
  return apiRequest<AuthTokens>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export function fetchCurrentUser(accessToken: string) {
  return apiRequest<AuthUser>('/auth/me/', {
    method: 'GET',
    token: accessToken,
  })
}

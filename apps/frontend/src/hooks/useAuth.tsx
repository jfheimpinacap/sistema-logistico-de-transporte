import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { fetchCurrentUser, loginRequest } from '../services/authService'
import type { AuthTokens, AuthUser, LoginCredentials } from '../types/auth'

const ACCESS_TOKEN_KEY = 'slt_access_token'
const REFRESH_TOKEN_KEY = 'slt_refresh_token'

type AuthContextValue = {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  reloadUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function getStoredTokens(): AuthTokens | null {
  const access = localStorage.getItem(ACCESS_TOKEN_KEY)
  const refresh = localStorage.getItem(REFRESH_TOKEN_KEY)

  if (!access || !refresh) {
    return null
  }

  return { access, refresh }
}

function persistTokens(tokens: AuthTokens) {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access)
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh)
}

function clearStoredTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => getStoredTokens()?.access ?? null)
  const [refreshToken, setRefreshToken] = useState<string | null>(() => getStoredTokens()?.refresh ?? null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    clearStoredTokens()
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
  }, [])

  const reloadUser = useCallback(async () => {
    if (!accessToken) {
      setUser(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const currentUser = await fetchCurrentUser(accessToken)
      setUser(currentUser)
    } catch {
      logout()
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, logout])

  const login = useCallback(async (credentials: LoginCredentials) => {
    const tokens = await loginRequest(credentials)
    persistTokens(tokens)
    setAccessToken(tokens.access)
    setRefreshToken(tokens.refresh)
    const currentUser = await fetchCurrentUser(tokens.access)
    setUser(currentUser)
  }, [])

  useEffect(() => {
    void reloadUser()
  }, [reloadUser])

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: Boolean(accessToken && user),
      isLoading,
      login,
      logout,
      reloadUser,
    }),
    [accessToken, isLoading, login, logout, refreshToken, reloadUser, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return context
}

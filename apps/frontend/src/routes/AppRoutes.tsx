import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { useAuth } from '../hooks/useAuth'
import { DashboardPage } from '../pages/DashboardPage'
import { HealthPage } from '../pages/HealthPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'

type RouterContextValue = {
  path: string
  navigate: (to: string, replace?: boolean) => void
}

const RouterContext = createContext<RouterContextValue | undefined>(undefined)

function normalizePath(path: string) {
  return path === '' ? '/' : path
}

export function useAppRouter() {
  const context = useContext(RouterContext)

  if (!context) {
    throw new Error('useAppRouter debe usarse dentro de AppRoutes')
  }

  return context
}

function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname))

  useEffect(() => {
    function handlePopState() {
      setPath(normalizePath(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const value = useMemo(
    () => ({
      path,
      navigate: (to: string, replace = false) => {
        const nextPath = normalizePath(to)
        if (replace) {
          window.history.replaceState(null, '', nextPath)
        } else {
          window.history.pushState(null, '', nextPath)
        }
        setPath(nextPath)
      },
    }),
    [path],
  )

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
}

function ProtectedShell() {
  const { accessToken, isAuthenticated, isLoading } = useAuth()
  const { navigate, path } = useAppRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', true)
    }
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading && accessToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Validando sesión...
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (path === '/') {
    return <AppLayout><DashboardPage /></AppLayout>
  }

  if (path === '/health') {
    return <AppLayout><HealthPage /></AppLayout>
  }

  return <AppLayout><NotFoundPage /></AppLayout>
}

function RedirectToDashboard() {
  const { navigate } = useAppRouter()

  useEffect(() => {
    navigate('/', true)
  }, [navigate])

  return null
}

function RouteSwitch() {
  const { path } = useAppRouter()
  const { isAuthenticated } = useAuth()

  if (path === '/login') {
    return isAuthenticated ? <RedirectToDashboard /> : <LoginPage />
  }

  return <ProtectedShell />
}

export function AppRoutes() {
  return (
    <RouterProvider>
      <RouteSwitch />
    </RouterProvider>
  )
}

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AppLayout } from '../components/layout/AppLayout'
import { useAuth } from '../hooks/useAuth'
import { DashboardPage } from '../pages/DashboardPage'
import { HealthPage } from '../pages/HealthPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { AddressesPage } from '../pages/masters/AddressesPage'
import { ContactsPage } from '../pages/masters/ContactsPage'
import { CustomersPage } from '../pages/masters/CustomersPage'
import { DriversPage } from '../pages/masters/DriversPage'
import { MastersHomePage } from '../pages/masters/MastersHomePage'
import { VehicleTypesPage } from '../pages/masters/VehicleTypesPage'
import { VehiclesPage } from '../pages/masters/VehiclesPage'
import { WarehousesPage } from '../pages/masters/WarehousesPage'
import { ZonesPage } from '../pages/masters/ZonesPage'
import { OperationsHomePage } from '../pages/operations/OperationsHomePage'
import { PackagesPage } from '../pages/operations/PackagesPage'
import { ShipmentsPage } from '../pages/operations/ShipmentsPage'
import { TrackingEventsPage } from '../pages/operations/TrackingEventsPage'
import { RoutesPage } from '../pages/routing/RoutesPage'

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

function renderProtectedPage(path: string) {
  switch (path) {
    case '/':
      return <DashboardPage />
    case '/health':
      return <HealthPage />
    case '/masters':
      return <MastersHomePage />
    case '/masters/customers':
      return <CustomersPage />
    case '/masters/contacts':
      return <ContactsPage />
    case '/masters/zones':
      return <ZonesPage />
    case '/masters/addresses':
      return <AddressesPage />
    case '/masters/warehouses':
      return <WarehousesPage />
    case '/masters/vehicle-types':
      return <VehicleTypesPage />
    case '/masters/vehicles':
      return <VehiclesPage />
    case '/masters/drivers':
      return <DriversPage />
    case '/operations':
      return <OperationsHomePage />
    case '/operations/shipments':
      return <ShipmentsPage />
    case '/operations/packages':
      return <PackagesPage />
    case '/operations/tracking':
      return <TrackingEventsPage />
    case '/operations/routes':
      return <RoutesPage />
    default:
      return <NotFoundPage />
  }
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

  return <AppLayout>{renderProtectedPage(path)}</AppLayout>
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

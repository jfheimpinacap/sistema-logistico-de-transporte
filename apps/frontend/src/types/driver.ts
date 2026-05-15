import type { DeliveryProof, Incident } from './fieldops'
import type { Package, Shipment } from './operations'
import type { Route, RouteShipment, RouteStop, RoutingId } from './routing'

export type DriverLocationSnapshot = {
  latitude: number
  longitude: number
  accuracy: number | null
  capturedAt: string
}

export type DriverActionState = 'idle' | 'loading' | 'success' | 'error'

export type DriverRouteView = Route & {
  driver_label?: string | null
  vehicle_label?: string | null
}

export type DriverStopView = RouteStop & {
  assigned_shipments_count?: number
}

export type DriverRouteWorkData = {
  route: Route
  stops: RouteStop[]
  routeShipments: RouteShipment[]
  shipments: Shipment[]
  packages: Package[]
  deliveryProofs: DeliveryProof[]
  incidents: Incident[]
}

export type DriverRouteListParams = {
  token: string
  search?: string
  status?: string
  driver?: RoutingId | ''
}

import { apiRequest } from './apiClient'
import { createDeliveryProof as createFieldDeliveryProof, createIncident as createFieldIncident, listDeliveryProofs, listIncidents } from './fieldOpsService'
import { getShipment, listPackages } from './operationsService'
import { changeRouteStatus, changeRouteStopStatus as changeRoutingStopStatus, getReadableRoutingError, getRoute, listRoutes, listRouteShipments, listRouteStops } from './routingService'
import type { DeliveryProofPayload, IncidentPayload } from '../types/fieldops'
import type { ChangeRouteStopStatusPayload, RouteStatus, RoutingId } from '../types/routing'
import type { DriverRouteListParams, DriverRouteWorkData, MyDriverRoutesResponse } from '../types/driver'


function buildDriverRouteQuery(params: Omit<DriverRouteListParams, 'token'> = {}) {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'all') return
    if (typeof value === 'string' && value.trim() === '') return
    searchParams.set(key, typeof value === 'boolean' ? String(value) : String(value).trim())
  })
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

const DRIVER_ROUTE_STATUSES: RouteStatus[] = ['assigned', 'loaded', 'in_progress', 'planned']

export function getReadableDriverError(error: unknown) {
  return getReadableRoutingError(error)
}


export async function listMyDriverRoutes(params: DriverRouteListParams): Promise<MyDriverRoutesResponse> {
  const { token, status, ...filters } = params
  const statusFilter = status && status !== 'all' ? { status } : {}
  return apiRequest<MyDriverRoutesResponse>(`/routes/my-routes/${buildDriverRouteQuery({ is_active: true, ...filters, ...statusFilter })}`, { token })
}

export async function listDriverRoutes(params: DriverRouteListParams) {
  const { token, status, ...filters } = params

  if (status && status !== 'all') {
    return listRoutes({ token, status, is_active: true, ...filters })
  }

  const routeGroups = await Promise.all(
    DRIVER_ROUTE_STATUSES.map((routeStatus) => listRoutes({ token, status: routeStatus, is_active: true, ...filters })),
  )
  const uniqueRoutes = new Map<RoutingId, Awaited<ReturnType<typeof listRoutes>>[number]>()
  routeGroups.flat().forEach((route) => uniqueRoutes.set(route.id, route))

  return Array.from(uniqueRoutes.values()).sort((left, right) => `${left.route_date}-${left.route_code}`.localeCompare(`${right.route_date}-${right.route_code}`))
}

export async function getRouteWorkData(routeId: RoutingId, token: string): Promise<DriverRouteWorkData> {
  const [route, stops, routeShipments, deliveryProofs, incidents] = await Promise.all([
    getRoute(routeId, token),
    listRouteStops({ token, route: routeId, is_active: true }),
    listRouteShipments({ token, route: routeId, is_active: true }),
    listDeliveryProofs({ token, route: routeId, is_active: 'all' }),
    listIncidents({ token, route: routeId, is_active: 'all' }),
  ])

  const shipmentIds = Array.from(new Set(routeShipments.map((item) => item.shipment).filter(Boolean)))
  const shipmentResults = await Promise.allSettled(shipmentIds.map((shipment) => getShipment(shipment, token)))
  const shipments = shipmentResults.flatMap((result) => (result.status === 'fulfilled' ? [result.value] : []))
  const packageResults = await Promise.allSettled(shipmentIds.map((shipment) => listPackages({ token, shipment, is_active: 'all' })))
  const packages = packageResults.flatMap((result) => (result.status === 'fulfilled' ? result.value : []))

  return {
    route,
    stops: [...stops].sort((left, right) => left.sequence - right.sequence),
    routeShipments,
    shipments,
    packages,
    deliveryProofs,
    incidents,
  }
}

export function startRoute(routeId: RoutingId, token: string) {
  return changeRouteStatus(routeId, { status: 'in_progress' }, token)
}

export function completeRoute(routeId: RoutingId, token: string) {
  return changeRouteStatus(routeId, { status: 'completed' }, token)
}

export function changeStopStatus(stopId: RoutingId, payload: ChangeRouteStopStatusPayload, token: string) {
  return changeRoutingStopStatus(stopId, payload, token)
}

export function createDeliveryProof(payload: DeliveryProofPayload, token: string) {
  return createFieldDeliveryProof(payload, token)
}

export function createIncident(payload: IncidentPayload, token: string) {
  return createFieldIncident(payload, token)
}

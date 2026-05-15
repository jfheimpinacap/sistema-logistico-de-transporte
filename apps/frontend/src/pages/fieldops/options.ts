import { listMasterData } from '../../services/masterDataService'
import { listPackages, listShipments } from '../../services/operationsService'
import { listRoutes, listRouteShipments, listRouteStops } from '../../services/routingService'
import type { FieldOpsFormOptions } from '../../components/fieldops/formTypes'

export async function loadFieldOpsOptions(token: string): Promise<FieldOpsFormOptions> {
  const [shipments, packagesData, routes, routeStops, routeShipments, drivers, vehicles] = await Promise.all([
    listShipments({ token, is_active: 'all' }),
    listPackages({ token, is_active: 'all' }),
    listRoutes({ token, is_active: 'all' }),
    listRouteStops({ token, is_active: 'all' }),
    listRouteShipments({ token, is_active: 'all' }),
    listMasterData('drivers', { token, activeFilter: 'all' }),
    listMasterData('vehicles', { token, activeFilter: 'all' }),
  ])
  return {
    shipments: shipments.map((shipment) => ({ value: shipment.id, label: `${shipment.tracking_code} · ${shipment.recipient_name ?? 'sin receptor'}` })),
    packages: packagesData.map((pkg) => ({ value: pkg.id, label: pkg.package_code })),
    routes: routes.map((route) => ({ value: route.id, label: `${route.route_code} · ${route.name}` })),
    routeStops: routeStops.map((stop) => ({ value: stop.id, label: `#${stop.sequence} · ${stop.address_label ?? stop.route_name_or_code ?? 'parada'}` })),
    routeShipments: routeShipments.map((assignment) => ({ value: assignment.id, label: `${assignment.shipment_tracking_code ?? assignment.shipment} · parada ${assignment.stop_sequence ?? '—'}` })),
    drivers: drivers.map((driver) => ({ value: driver.id, label: `${driver.first_name} ${driver.last_name}`.trim() })),
    vehicles: vehicles.map((vehicle) => ({ value: vehicle.id, label: vehicle.plate_number })),
  }
}

export const emptyFieldOpsOptions: FieldOpsFormOptions = { shipments: [], packages: [], routes: [], routeStops: [], routeShipments: [], drivers: [], vehicles: [] }

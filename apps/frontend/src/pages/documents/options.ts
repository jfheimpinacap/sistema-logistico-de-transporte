import { listDeliveryProofs, listIncidents } from '../../services/fieldOpsService'
import { listMasterData } from '../../services/masterDataService'
import { listPackages, listShipments } from '../../services/operationsService'
import { listRoutes, listRouteStops } from '../../services/routingService'
import type { DocumentFormOptions } from '../../components/documents/formOptions'
import { emptyDocumentFormOptions } from '../../components/documents/formOptions'

export { emptyDocumentFormOptions }

export async function loadDocumentOptions(token: string): Promise<DocumentFormOptions> {
  const [customers, routes, shipments, warehouses, drivers, vehicles, deliveryProofs, incidents, packagesData, routeStops] = await Promise.all([
    listMasterData('customers', { token, activeFilter: 'all' }),
    listRoutes({ token, is_active: 'all' }),
    listShipments({ token, is_active: 'all' }),
    listMasterData('warehouses', { token, activeFilter: 'all' }),
    listMasterData('drivers', { token, activeFilter: 'all' }),
    listMasterData('vehicles', { token, activeFilter: 'all' }),
    listDeliveryProofs({ token, is_active: 'all' }),
    listIncidents({ token, is_active: 'all' }),
    listPackages({ token, is_active: 'all' }),
    listRouteStops({ token, is_active: 'all' }),
  ])

  return {
    customers: customers.map((customer) => ({ value: customer.id, label: customer.name })),
    routes: routes.map((route) => ({ value: route.id, label: `${route.route_code} · ${route.name}` })),
    shipments: shipments.map((shipment) => ({ value: shipment.id, label: `${shipment.tracking_code} · ${shipment.recipient_name ?? 'sin receptor'}` })),
    warehouses: warehouses.map((warehouse) => ({ value: warehouse.id, label: `${warehouse.code ? `${warehouse.code} · ` : ''}${warehouse.name}` })),
    drivers: drivers.map((driver) => ({ value: driver.id, label: `${driver.first_name} ${driver.last_name}`.trim() })),
    vehicles: vehicles.map((vehicle) => ({ value: vehicle.id, label: vehicle.plate_number })),
    deliveryProofs: deliveryProofs.map((proof) => ({ value: proof.id, label: `${proof.shipment_tracking_code ?? 'sin encomienda'} · ${proof.proof_type} · ${proof.status}` })),
    incidents: incidents.map((incident) => ({ value: incident.id, label: `${incident.incident_code ?? `#${incident.id}`} · ${incident.title}` })),
    packages: packagesData.map((pkg) => ({ value: pkg.id, label: pkg.package_code })),
    routeStops: routeStops.map((stop) => ({ value: stop.id, label: `#${stop.sequence} · ${stop.address_label ?? stop.route_name_or_code ?? 'parada'}` })),
  }
}

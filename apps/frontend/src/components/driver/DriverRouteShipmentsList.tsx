import type { Shipment } from '../../types/operations'
import type { RouteShipment, RoutingId } from '../../types/routing'
import { labelFor, routeShipmentStatusLabels, statusPillClass } from './driverLabels'

type DriverRouteShipmentsListProps = {
  routeShipments: RouteShipment[]
  shipments: Shipment[]
  selectedStopId?: RoutingId | null
  selectedRouteShipmentId?: RoutingId | null
  onSelectRouteShipment: (routeShipment: RouteShipment) => void
}

export function DriverRouteShipmentsList({ routeShipments, shipments, selectedStopId, selectedRouteShipmentId, onSelectRouteShipment }: DriverRouteShipmentsListProps) {
  const filtered = selectedStopId ? routeShipments.filter((item) => String(item.stop) === String(selectedStopId)) : routeShipments
  const shipmentMap = new Map(shipments.map((shipment) => [String(shipment.id), shipment]))

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-950">Encomiendas asignadas</h3>
          <p className="text-sm text-slate-600">{selectedStopId ? 'Mostrando encomiendas de la parada seleccionada.' : 'Mostrando encomiendas generales de la ruta.'}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{filtered.length}</span>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No hay encomiendas asociadas a esta parada. Si corresponde, revisa asignaciones en Operación logística &gt; Rutas.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((item) => {
            const shipment = shipmentMap.get(String(item.shipment))
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => onSelectRouteShipment(item)}
                className={`w-full rounded-2xl border p-4 text-left transition hover:border-slate-400 ${String(selectedRouteShipmentId) === String(item.id) ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-950">{item.shipment_tracking_code || shipment?.tracking_code || `Encomienda #${item.shipment}`}</p>
                    <p className="mt-1 text-sm text-slate-600">Destinatario: {item.shipment_recipient_name || shipment?.recipient_name || 'Sin dato'}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${statusPillClass(String(item.status))}`}>{labelFor(routeShipmentStatusLabels, String(item.status))}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">Parada: {item.stop_sequence ?? item.stop ?? 'Sin parada asignada'}</p>
                {item.notes ? <p className="mt-2 rounded-xl bg-slate-50 p-2 text-sm text-slate-600">{item.notes}</p> : null}
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}

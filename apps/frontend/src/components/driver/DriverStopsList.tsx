import type { RouteShipment, RouteStop, RouteStopStatus } from '../../types/routing'
import { DriverStopCard } from './DriverStopCard'

type DriverStopsListProps = {
  stops: RouteStop[]
  routeShipments: RouteShipment[]
  selectedStopId?: string | number | null
  isBusy?: boolean
  onSelectStop: (stop: RouteStop) => void
  onChangeStopStatus: (stop: RouteStop, status: RouteStopStatus) => void
}

export function DriverStopsList({ stops, routeShipments, selectedStopId, isBusy = false, onSelectStop, onChangeStopStatus }: DriverStopsListProps) {
  if (stops.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-sm">
        <h3 className="text-lg font-black text-slate-950">Ruta sin paradas</h3>
        <p className="mt-2">Esta ruta aún no tiene paradas registradas. Revisa la planificación en Operación logística &gt; Rutas antes de operar.</p>
      </div>
    )
  }

  return (
    <section className="space-y-3">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-lg font-black text-slate-950">Paradas en orden</h3>
        <p className="mt-1 text-sm text-slate-600">Toca “Ver detalle” para enfocar encomiendas, evidencia e incidencias de una parada.</p>
      </div>
      {stops.map((stop) => (
        <DriverStopCard
          key={stop.id}
          stop={stop}
          isSelected={String(selectedStopId) === String(stop.id)}
          isBusy={isBusy}
          shipmentCount={routeShipments.filter((item) => String(item.stop) === String(stop.id)).length}
          onSelect={onSelectStop}
          onChangeStatus={onChangeStopStatus}
        />
      ))}
    </section>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { DriverActionBar } from '../../components/driver/DriverActionBar'
import { DriverDeliveryProofForm } from '../../components/driver/DriverDeliveryProofForm'
import { DriverIncidentForm } from '../../components/driver/DriverIncidentForm'
import { DriverRouteShipmentsList } from '../../components/driver/DriverRouteShipmentsList'
import { DriverRouteSummary } from '../../components/driver/DriverRouteSummary'
import { DriverStopDetail } from '../../components/driver/DriverStopDetail'
import { DriverStopsList } from '../../components/driver/DriverStopsList'
import { changeStopStatus, completeRoute, getReadableDriverError, getRouteWorkData, startRoute } from '../../services/driverService'
import type { DriverRouteWorkData } from '../../types/driver'
import type { Route, RouteShipment, RouteStop, RouteStopStatus, RoutingId } from '../../types/routing'

type DriverRoutePanelProps = {
  token: string
  route: Route
  onBack: () => void
}

export function DriverRoutePanel({ token, route: initialRoute, onBack }: DriverRoutePanelProps) {
  const [data, setData] = useState<DriverRouteWorkData | null>(null)
  const [selectedStopId, setSelectedStopId] = useState<RoutingId | null>(null)
  const [selectedRouteShipment, setSelectedRouteShipment] = useState<RouteShipment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isBusy, setIsBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function loadData(routeId: RoutingId = initialRoute.id) {
    setIsLoading(true)
    setError(null)
    try {
      const workData = await getRouteWorkData(routeId, token)
      setData(workData)
      setSelectedStopId((current) => current ?? workData.stops[0]?.id ?? null)
    } catch (err) {
      setError(getReadableDriverError(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData(initialRoute.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRoute.id, token])

  const route = data?.route ?? initialRoute
  const selectedStop = useMemo(() => data?.stops.find((stop) => String(stop.id) === String(selectedStopId)) ?? null, [data?.stops, selectedStopId])

  async function runRouteAction(action: 'start' | 'complete') {
    setIsBusy(true)
    setError(null)
    setNotice(null)
    try {
      if (action === 'start') {
        await startRoute(route.id, token)
        setNotice('Ruta iniciada correctamente.')
      } else {
        await completeRoute(route.id, token)
        setNotice('Ruta completada correctamente.')
      }
      await loadData(route.id)
    } catch (err) {
      setError(getReadableDriverError(err))
    } finally {
      setIsBusy(false)
    }
  }

  async function handleStopStatus(stop: RouteStop, status: RouteStopStatus) {
    setIsBusy(true)
    setError(null)
    setNotice(null)
    try {
      await changeStopStatus(stop.id, { status }, token)
      setNotice('Estado de parada actualizado.')
      setSelectedStopId(stop.id)
      await loadData(route.id)
    } catch (err) {
      setError(getReadableDriverError(err))
    } finally {
      setIsBusy(false)
    }
  }

  if (isLoading && !data) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">Cargando ruta conductor...</div>
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-6">
      {error ? <p className="rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700">{error}</p> : null}
      {notice ? <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">{notice}</p> : null}

      <DriverRouteSummary route={route} />
      <DriverActionBar route={route} isBusy={isBusy} onBack={onBack} onStart={() => void runRouteAction('start')} onComplete={() => void runRouteAction('complete')} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <DriverStopsList
          stops={data?.stops ?? []}
          routeShipments={data?.routeShipments ?? []}
          selectedStopId={selectedStopId}
          isBusy={isBusy}
          onSelectStop={(stop) => {
            setSelectedStopId(stop.id)
            setSelectedRouteShipment(null)
          }}
          onChangeStopStatus={handleStopStatus}
        />

        <div className="space-y-4">
          <DriverStopDetail stop={selectedStop} />
          <DriverRouteShipmentsList
            routeShipments={data?.routeShipments ?? []}
            shipments={data?.shipments ?? []}
            selectedStopId={selectedStopId}
            selectedRouteShipmentId={selectedRouteShipment?.id ?? null}
            onSelectRouteShipment={setSelectedRouteShipment}
          />
          <DriverDeliveryProofForm
            token={token}
            route={route}
            selectedStop={selectedStop}
            selectedRouteShipment={selectedRouteShipment}
            routeShipments={data?.routeShipments ?? []}
            shipments={data?.shipments ?? []}
            packages={data?.packages ?? []}
            onSaved={() => void loadData(route.id)}
          />
          <DriverIncidentForm
            token={token}
            route={route}
            selectedStop={selectedStop}
            selectedRouteShipment={selectedRouteShipment}
            routeShipments={data?.routeShipments ?? []}
            shipments={data?.shipments ?? []}
            packages={data?.packages ?? []}
            onSaved={() => void loadData(route.id)}
          />
        </div>
      </div>
    </div>
  )
}

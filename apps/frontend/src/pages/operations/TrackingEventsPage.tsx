import { useCallback, useEffect, useState } from 'react'
import { shipmentStatusOptions } from '../../components/operations/OperationStatusBadge'
import { TrackingTimeline } from '../../components/operations/TrackingTimeline'
import { useAuth } from '../../hooks/useAuth'
import { useAppRouter } from '../../routes/AppRoutes'
import { getReadableOperationError, listShipments, listTrackingEvents } from '../../services/operationsService'
import type { SelectOption } from '../../types/masterData'
import type { Shipment, TrackingEvent } from '../../types/operations'

export function TrackingEventsPage() {
  const { accessToken, logout } = useAuth()
  const { navigate } = useAppRouter()
  const [events, setEvents] = useState<TrackingEvent[]>([])
  const [shipmentOptions, setShipmentOptions] = useState<SelectOption[]>([])
  const [shipmentFilter, setShipmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAuthError = useCallback((message: string) => {
    if (message.includes('sesión expiró')) {
      logout()
      navigate('/login', true)
    }
  }, [logout, navigate])

  const loadShipments = useCallback(async () => {
    if (!accessToken) return
    try {
      const shipments = await listShipments({ token: accessToken, is_active: 'all' })
      setShipmentOptions((shipments as Shipment[]).map((shipment) => ({ value: shipment.id, label: `${shipment.tracking_code} · ${shipment.recipient_name}` })))
    } catch (err) {
      const message = getReadableOperationError(err)
      setError(message)
      handleAuthError(message)
    }
  }, [accessToken, handleAuthError])

  const loadEvents = useCallback(async () => {
    if (!accessToken) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await listTrackingEvents({ token: accessToken, shipment: shipmentFilter, status: statusFilter })
      setEvents(data)
    } catch (err) {
      const message = getReadableOperationError(err)
      setError(message)
      handleAuthError(message)
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, handleAuthError, shipmentFilter, statusFilter])

  useEffect(() => { void loadShipments() }, [loadShipments])
  useEffect(() => { void loadEvents() }, [loadEvents])

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950">Tracking</h2>
        <p className="mt-1 text-sm text-slate-500">Consulta eventos de tracking. En esta etapa los eventos no se eliminan desde la UI.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <select value={shipmentFilter} onChange={(event: any) => setShipmentFilter(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="">Todas las encomiendas</option>{shipmentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          <select value={statusFilter} onChange={(event: any) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="">Todos los estados</option>{shipmentStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        </div>
      </section>

      <TrackingTimeline events={events} isLoading={isLoading} error={error} />
    </div>
  )
}

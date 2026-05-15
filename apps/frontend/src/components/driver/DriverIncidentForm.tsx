import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createIncident, getReadableDriverError } from '../../services/driverService'
import type { DriverLocationSnapshot } from '../../types/driver'
import type { IncidentCategory, IncidentPayload, IncidentSeverity } from '../../types/fieldops'
import type { Package, Shipment } from '../../types/operations'
import type { Route, RouteShipment, RouteStop } from '../../types/routing'
import { DriverLocationButton } from './DriverLocationButton'

type DriverIncidentFormProps = {
  token: string
  route: Route
  selectedStop: RouteStop | null
  selectedRouteShipment: RouteShipment | null
  routeShipments: RouteShipment[]
  shipments: Shipment[]
  packages: Package[]
  onSaved: () => void
}

const categories: Array<{ value: IncidentCategory; label: string }> = [
  { value: 'customer_absent', label: 'Cliente ausente' },
  { value: 'wrong_address', label: 'Dirección incorrecta' },
  { value: 'damaged_package', label: 'Bulto dañado' },
  { value: 'rejected_by_recipient', label: 'Rechazado por destinatario' },
  { value: 'inaccessible_zone', label: 'Zona inaccesible' },
  { value: 'vehicle_issue', label: 'Problema de vehículo' },
  { value: 'partial_delivery', label: 'Entrega parcial' },
  { value: 'rescheduled', label: 'Reprogramada' },
  { value: 'returned_to_warehouse', label: 'Retorno a bodega' },
  { value: 'lost_package', label: 'Bulto perdido' },
  { value: 'other', label: 'Otra' },
]

const severities: Array<{ value: IncidentSeverity; label: string }> = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'critical', label: 'Crítica' },
]

function compactPayload(payload: IncidentPayload): IncidentPayload {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ''))
}

function nowForInput() {
  return new Date().toISOString().slice(0, 16)
}

export function DriverIncidentForm({ token, route, selectedStop, selectedRouteShipment, routeShipments, shipments, packages, onSaved }: DriverIncidentFormProps) {
  const defaultRouteShipment = selectedRouteShipment ?? routeShipments.find((item) => !selectedStop || String(item.stop) === String(selectedStop.id)) ?? null
  const [routeShipmentId, setRouteShipmentId] = useState(defaultRouteShipment ? String(defaultRouteShipment.id) : '')
  const selectedAssignment = useMemo(() => routeShipments.find((item) => String(item.id) === routeShipmentId) ?? defaultRouteShipment, [defaultRouteShipment, routeShipmentId, routeShipments])
  const shipmentId = selectedAssignment?.shipment ? String(selectedAssignment.shipment) : ''
  const shipmentPackages = packages.filter((item) => shipmentId && String(item.shipment) === shipmentId)
  const [packageId, setPackageId] = useState('')
  const [category, setCategory] = useState<IncidentCategory>('other')
  const [severity, setSeverity] = useState<IncidentSeverity>('medium')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [locationText, setLocationText] = useState('')
  const [occurredAt, setOccurredAt] = useState(nowForInput())
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)
  const [location, setLocation] = useState<DriverLocationSnapshot | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)
    setError(null)
    setMessage(null)
    try {
      await createIncident(
        compactPayload({
          shipment: shipmentId,
          package: packageId,
          route: route.id,
          route_stop: selectedStop?.id,
          route_shipment: selectedAssignment?.id,
          driver: route.driver ?? undefined,
          vehicle: route.vehicle ?? undefined,
          category,
          severity,
          title,
          description,
          location_text: locationText,
          latitude: location?.latitude,
          longitude: location?.longitude,
          evidence_file: evidenceFile ?? undefined,
          occurred_at: occurredAt ? new Date(occurredAt).toISOString() : undefined,
        }),
        token,
      )
      setMessage('Incidencia guardada. Queda abierta para gestión operativa.')
      setTitle('')
      setDescription('')
      setEvidenceFile(null)
      onSaved()
    } catch (err) {
      setError(getReadableDriverError(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-black text-slate-950">Registrar incidencia</h3>
      <p className="mt-1 text-sm text-slate-600">Registra excepciones operativas sin bloquear el avance de la ruta.</p>

      <div className="mt-4 space-y-3">
        <label className="block text-sm font-bold text-slate-700">Encomienda opcional
          <select value={routeShipmentId} onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setRouteShipmentId(event.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm">
            <option value="">Sin encomienda específica</option>
            {routeShipments.map((item) => {
              const shipment = shipments.find((record) => String(record.id) === String(item.shipment))
              return <option key={item.id} value={String(item.id)}>{item.shipment_tracking_code || shipment?.tracking_code || `Encomienda #${item.shipment}`}</option>
            })}
          </select>
        </label>
        <label className="block text-sm font-bold text-slate-700">Bulto opcional
          <select value={packageId} onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setPackageId(event.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm">
            <option value="">Sin bulto específico</option>
            {shipmentPackages.map((item) => <option key={item.id} value={String(item.id)}>{item.package_code}</option>)}
          </select>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-bold text-slate-700">Categoría<select value={category} onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setCategory(event.target.value as IncidentCategory)} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm">{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label className="block text-sm font-bold text-slate-700">Severidad<select value={severity} onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setSeverity(event.target.value as IncidentSeverity)} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm">{severities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        </div>
        <label className="block text-sm font-bold text-slate-700">Título<input value={title} onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setTitle(event.target.value)} required className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm" /></label>
        <label className="block text-sm font-bold text-slate-700">Descripción<textarea value={description} onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setDescription(event.target.value)} rows={3} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm" /></label>
        <label className="block text-sm font-bold text-slate-700">Archivo evidencia opcional<input type="file" accept="image/*,.pdf" onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setEvidenceFile(event.currentTarget.files?.[0] ?? null)} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm" /></label>
        <DriverLocationButton onCaptured={setLocation} />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-bold text-slate-700">Lugar texto<input value={locationText} onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setLocationText(event.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm" /></label>
          <label className="block text-sm font-bold text-slate-700">Ocurrió en<input type="datetime-local" value={occurredAt} onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setOccurredAt(event.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm" /></label>
        </div>
      </div>

      {location ? <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">GPS: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)} · precisión {Math.round(location.accuracy ?? 0)} m</p> : null}
      {message ? <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-3 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      <button type="submit" disabled={isSaving || !title.trim()} className="mt-4 w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-black text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300">
        {isSaving ? 'Guardando incidencia...' : 'Guardar incidencia'}
      </button>
    </form>
  )
}

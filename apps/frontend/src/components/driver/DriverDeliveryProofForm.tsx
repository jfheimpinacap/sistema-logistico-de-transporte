import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { createDeliveryProof, getReadableDriverError } from '../../services/driverService'
import type { DriverLocationSnapshot } from '../../types/driver'
import type { DeliveryProofPayload } from '../../types/fieldops'
import type { Package, Shipment } from '../../types/operations'
import type { Route, RouteShipment, RouteStop } from '../../types/routing'
import { DriverLocationButton } from './DriverLocationButton'

type DriverDeliveryProofFormProps = {
  token: string
  route: Route
  selectedStop: RouteStop | null
  selectedRouteShipment: RouteShipment | null
  routeShipments: RouteShipment[]
  shipments: Shipment[]
  packages: Package[]
  onSaved: () => void
}

function compactPayload(payload: DeliveryProofPayload): DeliveryProofPayload {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ''))
}

function nowForInput() {
  return new Date().toISOString().slice(0, 16)
}

export function DriverDeliveryProofForm({ token, route, selectedStop, selectedRouteShipment, routeShipments, shipments, packages, onSaved }: DriverDeliveryProofFormProps) {
  const defaultRouteShipment = selectedRouteShipment ?? routeShipments.find((item) => !selectedStop || String(item.stop) === String(selectedStop.id)) ?? null
  const [routeShipmentId, setRouteShipmentId] = useState(defaultRouteShipment ? String(defaultRouteShipment.id) : '')
  const selectedAssignment = useMemo(() => routeShipments.find((item) => String(item.id) === routeShipmentId) ?? defaultRouteShipment, [defaultRouteShipment, routeShipmentId, routeShipments])
  const shipmentId = selectedAssignment?.shipment ? String(selectedAssignment.shipment) : ''
  const shipmentPackages = packages.filter((item) => shipmentId && String(item.shipment) === shipmentId)
  const [packageId, setPackageId] = useState('')
  const [proofType, setProofType] = useState<'delivery' | 'failed_delivery'>('delivery')
  const [receivedByName, setReceivedByName] = useState('')
  const [receivedByRut, setReceivedByRut] = useState('')
  const [relationship, setRelationship] = useState('')
  const [notes, setNotes] = useState('')
  const [signatureText, setSignatureText] = useState('')
  const [locationText, setLocationText] = useState('')
  const [capturedAt, setCapturedAt] = useState(nowForInput())
  const [photo, setPhoto] = useState<File | null>(null)
  const [signatureFile, setSignatureFile] = useState<File | null>(null)
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
      await createDeliveryProof(
        compactPayload({
          shipment: shipmentId,
          package: packageId,
          route: route.id,
          route_stop: selectedStop?.id,
          route_shipment: selectedAssignment?.id,
          proof_type: proofType,
          received_by_name: receivedByName,
          received_by_rut: receivedByRut,
          recipient_relationship: relationship,
          delivery_notes: notes,
          photo: photo ?? undefined,
          signature_file: signatureFile ?? undefined,
          signature_text: signatureText,
          latitude: location?.latitude,
          longitude: location?.longitude,
          location_accuracy_m: location?.accuracy ?? undefined,
          location_text: locationText,
          captured_at: capturedAt ? new Date(capturedAt).toISOString() : undefined,
        }),
        token,
      )
      setMessage('Evidencia guardada. Queda pendiente de revisión por supervisor.')
      setReceivedByName('')
      setReceivedByRut('')
      setRelationship('')
      setNotes('')
      setSignatureText('')
      setPhoto(null)
      setSignatureFile(null)
      onSaved()
    } catch (err) {
      setError(getReadableDriverError(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-black text-slate-950">Registrar evidencia</h3>
      <p className="mt-1 text-sm text-slate-600">No acepta automáticamente la entrega; la revisión queda en el panel de supervisor.</p>

      <div className="mt-4 space-y-3">
        <label className="block text-sm font-bold text-slate-700">Encomienda
          <select value={routeShipmentId} onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setRouteShipmentId(event.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm">
            <option value="">Selecciona una encomienda</option>
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
        <label className="block text-sm font-bold text-slate-700">Tipo de evidencia
          <select value={proofType} onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setProofType(event.target.value as 'delivery' | 'failed_delivery')} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm">
            <option value="delivery">Entrega realizada</option>
            <option value="failed_delivery">Entrega fallida</option>
          </select>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-bold text-slate-700">Recibido por<input value={receivedByName} onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setReceivedByName(event.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm" /></label>
          <label className="block text-sm font-bold text-slate-700">RUT<input value={receivedByRut} onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setReceivedByRut(event.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm" /></label>
        </div>
        <label className="block text-sm font-bold text-slate-700">Relación con destinatario<input value={relationship} onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setRelationship(event.target.value)} placeholder="Titular, familiar, conserjería..." className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm" /></label>
        <label className="block text-sm font-bold text-slate-700">Notas<textarea value={notes} onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setNotes(event.target.value)} rows={3} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm" /></label>
        <label className="block text-sm font-bold text-slate-700">Firma textual<textarea value={signatureText} onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setSignatureText(event.target.value)} rows={2} placeholder="Nombre o texto de conformidad" className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm" /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-bold text-slate-700">Foto opcional<input type="file" accept="image/*" capture="environment" onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setPhoto(event.currentTarget.files?.[0] ?? null)} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm" /></label>
          <label className="block text-sm font-bold text-slate-700">Archivo firma opcional<input type="file" accept="image/*,.pdf" onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setSignatureFile(event.currentTarget.files?.[0] ?? null)} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm" /></label>
        </div>
        <DriverLocationButton onCaptured={setLocation} />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-bold text-slate-700">Lugar texto<input value={locationText} onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setLocationText(event.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm" /></label>
          <label className="block text-sm font-bold text-slate-700">Capturado en<input type="datetime-local" value={capturedAt} onChange={(event: { target: HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement; currentTarget: HTMLInputElement }) => setCapturedAt(event.target.value)} className="mt-1 w-full rounded-2xl border border-slate-200 px-3 py-3 text-sm" /></label>
        </div>
      </div>

      {location ? <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">GPS: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)} · precisión {Math.round(location.accuracy ?? 0)} m</p> : null}
      {message ? <p className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-3 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
      <button type="submit" disabled={isSaving || !shipmentId} className="mt-4 w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300">
        {isSaving ? 'Guardando evidencia...' : 'Guardar evidencia'}
      </button>
    </form>
  )
}

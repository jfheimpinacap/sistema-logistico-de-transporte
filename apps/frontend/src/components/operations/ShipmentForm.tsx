import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { priorityOptions, serviceTypeOptions } from './OperationStatusBadge'
import type { Shipment, ShipmentPayload } from '../../types/operations'
import type { SelectOption } from '../../types/masterData'

type Props = {
  title: string
  shipment?: Shipment | null
  customerOptions: SelectOption[]
  addressOptions: SelectOption[]
  warehouseOptions: SelectOption[]
  isSaving: boolean
  error?: string | null
  onSubmit: (payload: ShipmentPayload) => void
  onCancel: () => void
}

type FormState = {
  customer: string
  external_reference: string
  origin_address: string
  destination_address: string
  origin_warehouse: string
  sender_name: string
  sender_phone: string
  sender_email: string
  recipient_name: string
  recipient_phone: string
  recipient_email: string
  description: string
  package_count: string
  total_weight_kg: string
  total_volume_m3: string
  priority: string
  service_type: string
  requested_delivery_date: string
  delivery_window_start: string
  delivery_window_end: string
  notes: string
  is_active: boolean
}

function toLocalDateTime(value?: string | null) {
  return value ? value.slice(0, 16) : ''
}

function initialState(shipment?: Shipment | null): FormState {
  return {
    customer: shipment?.customer ? String(shipment.customer) : '',
    external_reference: shipment?.external_reference ?? '',
    origin_address: shipment?.origin_address ? String(shipment.origin_address) : '',
    destination_address: shipment?.destination_address ? String(shipment.destination_address) : '',
    origin_warehouse: shipment?.origin_warehouse ? String(shipment.origin_warehouse) : '',
    sender_name: shipment?.sender_name ?? '',
    sender_phone: shipment?.sender_phone ?? '',
    sender_email: shipment?.sender_email ?? '',
    recipient_name: shipment?.recipient_name ?? '',
    recipient_phone: shipment?.recipient_phone ?? '',
    recipient_email: shipment?.recipient_email ?? '',
    description: shipment?.description ?? '',
    package_count: String(shipment?.package_count ?? 1),
    total_weight_kg: shipment?.total_weight_kg ? String(shipment.total_weight_kg) : '',
    total_volume_m3: shipment?.total_volume_m3 ? String(shipment.total_volume_m3) : '',
    priority: shipment?.priority ?? 'standard',
    service_type: shipment?.service_type ?? 'delivery',
    requested_delivery_date: shipment?.requested_delivery_date ?? '',
    delivery_window_start: toLocalDateTime(shipment?.delivery_window_start),
    delivery_window_end: toLocalDateTime(shipment?.delivery_window_end),
    notes: shipment?.notes ?? '',
    is_active: shipment?.is_active ?? true,
  }
}

function cleanNullable(value: string) {
  return value.trim() === '' ? null : value.trim()
}

export function ShipmentForm({ title, shipment, customerOptions, addressOptions, warehouseOptions, isSaving, error, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(() => initialState(shipment))

  useEffect(() => {
    setForm(initialState(shipment))
  }, [shipment])

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({
      customer: cleanNullable(form.customer),
      external_reference: cleanNullable(form.external_reference),
      origin_address: cleanNullable(form.origin_address),
      destination_address: cleanNullable(form.destination_address),
      origin_warehouse: cleanNullable(form.origin_warehouse),
      sender_name: form.sender_name.trim(),
      sender_phone: form.sender_phone.trim(),
      sender_email: form.sender_email.trim(),
      recipient_name: form.recipient_name.trim(),
      recipient_phone: form.recipient_phone.trim(),
      recipient_email: form.recipient_email.trim(),
      description: form.description.trim(),
      package_count: Number(form.package_count || 1),
      total_weight_kg: cleanNullable(form.total_weight_kg),
      total_volume_m3: cleanNullable(form.total_volume_m3),
      priority: form.priority,
      service_type: form.service_type,
      requested_delivery_date: cleanNullable(form.requested_delivery_date),
      delivery_window_start: cleanNullable(form.delivery_window_start),
      delivery_window_end: cleanNullable(form.delivery_window_end),
      notes: form.notes.trim(),
      is_active: form.is_active,
    })
  }

  const inputClass = 'mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100'
  const missingMasters = customerOptions.length === 0 || addressOptions.length === 0 || warehouseOptions.length === 0

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-xl">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="text-lg font-bold text-slate-950">{title}</h3>
            {missingMasters ? <p className="mt-2 text-sm text-amber-700">Primero debes crear clientes/direcciones/bodegas en Maestros si necesitas asociarlos.</p> : null}
            {error ? <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}
          </div>

          <div className="grid gap-4 px-6 py-5 md:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-semibold text-slate-700">Cliente<select className={inputClass} value={form.customer} onChange={(event: any) => setField('customer', event.target.value)}><option value="">Sin cliente</option>{customerOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="text-sm font-semibold text-slate-700">Referencia externa<input className={inputClass} value={form.external_reference} onChange={(event: any) => setField('external_reference', event.target.value)} /></label>
            <label className="text-sm font-semibold text-slate-700">Bodega origen<select className={inputClass} value={form.origin_warehouse} onChange={(event: any) => setField('origin_warehouse', event.target.value)}><option value="">Sin bodega</option>{warehouseOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="text-sm font-semibold text-slate-700">Dirección origen<select className={inputClass} value={form.origin_address} onChange={(event: any) => setField('origin_address', event.target.value)}><option value="">Sin dirección</option>{addressOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="text-sm font-semibold text-slate-700">Dirección destino<select className={inputClass} value={form.destination_address} onChange={(event: any) => setField('destination_address', event.target.value)}><option value="">Sin dirección</option>{addressOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="text-sm font-semibold text-slate-700">Prioridad<select className={inputClass} value={form.priority} onChange={(event: any) => setField('priority', event.target.value)}>{priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="text-sm font-semibold text-slate-700">Tipo de servicio<select className={inputClass} value={form.service_type} onChange={(event: any) => setField('service_type', event.target.value)}>{serviceTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="text-sm font-semibold text-slate-700">Remitente *<input required className={inputClass} value={form.sender_name} onChange={(event: any) => setField('sender_name', event.target.value)} /></label>
            <label className="text-sm font-semibold text-slate-700">Teléfono remitente<input className={inputClass} value={form.sender_phone} onChange={(event: any) => setField('sender_phone', event.target.value)} /></label>
            <label className="text-sm font-semibold text-slate-700">Email remitente<input type="email" className={inputClass} value={form.sender_email} onChange={(event: any) => setField('sender_email', event.target.value)} /></label>
            <label className="text-sm font-semibold text-slate-700">Destinatario *<input required className={inputClass} value={form.recipient_name} onChange={(event: any) => setField('recipient_name', event.target.value)} /></label>
            <label className="text-sm font-semibold text-slate-700">Teléfono destinatario<input className={inputClass} value={form.recipient_phone} onChange={(event: any) => setField('recipient_phone', event.target.value)} /></label>
            <label className="text-sm font-semibold text-slate-700">Email destinatario<input type="email" className={inputClass} value={form.recipient_email} onChange={(event: any) => setField('recipient_email', event.target.value)} /></label>
            <label className="text-sm font-semibold text-slate-700">Cantidad bultos<input type="number" min="1" className={inputClass} value={form.package_count} onChange={(event: any) => setField('package_count', event.target.value)} /></label>
            <label className="text-sm font-semibold text-slate-700">Peso total kg<input type="number" step="0.01" className={inputClass} value={form.total_weight_kg} onChange={(event: any) => setField('total_weight_kg', event.target.value)} /></label>
            <label className="text-sm font-semibold text-slate-700">Volumen total m³<input type="number" step="0.0001" className={inputClass} value={form.total_volume_m3} onChange={(event: any) => setField('total_volume_m3', event.target.value)} /></label>
            <label className="text-sm font-semibold text-slate-700">Fecha entrega solicitada<input type="date" className={inputClass} value={form.requested_delivery_date} onChange={(event: any) => setField('requested_delivery_date', event.target.value)} /></label>
            <label className="text-sm font-semibold text-slate-700">Inicio ventana<input type="datetime-local" className={inputClass} value={form.delivery_window_start} onChange={(event: any) => setField('delivery_window_start', event.target.value)} /></label>
            <label className="text-sm font-semibold text-slate-700">Fin ventana<input type="datetime-local" className={inputClass} value={form.delivery_window_end} onChange={(event: any) => setField('delivery_window_end', event.target.value)} /></label>
            <label className="md:col-span-2 lg:col-span-3 text-sm font-semibold text-slate-700">Descripción<textarea rows={3} className={inputClass} value={form.description} onChange={(event: any) => setField('description', event.target.value)} /></label>
            <label className="md:col-span-2 lg:col-span-3 text-sm font-semibold text-slate-700">Notas<textarea rows={3} className={inputClass} value={form.notes} onChange={(event: any) => setField('notes', event.target.value)} /></label>
            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.is_active} onChange={(event: any) => setField('is_active', event.target.checked)} />Registro activo</label>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancelar</button>
            <button type="submit" disabled={isSaving} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-400">{isSaving ? 'Guardando...' : 'Guardar encomienda'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

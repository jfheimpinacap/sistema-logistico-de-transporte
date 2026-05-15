import { useState } from 'react'
import type { FormEvent } from 'react'
import { shipmentStatusOptions } from './OperationStatusBadge'
import type { ChangeStatusPayload, Shipment, ShipmentStatus } from '../../types/operations'

type Props = {
  shipment: Shipment
  isSaving: boolean
  error?: string | null
  onSubmit: (payload: ChangeStatusPayload) => Promise<void> | void
}

export function ChangeStatusPanel({ shipment, isSaving, error, onSubmit }: Props) {
  const [status, setStatus] = useState<ShipmentStatus>((shipment.current_status as ShipmentStatus) || 'received')
  const [title, setTitle] = useState('Cambio manual de estado')
  const [description, setDescription] = useState('')
  const [locationText, setLocationText] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit({ status, title: title.trim(), description: description.trim(), location_text: locationText.trim() })
    setDescription('')
    setLocationText('')
  }

  const inputClass = 'mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100'

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-950">Cambiar estado</h3>
      <p className="mt-1 text-sm text-slate-500">Actualiza manualmente la encomienda {shipment.tracking_code} y registra un evento de tracking.</p>
      {error ? <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <label className="block text-sm font-semibold text-slate-700">Estado<select className={inputClass} value={status} onChange={(event: any) => setStatus(event.target.value as ShipmentStatus)}>{shipmentStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <label className="block text-sm font-semibold text-slate-700">Título<input required className={inputClass} value={title} onChange={(event: any) => setTitle(event.target.value)} /></label>
        <label className="block text-sm font-semibold text-slate-700">Descripción<textarea rows={3} className={inputClass} value={description} onChange={(event: any) => setDescription(event.target.value)} /></label>
        <label className="block text-sm font-semibold text-slate-700">Ubicación<input className={inputClass} value={locationText} onChange={(event: any) => setLocationText(event.target.value)} /></label>
        <button type="submit" disabled={isSaving} className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-400">{isSaving ? 'Guardando estado...' : 'Guardar cambio de estado'}</button>
      </form>
    </section>
  )
}

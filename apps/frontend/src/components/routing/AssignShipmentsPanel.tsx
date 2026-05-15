import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { listShipments } from '../../services/operationsService'
import type { Shipment } from '../../types/operations'
import type { AssignShipmentsPayload, RouteStop } from '../../types/routing'

type Props = { token: string; stops: RouteStop[]; isSaving: boolean; error?: string | null; onSubmit: (payload: AssignShipmentsPayload) => Promise<void> | void }
const blockedStatuses = new Set(['delivered', 'cancelled', 'returned'])
export function AssignShipmentsPanel({ token, stops, isSaving, error, onSubmit }: Props) {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [stopId, setStopId] = useState('')
  const [loadError, setLoadError] = useState<string | null>(null)
  useEffect(() => { async function load() { try { const data = await listShipments({ token, is_active: true }); setShipments(data); setLoadError(null) } catch { setLoadError('No fue posible cargar encomiendas disponibles.') } } void load() }, [token])
  const available = useMemo(() => shipments.filter((shipment) => !blockedStatuses.has(shipment.current_status) && shipment.is_active), [shipments])
  function toggle(id: number) { setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]) }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); await onSubmit({ shipment_ids: selectedIds, stop_id: stopId ? Number(stopId) : null }); setSelectedIds([]) }
  const inputClass = 'mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100'
  return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-lg font-bold text-slate-950">Asignar encomiendas</h3><p className="mt-1 text-sm text-slate-500">Selecciona encomiendas activas no entregadas ni canceladas y opcionalmente asígnalas a una parada.</p>{loadError ? <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">{loadError}</p> : null}{error ? <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}<form onSubmit={handleSubmit} className="mt-4 space-y-4"><label className="block text-sm font-semibold text-slate-700">Parada opcional<select className={inputClass} value={stopId} onChange={(event: any) => setStopId(event.target.value)}><option value="">Sin parada</option>{stops.map((stop) => <option key={stop.id} value={stop.id}>#{stop.sequence} · {stop.address_label || stop.contact_name || 'Parada'}</option>)}</select></label><div className="max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 p-3">{available.length === 0 ? <p className="text-sm text-slate-500">No hay encomiendas disponibles para asignar.</p> : available.map((shipment) => <label key={shipment.id} className="flex items-start gap-3 rounded-xl p-2 text-sm hover:bg-slate-50"><input type="checkbox" className="mt-1" checked={selectedIds.includes(Number(shipment.id))} onChange={() => toggle(Number(shipment.id))} /><span><span className="font-semibold text-slate-900">{shipment.tracking_code}</span><span className="block text-slate-500">{shipment.recipient_name} · {shipment.current_status}</span></span></label>)}</div><button type="submit" disabled={isSaving || selectedIds.length === 0} className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">{isSaving ? 'Asignando...' : `Asignar ${selectedIds.length} encomienda(s)`}</button></form></section>
}

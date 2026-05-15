import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { routeStopStatusOptions } from './RouteStopStatusBadge'
import type { ChangeRouteStopStatusPayload, RouteStop, RouteStopStatus } from '../../types/routing'

type Props = { stop: RouteStop; isSaving: boolean; error?: string | null; onSubmit: (payload: ChangeRouteStopStatusPayload) => Promise<void> | void; onCancel: () => void }
export function ChangeRouteStopStatusPanel({ stop, isSaving, error, onSubmit, onCancel }: Props) {
  const [status, setStatus] = useState<RouteStopStatus>((stop.status as RouteStopStatus) || 'pending')
  const [notes, setNotes] = useState('')
  useEffect(() => setStatus((stop.status as RouteStopStatus) || 'pending'), [stop])
  async function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); await onSubmit({ status, notes: notes.trim() }); setNotes('') }
  const inputClass = 'mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100'
  return <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4"><section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-5 shadow-xl"><h3 className="text-lg font-bold text-slate-950">Cambiar estado de parada #{stop.sequence}</h3>{error ? <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}<form onSubmit={handleSubmit} className="mt-4 space-y-3"><label className="block text-sm font-semibold text-slate-700">Estado<select className={inputClass} value={status} onChange={(event: any) => setStatus(event.target.value as RouteStopStatus)}>{routeStopStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label className="block text-sm font-semibold text-slate-700">Notas<textarea rows={3} className={inputClass} value={notes} onChange={(event: any) => setNotes(event.target.value)} /></label><div className="flex justify-end gap-3"><button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancelar</button><button type="submit" disabled={isSaving} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-400">{isSaving ? 'Guardando...' : 'Guardar estado'}</button></div></form></section></div>
}

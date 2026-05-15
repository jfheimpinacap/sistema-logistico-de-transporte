import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { routeStatusOptions } from './RouteStatusBadge'
import type { ChangeRouteStatusPayload, Route, RouteStatus } from '../../types/routing'

type Props = { route: Route; isSaving: boolean; error?: string | null; onSubmit: (payload: ChangeRouteStatusPayload) => Promise<void> | void }
export function ChangeRouteStatusPanel({ route, isSaving, error, onSubmit }: Props) {
  const [status, setStatus] = useState<RouteStatus>((route.status as RouteStatus) || 'draft')
  const [notes, setNotes] = useState('')
  useEffect(() => setStatus((route.status as RouteStatus) || 'draft'), [route])
  async function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); await onSubmit({ status, notes: notes.trim() }); setNotes('') }
  const inputClass = 'mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100'
  return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="text-lg font-bold text-slate-950">Cambiar estado de ruta</h3><p className="mt-1 text-sm text-slate-500">Actualiza el estado operativo de {route.route_code || route.name}.</p>{error ? <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}<form onSubmit={handleSubmit} className="mt-4 space-y-3"><label className="block text-sm font-semibold text-slate-700">Estado<select className={inputClass} value={status} onChange={(event: any) => setStatus(event.target.value as RouteStatus)}>{routeStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label className="block text-sm font-semibold text-slate-700">Notas<textarea rows={3} className={inputClass} value={notes} onChange={(event: any) => setNotes(event.target.value)} /></label><button type="submit" disabled={isSaving} className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-400">{isSaving ? 'Guardando...' : 'Guardar estado'}</button></form></section>
}

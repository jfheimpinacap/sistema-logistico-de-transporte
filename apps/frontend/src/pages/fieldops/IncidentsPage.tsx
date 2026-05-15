import { useEffect, useState } from 'react'
import { IncidentDetailPanel } from '../../components/fieldops/IncidentDetailPanel'
import { IncidentForm } from '../../components/fieldops/IncidentForm'
import { IncidentResolutionPanel } from '../../components/fieldops/IncidentResolutionPanel'
import { IncidentsTable } from '../../components/fieldops/IncidentsTable'
import { incidentCategoryOptions, incidentSeverityOptions, incidentStatusOptions } from '../../components/fieldops/badgeLabels'
import { useAuth } from '../../hooks/useAuth'
import { cancelIncident, createIncident, deleteIncident, getReadableFieldOpsError, listIncidents, resolveIncident, updateIncident } from '../../services/fieldOpsService'
import type { Incident, IncidentPayload } from '../../types/fieldops'
import { emptyFieldOpsOptions, loadFieldOpsOptions } from './options'

const fkKeys = ['shipment', 'package', 'route', 'route_stop', 'route_shipment', 'driver', 'vehicle']
function cleanPayload(payload: IncidentPayload) {
  const cleaned: IncidentPayload = { ...payload }
  fkKeys.forEach((key) => { if (cleaned[key] === '') cleaned[key] = null })
  ;['latitude', 'longitude'].forEach((key) => { if (cleaned[key] === '') cleaned[key] = null })
  if (typeof cleaned.occurred_at === 'string' && cleaned.occurred_at) cleaned.occurred_at = new Date(cleaned.occurred_at).toISOString()
  return cleaned
}

export function IncidentsPage() {
  const { accessToken } = useAuth()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [severity, setSeverity] = useState('')
  const [status, setStatus] = useState('')
  const [activeFilter, setActiveFilter] = useState<'true' | 'false' | 'all'>('true')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formIncident, setFormIncident] = useState<Incident | null | undefined>(undefined)
  const [detailIncident, setDetailIncident] = useState<Incident | null>(null)
  const [resolutionIncident, setResolutionIncident] = useState<Incident | null>(null)
  const [options, setOptions] = useState(emptyFieldOpsOptions)

  async function load() {
    if (!accessToken) return
    setIsLoading(true)
    try { const data = await listIncidents({ token: accessToken, search, category: category as never, severity: severity as never, status, is_active: activeFilter }); setIncidents(data); setError(null) } catch (err) { setError(getReadableFieldOpsError(err)) } finally { setIsLoading(false) }
  }
  useEffect(() => { void load() }, [accessToken, search, category, severity, status, activeFilter])
  useEffect(() => { if (accessToken) loadFieldOpsOptions(accessToken).then(setOptions).catch((err) => setError(getReadableFieldOpsError(err))) }, [accessToken])

  const save = async (payload: IncidentPayload) => {
    if (!accessToken) return
    setIsSubmitting(true)
    try { const cleaned = cleanPayload(payload); if (formIncident) await updateIncident(formIncident.id, cleaned, accessToken); else await createIncident(cleaned, accessToken); setMessage('Incidencia guardada correctamente.'); setFormIncident(undefined); await load() } catch (err) { setError(getReadableFieldOpsError(err)) } finally { setIsSubmitting(false) }
  }
  const resolveOrCancel = async (action: 'resolve' | 'cancel', resolution_notes: string) => {
    if (!accessToken || !resolutionIncident) return
    setIsSubmitting(true)
    try { if (action === 'resolve') await resolveIncident(resolutionIncident.id, { resolution_notes }, accessToken); else await cancelIncident(resolutionIncident.id, { resolution_notes }, accessToken); setMessage('Acción aplicada a la incidencia.'); setResolutionIncident(null); await load() } catch (err) { setError(getReadableFieldOpsError(err)) } finally { setIsSubmitting(false) }
  }
  const deactivate = async (incident: Incident) => { if (!accessToken || !window.confirm('¿Desactivar esta incidencia?')) return; try { await deleteIncident(incident.id, accessToken); setMessage('Incidencia desactivada.'); await load() } catch (err) { setError(getReadableFieldOpsError(err)) } }

  return <div className="space-y-5"><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700">Incidencias</span><h2 className="mt-3 text-3xl font-bold text-slate-950">Incidencias operativas</h2><p className="mt-2 text-slate-600">Registra, revisa, resuelve, cancela y desactiva excepciones del transporte.</p></div><button onClick={() => { setFormIncident(null); setDetailIncident(null); setResolutionIncident(null) }} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">Nueva incidencia</button></div></section>{message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}{error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}<section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-5"><input value={search} onChange={(e: { target: HTMLInputElement }) => setSearch(e.target.value)} placeholder="Buscar incidencia" className="rounded-xl border border-slate-200 px-3 py-2" /><select value={category} onChange={(e: { target: HTMLSelectElement }) => setCategory(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2"><option value="">Todas las categorías</option>{incidentCategoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><select value={severity} onChange={(e: { target: HTMLSelectElement }) => setSeverity(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2"><option value="">Todas las severidades</option>{incidentSeverityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><select value={status} onChange={(e: { target: HTMLSelectElement }) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2"><option value="">Todos los estados</option>{incidentStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><select value={activeFilter} onChange={(e: { target: HTMLSelectElement }) => setActiveFilter(e.target.value as never)} className="rounded-xl border border-slate-200 px-3 py-2"><option value="true">Activas</option><option value="false">Inactivas</option><option value="all">Todas</option></select></section>{formIncident !== undefined ? <IncidentForm incident={formIncident} options={options} onSubmit={save} onCancel={() => setFormIncident(undefined)} isSubmitting={isSubmitting} /> : null}{resolutionIncident ? <IncidentResolutionPanel incident={resolutionIncident} onResolve={(notes) => resolveOrCancel('resolve', notes)} onCancelIncident={(notes) => resolveOrCancel('cancel', notes)} onClose={() => setResolutionIncident(null)} isSubmitting={isSubmitting} /> : null}{detailIncident ? <IncidentDetailPanel incident={detailIncident} onClose={() => setDetailIncident(null)} /> : null}{isLoading ? <p className="text-slate-500">Cargando incidencias...</p> : <IncidentsTable incidents={incidents} onView={setDetailIncident} onEdit={(incident) => { setFormIncident(incident); setResolutionIncident(null); setDetailIncident(null) }} onResolve={setResolutionIncident} onCancel={setResolutionIncident} onDelete={deactivate} />}</div>
}

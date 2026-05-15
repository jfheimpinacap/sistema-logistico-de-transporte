import type { Incident } from '../../types/fieldops'
import { IncidentCategoryBadge } from './IncidentCategoryBadge'
import { IncidentSeverityBadge } from './IncidentSeverityBadge'
import { IncidentStatusBadge } from './IncidentStatusBadge'

type Props = { incidents: Incident[]; onView: (incident: Incident) => void; onEdit: (incident: Incident) => void; onResolve: (incident: Incident) => void; onCancel: (incident: Incident) => void; onDelete: (incident: Incident) => void }

export function IncidentsTable({ incidents, onView, onEdit, onResolve, onCancel, onDelete }: Props) {
  if (incidents.length === 0) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">No hay incidencias para los filtros seleccionados.</div>
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-200 text-sm">
      <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Código</th><th className="px-4 py-3">Categoría</th><th className="px-4 py-3">Severidad</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Título</th><th className="px-4 py-3">Encomienda</th><th className="px-4 py-3">Ruta</th><th className="px-4 py-3">Conductor</th><th className="px-4 py-3">Ocurrió</th><th className="px-4 py-3 text-right">Acciones</th></tr></thead>
      <tbody className="divide-y divide-slate-100">{incidents.map((incident) => <tr key={incident.id} className={!incident.is_active ? 'bg-slate-50 text-slate-400' : 'text-slate-700'}><td className="px-4 py-3 font-semibold text-slate-900">{incident.incident_code || `#${incident.id}`}</td><td className="px-4 py-3"><IncidentCategoryBadge category={incident.category} /></td><td className="px-4 py-3"><IncidentSeverityBadge severity={incident.severity} /></td><td className="px-4 py-3"><IncidentStatusBadge status={incident.status} /></td><td className="px-4 py-3">{incident.title}</td><td className="px-4 py-3">{incident.shipment_tracking_code ?? '—'}</td><td className="px-4 py-3">{incident.route_code ?? '—'}</td><td className="px-4 py-3">{incident.driver_name ?? '—'}</td><td className="px-4 py-3">{incident.occurred_at ? new Date(incident.occurred_at).toLocaleString() : '—'}</td><td className="px-4 py-3"><div className="flex flex-wrap justify-end gap-2"><button onClick={() => onView(incident)} className="text-cyan-700 hover:underline">Ver</button><button onClick={() => onEdit(incident)} className="text-slate-700 hover:underline">Editar</button><button onClick={() => onResolve(incident)} className="text-emerald-700 hover:underline">Resolver</button><button onClick={() => onCancel(incident)} className="text-rose-700 hover:underline">Cancelar</button><button onClick={() => onDelete(incident)} className="text-slate-500 hover:underline">Desactivar</button></div></td></tr>)}</tbody>
    </table></div></div>
  )
}

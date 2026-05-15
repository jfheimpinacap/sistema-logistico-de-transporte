import type { LogisticsDocument } from '../../types/documents'
import { DocumentStatusBadge } from './DocumentStatusBadge'
import { DocumentTypeBadge } from './DocumentTypeBadge'

type Props = {
  documents: LogisticsDocument[]
  isLoading?: boolean
  onView: (document: LogisticsDocument) => void
  onEdit: (document: LogisticsDocument) => void
  onIssue: (document: LogisticsDocument) => void
  onCancel: (document: LogisticsDocument) => void
  onArchive: (document: LogisticsDocument) => void
  onPrint: (document: LogisticsDocument) => void
  onDeactivate: (document: LogisticsDocument) => void
}

export function DocumentsTable({ documents, isLoading, onView, onEdit, onIssue, onCancel, onArchive, onPrint, onDeactivate }: Props) {
  if (isLoading) return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">Cargando documentos...</div>
  if (documents.length === 0) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-500">No hay documentos para los filtros seleccionados.</div>

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>{['Número', 'Tipo', 'Estado', 'Título', 'Fecha', 'Ruta', 'Encomienda', 'Cliente', 'Envíos', 'Bultos', 'Acciones'].map((header) => <th key={header} className="px-4 py-3">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {documents.map((document) => (
            <tr key={document.id} className={!document.is_active ? 'bg-slate-50 text-slate-400' : 'text-slate-700'}>
              <td className="px-4 py-3 font-semibold text-slate-900">{document.document_number || `#${document.id}`}</td>
              <td className="px-4 py-3"><DocumentTypeBadge type={document.document_type} label={document.document_type_label} /></td>
              <td className="px-4 py-3"><DocumentStatusBadge status={document.status} label={document.status_label} /></td>
              <td className="px-4 py-3">{document.title}</td>
              <td className="px-4 py-3">{document.issue_date ?? '—'}</td>
              <td className="px-4 py-3">{document.route_code ?? document.route_code_snapshot ?? '—'}</td>
              <td className="px-4 py-3">{document.shipment_tracking_code ?? document.shipment_tracking_code_snapshot ?? '—'}</td>
              <td className="px-4 py-3">{document.customer_name ?? document.customer_name_snapshot ?? '—'}</td>
              <td className="px-4 py-3">{document.total_shipments ?? '—'}</td>
              <td className="px-4 py-3">{document.total_packages ?? '—'}</td>
              <td className="px-4 py-3"><div className="flex min-w-72 flex-wrap gap-2">
                <button onClick={() => onView(document)} className="rounded-lg border border-slate-200 px-2 py-1 font-semibold">Ver detalle</button>
                <button onClick={() => onEdit(document)} className="rounded-lg border border-slate-200 px-2 py-1 font-semibold">Editar</button>
                <button onClick={() => onIssue(document)} className="rounded-lg border border-emerald-200 px-2 py-1 font-semibold text-emerald-700">Emitir</button>
                <button onClick={() => onCancel(document)} className="rounded-lg border border-rose-200 px-2 py-1 font-semibold text-rose-700">Anular</button>
                <button onClick={() => onArchive(document)} className="rounded-lg border border-amber-200 px-2 py-1 font-semibold text-amber-700">Archivar</button>
                <button onClick={() => onPrint(document)} className="rounded-lg border border-cyan-200 px-2 py-1 font-semibold text-cyan-700">Ver imprimible</button>
                <button onClick={() => onDeactivate(document)} className="rounded-lg border border-slate-200 px-2 py-1 font-semibold text-slate-500">Desactivar</button>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

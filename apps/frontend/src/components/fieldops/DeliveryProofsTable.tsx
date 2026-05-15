import type { DeliveryProof } from '../../types/fieldops'
import { DeliveryProofStatusBadge } from './DeliveryProofStatusBadge'
import { DeliveryProofTypeBadge } from './DeliveryProofTypeBadge'

type Props = {
  proofs: DeliveryProof[]
  onView: (proof: DeliveryProof) => void
  onEdit: (proof: DeliveryProof) => void
  onAccept: (proof: DeliveryProof) => void
  onReject: (proof: DeliveryProof) => void
  onDelete: (proof: DeliveryProof) => void
}

export function DeliveryProofsTable({ proofs, onView, onEdit, onAccept, onReject, onDelete }: Props) {
  if (proofs.length === 0) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">No hay evidencias para los filtros seleccionados.</div>
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Encomienda</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Estado</th><th className="px-4 py-3">Recibido por</th><th className="px-4 py-3">Ubicación</th><th className="px-4 py-3">Captura</th><th className="px-4 py-3">Creada por</th><th className="px-4 py-3 text-right">Acciones</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {proofs.map((proof) => (
              <tr key={proof.id} className={!proof.is_active ? 'bg-slate-50 text-slate-400' : 'text-slate-700'}>
                <td className="px-4 py-3 font-semibold text-slate-900">{proof.shipment_tracking_code ?? '—'}</td>
                <td className="px-4 py-3"><DeliveryProofTypeBadge type={proof.proof_type} /></td>
                <td className="px-4 py-3"><DeliveryProofStatusBadge status={proof.status} /></td>
                <td className="px-4 py-3">{proof.received_by_name || '—'}</td>
                <td className="px-4 py-3">{proof.location_text || '—'}</td>
                <td className="px-4 py-3">{proof.captured_at ? new Date(proof.captured_at).toLocaleString() : '—'}</td>
                <td className="px-4 py-3">{proof.created_by_name || '—'}</td>
                <td className="px-4 py-3"><div className="flex flex-wrap justify-end gap-2"><button onClick={() => onView(proof)} className="text-cyan-700 hover:underline">Ver</button><button onClick={() => onEdit(proof)} className="text-slate-700 hover:underline">Editar</button><button onClick={() => onAccept(proof)} className="text-emerald-700 hover:underline">Aceptar</button><button onClick={() => onReject(proof)} className="text-rose-700 hover:underline">Rechazar</button><button onClick={() => onDelete(proof)} className="text-slate-500 hover:underline">Desactivar</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

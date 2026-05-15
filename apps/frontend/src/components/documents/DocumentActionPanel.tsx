// @ts-nocheck
import { useState } from 'react'
import type { LogisticsDocument } from '../../types/documents'

type Action = 'issue' | 'cancel' | 'archive'
type Props = { document: LogisticsDocument; action: Action; isSubmitting?: boolean; onCancel: () => void; onSubmit: (action: Action, notes: string) => void }
const labels = { issue: 'Emitir documento interno', cancel: 'Anular documento', archive: 'Archivar documento' }
export function DocumentActionPanel({ document, action, isSubmitting, onCancel, onSubmit }: Props) {
  const [notes, setNotes] = useState('')
  return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-3 flex items-start justify-between"><div><h3 className="text-lg font-bold text-slate-950">{labels[action]}</h3><p className="text-sm text-slate-500">{document.document_number || `#${document.id}`} · {document.title}</p></div><button onClick={onCancel} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">Cerrar</button></div><p className="mb-3 rounded-2xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">Documento interno/provisorio. No válido como documento tributario SII.</p><textarea className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" placeholder="Notas de la acción" value={notes} onChange={(e) => setNotes(e.target.value)} /><div className="mt-3 flex gap-2"><button disabled={isSubmitting} onClick={() => onSubmit(action, notes)} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Confirmar</button><button onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold">Cancelar</button></div></section>
}

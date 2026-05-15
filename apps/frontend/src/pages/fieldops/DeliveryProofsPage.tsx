import { useEffect, useState } from 'react'
import { DeliveryProofDetailPanel } from '../../components/fieldops/DeliveryProofDetailPanel'
import { DeliveryProofForm } from '../../components/fieldops/DeliveryProofForm'
import { DeliveryProofReviewPanel } from '../../components/fieldops/DeliveryProofReviewPanel'
import { DeliveryProofsTable } from '../../components/fieldops/DeliveryProofsTable'
import { proofStatusOptions, proofTypeOptions } from '../../components/fieldops/badgeLabels'
import { useAuth } from '../../hooks/useAuth'
import { acceptDeliveryProof, createDeliveryProof, deleteDeliveryProof, getReadableFieldOpsError, listDeliveryProofs, rejectDeliveryProof, updateDeliveryProof } from '../../services/fieldOpsService'
import type { DeliveryProof, DeliveryProofPayload } from '../../types/fieldops'
import { emptyFieldOpsOptions, loadFieldOpsOptions } from './options'

const fkKeys = ['shipment', 'package', 'route', 'route_stop', 'route_shipment']
function cleanPayload(payload: DeliveryProofPayload) {
  const cleaned: DeliveryProofPayload = { ...payload }
  fkKeys.forEach((key) => { if (cleaned[key] === '') cleaned[key] = null })
  ;['latitude', 'longitude', 'location_accuracy_m'].forEach((key) => { if (cleaned[key] === '') cleaned[key] = null })
  if (typeof cleaned.captured_at === 'string' && cleaned.captured_at) cleaned.captured_at = new Date(cleaned.captured_at).toISOString()
  return cleaned
}

export function DeliveryProofsPage() {
  const { accessToken } = useAuth()
  const [proofs, setProofs] = useState<DeliveryProof[]>([])
  const [search, setSearch] = useState('')
  const [proofType, setProofType] = useState('')
  const [status, setStatus] = useState('')
  const [activeFilter, setActiveFilter] = useState<'true' | 'false' | 'all'>('true')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formProof, setFormProof] = useState<DeliveryProof | null | undefined>(undefined)
  const [detailProof, setDetailProof] = useState<DeliveryProof | null>(null)
  const [reviewProof, setReviewProof] = useState<DeliveryProof | null>(null)
  const [options, setOptions] = useState(emptyFieldOpsOptions)

  async function load() {
    if (!accessToken) return
    setIsLoading(true)
    try {
      const data = await listDeliveryProofs({ token: accessToken, search, proof_type: proofType as never, status, is_active: activeFilter })
      setProofs(data); setError(null)
    } catch (err) { setError(getReadableFieldOpsError(err)) } finally { setIsLoading(false) }
  }
  useEffect(() => { void load() }, [accessToken, search, proofType, status, activeFilter])
  useEffect(() => { if (accessToken) loadFieldOpsOptions(accessToken).then(setOptions).catch((err) => setError(getReadableFieldOpsError(err))) }, [accessToken])

  const save = async (payload: DeliveryProofPayload) => {
    if (!accessToken) return
    setIsSubmitting(true)
    try {
      const cleaned = cleanPayload(payload)
      if (formProof) await updateDeliveryProof(formProof.id, cleaned, accessToken)
      else await createDeliveryProof(cleaned, accessToken)
      setMessage('Evidencia guardada correctamente.'); setFormProof(undefined); await load()
    } catch (err) { setError(getReadableFieldOpsError(err)) } finally { setIsSubmitting(false) }
  }
  const review = async (action: 'accept' | 'reject', review_notes: string) => {
    if (!accessToken || !reviewProof) return
    setIsSubmitting(true)
    try { if (action === 'accept') await acceptDeliveryProof(reviewProof.id, { review_notes }, accessToken); else await rejectDeliveryProof(reviewProof.id, { review_notes }, accessToken); setMessage('Revisión aplicada.'); setReviewProof(null); await load() } catch (err) { setError(getReadableFieldOpsError(err)) } finally { setIsSubmitting(false) }
  }
  const deactivate = async (proof: DeliveryProof) => { if (!accessToken || !window.confirm('¿Desactivar esta evidencia?')) return; try { await deleteDeliveryProof(proof.id, accessToken); setMessage('Evidencia desactivada.'); await load() } catch (err) { setError(getReadableFieldOpsError(err)) } }

  return <div className="space-y-5"><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">Evidencias</span><h2 className="mt-3 text-3xl font-bold text-slate-950">Evidencias de entrega</h2><p className="mt-2 text-slate-600">Revisa, crea, acepta, rechaza y desactiva pruebas operativas.</p></div><button onClick={() => { setFormProof(null); setDetailProof(null); setReviewProof(null) }} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">Nueva evidencia</button></div></section>{message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}{error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}<section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4"><input value={search} onChange={(e: { target: HTMLInputElement }) => setSearch(e.target.value)} placeholder="Buscar evidencia" className="rounded-xl border border-slate-200 px-3 py-2" /><select value={proofType} onChange={(e: { target: HTMLSelectElement }) => setProofType(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2"><option value="">Todos los tipos</option>{proofTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><select value={status} onChange={(e: { target: HTMLSelectElement }) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2"><option value="">Todos los estados</option>{proofStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><select value={activeFilter} onChange={(e: { target: HTMLSelectElement }) => setActiveFilter(e.target.value as never)} className="rounded-xl border border-slate-200 px-3 py-2"><option value="true">Activas</option><option value="false">Inactivas</option><option value="all">Todas</option></select></section>{formProof !== undefined ? <DeliveryProofForm proof={formProof} options={options} onSubmit={save} onCancel={() => setFormProof(undefined)} isSubmitting={isSubmitting} /> : null}{reviewProof ? <DeliveryProofReviewPanel proof={reviewProof} onAccept={(notes) => review('accept', notes)} onReject={(notes) => review('reject', notes)} onCancel={() => setReviewProof(null)} isSubmitting={isSubmitting} /> : null}{detailProof ? <DeliveryProofDetailPanel proof={detailProof} onClose={() => setDetailProof(null)} /> : null}{isLoading ? <p className="text-slate-500">Cargando evidencias...</p> : <DeliveryProofsTable proofs={proofs} onView={setDetailProof} onEdit={(proof) => { setFormProof(proof); setReviewProof(null); setDetailProof(null) }} onAccept={setReviewProof} onReject={setReviewProof} onDelete={deactivate} />}</div>
}

// @ts-nocheck
import { useEffect, useState } from 'react'
import type { LogisticsDocument, LogisticsDocumentPayload } from '../../types/documents'
import type { DocumentFormOptions } from './formOptions'
import { documentStatusOptions, documentTypeOptions } from './labels'

type Props = { document?: LogisticsDocument | null; options: DocumentFormOptions; isSubmitting?: boolean; onCancel: () => void; onSubmit: (payload: LogisticsDocumentPayload) => void }
const fkKeys = ['customer', 'route', 'shipment', 'warehouse', 'driver', 'vehicle', 'delivery_proof', 'incident']

export function DocumentForm({ document, options, isSubmitting, onCancel, onSubmit }: Props) {
  const [form, setForm] = useState<LogisticsDocumentPayload>({ document_type: 'internal_note', status: 'draft', title: '', is_active: true })
  const [attachment, setAttachment] = useState<File | null>(null)

  useEffect(() => {
    setForm({
      document_number: document?.document_number ?? '', document_type: document?.document_type ?? 'internal_note', status: document?.status ?? 'draft',
      customer: document?.customer ?? '', route: document?.route ?? '', shipment: document?.shipment ?? '', warehouse: document?.warehouse ?? '', driver: document?.driver ?? '', vehicle: document?.vehicle ?? '', delivery_proof: document?.delivery_proof ?? '', incident: document?.incident ?? '',
      title: document?.title ?? '', description: document?.description ?? '', issue_date: document?.issue_date ?? '', origin_text: document?.origin_text ?? '', destination_text: document?.destination_text ?? '', notes: document?.notes ?? '', internal_observations: document?.internal_observations ?? '', external_reference: document?.external_reference ?? '', sii_reference: document?.sii_reference ?? '', is_active: document?.is_active ?? true,
    })
    setAttachment(null)
  }, [document])

  function update(key: string, value: string | boolean) { setForm((current) => ({ ...current, [key]: value })) }
  function submit() {
    const payload: LogisticsDocumentPayload = { ...form }
    fkKeys.forEach((key) => { if (payload[key] === '') payload[key] = null })
    if (attachment) payload.attachment = attachment
    onSubmit(payload)
  }
  const selectClass = 'rounded-xl border border-slate-200 px-3 py-2 text-sm'
  const inputClass = 'rounded-xl border border-slate-200 px-3 py-2 text-sm'
  const noBaseOptions = options.routes.length === 0 && options.shipments.length === 0

  return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-start justify-between gap-4"><div><h3 className="text-lg font-bold text-slate-950">{document ? 'Editar documento' : 'Crear documento manual'}</h3><p className="mt-1 rounded-2xl bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">Documento interno/provisorio. No corresponde a emisión tributaria SII.</p>{noBaseOptions ? <p className="mt-2 text-sm text-slate-500">Primero debes crear rutas, encomiendas o maestros relacionados.</p> : null}</div><button onClick={onCancel} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">Cerrar</button></div><div className="grid gap-3 md:grid-cols-3">
    <input className={inputClass} placeholder="Número opcional" value={String(form.document_number ?? '')} onChange={(e) => update('document_number', e.target.value)} />
    <select className={selectClass} value={String(form.document_type ?? '')} onChange={(e) => update('document_type', e.target.value)}>{documentTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
    <select className={selectClass} value={String(form.status ?? '')} onChange={(e) => update('status', e.target.value)}>{documentStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
    <input className={`${inputClass} md:col-span-2`} placeholder="Título" value={String(form.title ?? '')} onChange={(e) => update('title', e.target.value)} />
    <input className={inputClass} type="date" value={String(form.issue_date ?? '')} onChange={(e) => update('issue_date', e.target.value)} />
    {(['customers','routes','shipments','warehouses','drivers','vehicles','deliveryProofs','incidents'] as const).map((key) => <select key={key} className={selectClass} value={String(form[{ customers: 'customer', routes: 'route', shipments: 'shipment', warehouses: 'warehouse', drivers: 'driver', vehicles: 'vehicle', deliveryProofs: 'delivery_proof', incidents: 'incident' }[key]] ?? '')} onChange={(e) => update({ customers: 'customer', routes: 'route', shipments: 'shipment', warehouses: 'warehouse', drivers: 'driver', vehicles: 'vehicle', deliveryProofs: 'delivery_proof', incidents: 'incident' }[key], e.target.value)}><option value="">{key}</option>{options[key].map((option) => <option key={String(option.value)} value={option.value}>{option.label}</option>)}</select>)}
    <input className={inputClass} placeholder="Origen" value={String(form.origin_text ?? '')} onChange={(e) => update('origin_text', e.target.value)} />
    <input className={inputClass} placeholder="Destino" value={String(form.destination_text ?? '')} onChange={(e) => update('destination_text', e.target.value)} />
    <input className={inputClass} placeholder="Referencia externa" value={String(form.external_reference ?? '')} onChange={(e) => update('external_reference', e.target.value)} />
    <input className={inputClass} placeholder="Referencia SII manual/provisoria" value={String(form.sii_reference ?? '')} onChange={(e) => update('sii_reference', e.target.value)} />
    <textarea className={`${inputClass} md:col-span-3`} placeholder="Descripción" value={String(form.description ?? '')} onChange={(e) => update('description', e.target.value)} />
    <textarea className={`${inputClass} md:col-span-3`} placeholder="Notas" value={String(form.notes ?? '')} onChange={(e) => update('notes', e.target.value)} />
    <textarea className={`${inputClass} md:col-span-3`} placeholder="Observaciones internas" value={String(form.internal_observations ?? '')} onChange={(e) => update('internal_observations', e.target.value)} />
    <label className="rounded-xl border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 md:col-span-2"><span className="font-semibold">Adjunto opcional:</span> <input type="file" className="mt-2 block w-full" onChange={(e) => setAttachment(e.target.files?.[0] ?? null)} />{document?.attachment ? <a href={document.attachment} target="_blank" rel="noreferrer" className="mt-1 block text-cyan-700 underline">Ver adjunto actual</a> : null}</label>
    <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm"><input type="checkbox" checked={Boolean(form.is_active)} onChange={(e) => update('is_active', e.target.checked)} /> Activo</label>
  </div><div className="mt-4 flex gap-2"><button disabled={isSubmitting} onClick={submit} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Guardar</button><button onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold">Cancelar</button></div></section>
}

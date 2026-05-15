// @ts-nocheck
import { useEffect, useState } from 'react'
import type { LogisticsDocument, LogisticsDocumentLine, LogisticsDocumentLinePayload } from '../../types/documents'
import type { DocumentFormOptions } from './formOptions'

type Props = { document?: LogisticsDocument | null; line?: LogisticsDocumentLine | null; options: DocumentFormOptions; isSubmitting?: boolean; onCancel: () => void; onSubmit: (payload: LogisticsDocumentLinePayload) => void }

export function DocumentLineForm({ document, line, options, isSubmitting, onCancel, onSubmit }: Props) {
  const [form, setForm] = useState<LogisticsDocumentLinePayload>({ document: document?.id ?? '', line_number: 1, description: '', quantity: 1, is_active: true })
  useEffect(() => { setForm({ document: line?.document ?? document?.id ?? '', line_number: line?.line_number ?? 1, shipment: line?.shipment ?? '', package: line?.package ?? '', route_stop: line?.route_stop ?? '', description: line?.description ?? '', quantity: line?.quantity ?? 1, weight_kg: line?.weight_kg ?? '', volume_m3: line?.volume_m3 ?? '', reference_code: line?.reference_code ?? '', notes: line?.notes ?? '', is_active: line?.is_active ?? true }) }, [document, line])
  function update(key: string, value: string | boolean) { setForm((current) => ({ ...current, [key]: value })) }
  function submit() { const payload = { ...form }; ['document','shipment','package','route_stop'].forEach((key) => { if (payload[key] === '') payload[key] = null }); onSubmit(payload) }
  const inputClass = 'rounded-xl border border-slate-200 px-3 py-2 text-sm'
  return <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold text-slate-950">{line ? 'Editar línea' : 'Nueva línea'}</h3><button onClick={onCancel} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">Cerrar</button></div><div className="grid gap-3 md:grid-cols-3">
    <input className={inputClass} type="number" placeholder="Número línea" value={String(form.line_number ?? '')} onChange={(e) => update('line_number', e.target.value)} />
    <select className={inputClass} value={String(form.shipment ?? '')} onChange={(e) => update('shipment', e.target.value)}><option value="">Encomienda</option>{options.shipments.map((o) => <option key={String(o.value)} value={o.value}>{o.label}</option>)}</select>
    <select className={inputClass} value={String(form.package ?? '')} onChange={(e) => update('package', e.target.value)}><option value="">Bulto</option>{options.packages.map((o) => <option key={String(o.value)} value={o.value}>{o.label}</option>)}</select>
    <select className={inputClass} value={String(form.route_stop ?? '')} onChange={(e) => update('route_stop', e.target.value)}><option value="">Parada</option>{options.routeStops.map((o) => <option key={String(o.value)} value={o.value}>{o.label}</option>)}</select>
    <input className={`${inputClass} md:col-span-2`} placeholder="Descripción" value={String(form.description ?? '')} onChange={(e) => update('description', e.target.value)} />
    <input className={inputClass} type="number" placeholder="Cantidad" value={String(form.quantity ?? '')} onChange={(e) => update('quantity', e.target.value)} />
    <input className={inputClass} type="number" step="0.001" placeholder="Peso kg" value={String(form.weight_kg ?? '')} onChange={(e) => update('weight_kg', e.target.value)} />
    <input className={inputClass} type="number" step="0.001" placeholder="Volumen m3" value={String(form.volume_m3 ?? '')} onChange={(e) => update('volume_m3', e.target.value)} />
    <input className={inputClass} placeholder="Referencia" value={String(form.reference_code ?? '')} onChange={(e) => update('reference_code', e.target.value)} />
    <textarea className={`${inputClass} md:col-span-2`} placeholder="Notas" value={String(form.notes ?? '')} onChange={(e) => update('notes', e.target.value)} />
    <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm"><input type="checkbox" checked={Boolean(form.is_active)} onChange={(e) => update('is_active', e.target.checked)} /> Activa</label>
  </div><div className="mt-4 flex gap-2"><button disabled={isSubmitting} onClick={submit} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Guardar línea</button><button onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold">Cancelar</button></div></section>
}

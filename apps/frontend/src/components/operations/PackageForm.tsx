import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { packageStatusOptions } from './OperationStatusBadge'
import type { Package, PackagePayload } from '../../types/operations'
import type { SelectOption } from '../../types/masterData'

type Props = {
  title: string
  packageRecord?: Package | null
  shipmentOptions: SelectOption[]
  isSaving: boolean
  error?: string | null
  onSubmit: (payload: PackagePayload) => void
  onCancel: () => void
}

type FormState = {
  shipment: string
  package_code: string
  description: string
  weight_kg: string
  length_cm: string
  width_cm: string
  height_cm: string
  volume_m3: string
  declared_value: string
  barcode: string
  status: string
  is_fragile: boolean
  is_active: boolean
}

function initialState(pkg?: Package | null): FormState {
  return {
    shipment: pkg?.shipment ? String(pkg.shipment) : '',
    package_code: pkg?.package_code ?? '',
    description: pkg?.description ?? '',
    weight_kg: pkg?.weight_kg ? String(pkg.weight_kg) : '',
    length_cm: pkg?.length_cm ? String(pkg.length_cm) : '',
    width_cm: pkg?.width_cm ? String(pkg.width_cm) : '',
    height_cm: pkg?.height_cm ? String(pkg.height_cm) : '',
    volume_m3: pkg?.volume_m3 ? String(pkg.volume_m3) : '',
    declared_value: pkg?.declared_value ? String(pkg.declared_value) : '',
    barcode: pkg?.barcode ?? '',
    status: pkg?.status ?? 'received',
    is_fragile: pkg?.is_fragile ?? false,
    is_active: pkg?.is_active ?? true,
  }
}

function cleanNullable(value: string) {
  return value.trim() === '' ? null : value.trim()
}

export function PackageForm({ title, packageRecord, shipmentOptions, isSaving, error, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(() => initialState(packageRecord))

  useEffect(() => {
    setForm(initialState(packageRecord))
  }, [packageRecord])

  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit({
      shipment: form.shipment,
      package_code: form.package_code.trim(),
      description: form.description.trim(),
      weight_kg: cleanNullable(form.weight_kg),
      length_cm: cleanNullable(form.length_cm),
      width_cm: cleanNullable(form.width_cm),
      height_cm: cleanNullable(form.height_cm),
      volume_m3: cleanNullable(form.volume_m3),
      declared_value: cleanNullable(form.declared_value),
      barcode: form.barcode.trim(),
      status: form.status,
      is_fragile: form.is_fragile,
      is_active: form.is_active,
    })
  }

  const inputClass = 'mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100'

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-4xl rounded-3xl bg-white shadow-xl">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="text-lg font-bold text-slate-950">{title}</h3>
            {shipmentOptions.length === 0 ? <p className="mt-2 text-sm text-amber-700">Primero debes crear encomiendas para asociar bultos.</p> : null}
            {error ? <p className="mt-2 rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}
          </div>
          <div className="grid gap-4 px-6 py-5 md:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-semibold text-slate-700">Encomienda *<select required className={inputClass} value={form.shipment} onChange={(event: any) => setField('shipment', event.target.value)}><option value="">Seleccionar</option>{shipmentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="text-sm font-semibold text-slate-700">Código de bulto<input className={inputClass} value={form.package_code} onChange={(event: any) => setField('package_code', event.target.value)} placeholder="Opcional/autogenerado" /></label>
            <label className="text-sm font-semibold text-slate-700">Estado<select className={inputClass} value={form.status} onChange={(event: any) => setField('status', event.target.value)}>{packageStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="text-sm font-semibold text-slate-700">Peso kg<input type="number" step="0.01" className={inputClass} value={form.weight_kg} onChange={(event: any) => setField('weight_kg', event.target.value)} /></label>
            <label className="text-sm font-semibold text-slate-700">Largo cm<input type="number" step="0.01" className={inputClass} value={form.length_cm} onChange={(event: any) => setField('length_cm', event.target.value)} /></label>
            <label className="text-sm font-semibold text-slate-700">Ancho cm<input type="number" step="0.01" className={inputClass} value={form.width_cm} onChange={(event: any) => setField('width_cm', event.target.value)} /></label>
            <label className="text-sm font-semibold text-slate-700">Alto cm<input type="number" step="0.01" className={inputClass} value={form.height_cm} onChange={(event: any) => setField('height_cm', event.target.value)} /></label>
            <label className="text-sm font-semibold text-slate-700">Volumen m³<input type="number" step="0.0001" className={inputClass} value={form.volume_m3} onChange={(event: any) => setField('volume_m3', event.target.value)} /></label>
            <label className="text-sm font-semibold text-slate-700">Valor declarado<input type="number" step="0.01" className={inputClass} value={form.declared_value} onChange={(event: any) => setField('declared_value', event.target.value)} /></label>
            <label className="text-sm font-semibold text-slate-700">Código de barras<input className={inputClass} value={form.barcode} onChange={(event: any) => setField('barcode', event.target.value)} /></label>
            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.is_fragile} onChange={(event: any) => setField('is_fragile', event.target.checked)} />Frágil</label>
            <label className="flex items-center gap-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.is_active} onChange={(event: any) => setField('is_active', event.target.checked)} />Registro activo</label>
            <label className="md:col-span-2 lg:col-span-3 text-sm font-semibold text-slate-700">Descripción<textarea rows={3} className={inputClass} value={form.description} onChange={(event: any) => setField('description', event.target.value)} /></label>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancelar</button>
            <button type="submit" disabled={isSaving} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-400">{isSaving ? 'Guardando...' : 'Guardar bulto'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

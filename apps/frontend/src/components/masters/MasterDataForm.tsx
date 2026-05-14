import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { BaseMasterRecord, MasterFormField } from '../../types/masterData'

type FormValues = Record<string, unknown>

type MasterDataFormProps<T extends BaseMasterRecord> = {
  title: string
  fields: MasterFormField<FormValues>[]
  initialValues: Partial<T> | null
  isSaving: boolean
  error?: string | null
  onSubmit: (values: FormValues) => Promise<void> | void
  onCancel: () => void
}

function valueToInput(value: unknown) {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
}

export function MasterDataForm<T extends BaseMasterRecord>({
  title,
  fields,
  initialValues,
  isSaving,
  error,
  onSubmit,
  onCancel,
}: MasterDataFormProps<T>) {
  const defaults = useMemo(() => {
    return fields.reduce<FormValues>((accumulator, field) => {
      if (field.type === 'checkbox') {
        accumulator[field.name] = initialValues?.[field.name as keyof T] ?? field.defaultValue ?? true
      } else {
        accumulator[field.name] = initialValues?.[field.name as keyof T] ?? field.defaultValue ?? ''
      }
      return accumulator
    }, {})
  }, [fields, initialValues])

  const [values, setValues] = useState<FormValues>(defaults)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    setValues(defaults)
    setValidationError(null)
  }, [defaults])

  function setField(name: string, value: unknown) {
    setValues((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const missing = fields.find((field) => field.required && !valueToInput(values[field.name]).trim())

    if (missing) {
      setValidationError(`El campo ${missing.label} es obligatorio.`)
      return
    }

    setValidationError(null)
    await onSubmit(values)
  }

  return (
    <div className="fixed inset-0 z-30 flex items-stretch justify-end bg-slate-950/30 p-0 backdrop-blur-sm sm:p-4">
      <div className="flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl sm:rounded-3xl">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">Registro maestro</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-950">{title}</h3>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {validationError || error ? (
              <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {validationError ?? error}
              </div>
            ) : null}

            {fields.map((field) => {
              const fieldValue = values[field.name]
              const commonClasses = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50'

              return (
                <label key={field.name} className="block text-sm font-medium text-slate-700">
                  <span className="flex items-center gap-1">
                    {field.label}
                    {field.required ? <span className="text-rose-500">*</span> : null}
                  </span>

                  {field.type === 'textarea' ? (
                    <textarea
                      value={valueToInput(fieldValue)}
                      onChange={(event: any) => setField(field.name, event.target.value)}
                      placeholder={field.placeholder}
                      className={`${commonClasses} mt-1 min-h-24 resize-y`}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={valueToInput(fieldValue)}
                      onChange={(event: any) => setField(field.name, event.target.value)}
                      className={`${commonClasses} mt-1`}
                    >
                      <option value="">Sin seleccionar</option>
                      {field.options?.map((option) => (
                        <option key={`${field.name}-${option.value}`} value={option.value} disabled={option.disabled}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <span className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2">
                      <input
                        type="checkbox"
                        checked={Boolean(fieldValue)}
                        onChange={(event: any) => setField(field.name, event.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="text-slate-600">Registro activo</span>
                    </span>
                  ) : (
                    <input
                      type={field.type ?? 'text'}
                      value={valueToInput(fieldValue)}
                      onChange={(event: any) => setField(field.name, event.target.value)}
                      placeholder={field.placeholder}
                      className={`${commonClasses} mt-1`}
                    />
                  )}

                  {field.helperText ? <span className="mt-1 block text-xs text-slate-500">{field.helperText}</span> : null}
                </label>
              )
            })}
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-400"
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

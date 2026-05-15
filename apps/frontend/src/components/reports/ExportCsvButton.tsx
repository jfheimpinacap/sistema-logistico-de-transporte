import { useState } from 'react'
import { ApiClientError } from '../../services/apiClient'

type ExportCsvButtonProps = {
  text?: string
  onExport: () => Promise<void>
  disabled?: boolean
}

function readableExportError(error: unknown) {
  if (error instanceof ApiClientError) return error.message
  if (error instanceof Error) return error.message
  return 'No fue posible descargar el CSV compatible con Excel.'
}

export function ExportCsvButton({ text = 'Exportar CSV', onExport, disabled = false }: ExportCsvButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setLoading(true)
    setError(null)
    try {
      await onExport()
    } catch (err) {
      setError(readableExportError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">CSV compatible con Excel</p>
          <p className="text-xs text-slate-500">Descarga compatible con Excel. No es archivo XLSX.</p>
        </div>
        <button
          type="button"
          onClick={handleClick}
          disabled={disabled || loading}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? 'Generando CSV...' : text}
        </button>
      </div>
      {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </div>
  )
}

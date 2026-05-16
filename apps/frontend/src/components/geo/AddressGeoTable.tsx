import type { AddressCheckItem } from '../../types/geo'

type Props = {
  addresses: AddressCheckItem[]
  isLoading?: boolean
  error?: string | null
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

function statusFor(address: AddressCheckItem) {
  const valid = address.is_valid ?? address.has_valid_coordinates
  const hasCoordinates = address.has_coordinates ?? (address.latitude !== null && address.latitude !== undefined && address.longitude !== null && address.longitude !== undefined)
  if (valid || address.status === 'with_coordinates') return { label: 'Válidas', className: 'bg-emerald-50 text-emerald-700' }
  if (hasCoordinates || address.status === 'invalid_coordinates') return { label: 'Inválidas', className: 'bg-rose-50 text-rose-700' }
  return { label: 'Faltantes', className: 'bg-amber-50 text-amber-700' }
}

function warningsFor(address: AddressCheckItem) {
  const warnings = address.warnings ?? address.errors ?? []
  return warnings.length > 0 ? warnings.join(' · ') : 'Sin advertencias'
}

export function AddressGeoTable({ addresses, isLoading = false, error = null }: Props) {
  if (isLoading) return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">Cargando diagnóstico de direcciones...</div>
  if (error) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">{error}</div>
  if (addresses.length === 0) return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">No hay direcciones para mostrar con el filtro actual.</div>

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Comuna</th>
              <th className="px-4 py-3">Ciudad</th>
              <th className="px-4 py-3">Región</th>
              <th className="px-4 py-3">Latitud</th>
              <th className="px-4 py-3">Longitud</th>
              <th className="px-4 py-3">Estado coordenadas</th>
              <th className="px-4 py-3">Advertencias</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {addresses.map((address, index) => {
              const status = statusFor(address)
              return (
                <tr key={address.id ?? `${address.label}-${index}`} className="align-top">
                  <td className="px-4 py-3 font-medium text-slate-900">{displayValue(address.label ?? address.display)}</td>
                  <td className="px-4 py-3 text-slate-600">{displayValue(address.commune)}</td>
                  <td className="px-4 py-3 text-slate-600">{displayValue(address.city)}</td>
                  <td className="px-4 py-3 text-slate-600">{displayValue(address.region)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{displayValue(address.latitude)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{displayValue(address.longitude)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>{status.label}</span></td>
                  <td className="px-4 py-3 text-slate-600">{warningsFor(address)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

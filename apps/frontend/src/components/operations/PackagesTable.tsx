import { OperationStatusBadge } from './OperationStatusBadge'
import type { Package } from '../../types/operations'

type Props = {
  packages: Package[]
  isLoading: boolean
  error?: string | null
  onEdit: (pkg: Package) => void
  onDelete: (pkg: Package) => void
}

function renderNumber(value?: string | number | null, suffix = '') {
  return value === null || value === undefined || value === '' ? '—' : `${value}${suffix}`
}

export function PackagesTable({ packages, isLoading, error, onEdit, onDelete }: Props) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {error ? <div className="border-b border-rose-100 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">{error}</div> : null}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-5 py-4">Bulto</th>
              <th className="px-5 py-4">Encomienda</th>
              <th className="px-5 py-4">Descripción</th>
              <th className="px-5 py-4">Peso</th>
              <th className="px-5 py-4">Volumen</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Frágil</th>
              <th className="px-5 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
            {isLoading ? (
              <tr><td colSpan={8} className="px-5 py-8 text-center text-slate-500">Cargando bultos...</td></tr>
            ) : packages.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-8 text-center text-slate-500">No hay bultos para los filtros seleccionados.</td></tr>
            ) : packages.map((pkg) => (
              <tr key={pkg.id} className="hover:bg-slate-50/80">
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-950">{pkg.package_code || 'Autogenerado'}</td>
                <td className="whitespace-nowrap px-5 py-4">{pkg.shipment_tracking_code || pkg.shipment}</td>
                <td className="max-w-xs truncate px-5 py-4">{pkg.description || '—'}</td>
                <td className="whitespace-nowrap px-5 py-4">{renderNumber(pkg.weight_kg, ' kg')}</td>
                <td className="whitespace-nowrap px-5 py-4">{renderNumber(pkg.volume_m3, ' m³')}</td>
                <td className="whitespace-nowrap px-5 py-4"><OperationStatusBadge value={pkg.status} type="package" /></td>
                <td className="whitespace-nowrap px-5 py-4">{pkg.is_fragile ? 'Sí' : 'No'}</td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => onEdit(pkg)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">Editar</button>
                    <button type="button" onClick={() => onDelete(pkg)} disabled={!pkg.is_active} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300">Desactivar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

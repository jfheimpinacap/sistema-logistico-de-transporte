import type { BaseMasterRecord, MasterTableColumn } from '../../types/masterData'

type MasterDataTableProps<T extends BaseMasterRecord> = {
  columns: MasterTableColumn<T>[]
  data: T[]
  isLoading: boolean
  error?: string | null
  onEdit: (record: T) => void
  onDelete: (record: T) => void
}

function renderValue(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  if (typeof value === 'boolean') {
    return value ? 'Sí' : 'No'
  }

  return String(value)
}

export function MasterDataTable<T extends BaseMasterRecord>({
  columns,
  data,
  isLoading,
  error,
  onEdit,
  onDelete,
}: MasterDataTableProps<T>) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {error ? (
        <div className="border-b border-rose-100 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">{error}</div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-4">
                  {column.label}
                </th>
              ))}
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
            {isLoading ? (
              <tr>
                <td className="px-5 py-8 text-center text-slate-500" colSpan={columns.length + 2}>
                  Cargando datos...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-center text-slate-500" colSpan={columns.length + 2}>
                  No hay registros para los filtros seleccionados.
                </td>
              </tr>
            ) : (
              data.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/80">
                  {columns.map((column) => (
                    <td key={column.key} className="whitespace-nowrap px-5 py-4">
                      {renderValue(column.render ? column.render(record) : record[column.key as keyof T])}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        record.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {record.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(record)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(record)}
                        disabled={!record.is_active}
                        className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
                      >
                        Desactivar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

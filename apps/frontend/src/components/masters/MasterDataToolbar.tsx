import type { ActiveFilter } from '../../types/masterData'

type MasterDataToolbarProps = {
  title: string
  subtitle: string
  search: string
  activeFilter: ActiveFilter
  onSearchChange: (value: string) => void
  onActiveFilterChange: (value: ActiveFilter) => void
  onCreate: () => void
}

export function MasterDataToolbar({
  title,
  subtitle,
  search,
  activeFilter,
  onSearchChange,
  onActiveFilterChange,
  onCreate,
}: MasterDataToolbarProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-700">Maestros logísticos</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{title}</h2>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex min-w-0 flex-col gap-1 text-sm font-medium text-slate-700">
            Buscar
            <input
              type="search"
              value={search}
              onChange={(event: any) => onSearchChange(event.target.value)}
              placeholder="Nombre, código, patente..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50 sm:w-64"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Estado
            <select
              value={activeFilter}
              onChange={(event: any) => onActiveFilterChange(event.target.value as ActiveFilter)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-50"
            >
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="all">Todos</option>
            </select>
          </label>

          <button
            type="button"
            onClick={onCreate}
            className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            + Nuevo
          </button>
        </div>
      </div>
    </section>
  )
}

import { useAuth } from '../../hooks/useAuth'

export function Topbar() {
  const { logout, user } = useAuth()
  const displayName = user?.first_name || user?.username || 'Operador'

  return (
    <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-3 py-3 backdrop-blur sm:px-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Panel operativo base</p>
        <p className="hidden text-sm text-slate-600 sm:block">Frontend conectado al backend Django en modo MVP.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 sm:flex">
          ● Sesión activa
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900">{displayName}</p>
          <p className="text-xs text-slate-500">Usuario demo</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950"
        >
          Salir
        </button>
      </div>
    </header>
  )
}

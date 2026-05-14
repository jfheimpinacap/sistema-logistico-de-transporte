import { useAppRouter } from '../../routes/AppRoutes'

const enabledItems = [
  { label: 'Dashboard', path: '/', icon: '⌂' },
  { label: 'Estado del sistema', path: '/health', icon: '◉' },
]

const upcomingItems = [
  { label: 'Encomiendas', icon: '▣' },
  { label: 'Rutas', icon: '↝' },
  { label: 'Conductores', icon: '♙' },
  { label: 'Vehículos', icon: '▰' },
  { label: 'Bodegas', icon: '▥' },
  { label: 'Incidencias', icon: '!' },
  { label: 'Documentos', icon: '□' },
]

export function Sidebar() {
  const { navigate, path } = useAppRouter()

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-200 bg-white/90 px-4 py-5 shadow-sm backdrop-blur">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white shadow-sm">
          SL
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">TMS MVP</p>
          <h1 className="text-base font-bold text-slate-950">Sistema Logístico</h1>
        </div>
      </div>

      <nav className="space-y-1">
        {enabledItems.map((item) => {
          const isActive = path === item.path
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center text-base">{item.icon}</span>
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="mt-8">
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Módulos próximos</p>
        <div className="mt-3 space-y-1">
          {upcomingItems.map((item) => (
            <div
              key={item.label}
              className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-400"
              title="Próximamente"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center text-base">{item.icon}</span>
                {item.label}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Próximamente
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

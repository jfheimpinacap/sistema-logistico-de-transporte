import { useAppRouter } from '../../routes/AppRoutes'

const mainItems = [
  { label: 'Dashboard', path: '/', icon: '⌂' },
  { label: 'Estado del sistema', path: '/health', icon: '◉' },
]

const masterItems = [
  { label: 'Inicio maestros', path: '/masters', icon: '◇' },
  { label: 'Clientes', path: '/masters/customers', icon: '◆' },
  { label: 'Contactos', path: '/masters/contacts', icon: '☏' },
  { label: 'Zonas', path: '/masters/zones', icon: '◎' },
  { label: 'Direcciones', path: '/masters/addresses', icon: '⌖' },
  { label: 'Bodegas', path: '/masters/warehouses', icon: '▥' },
  { label: 'Tipos de vehículo', path: '/masters/vehicle-types', icon: '▤' },
  { label: 'Vehículos', path: '/masters/vehicles', icon: '▰' },
  { label: 'Conductores', path: '/masters/drivers', icon: '♙' },
]

const operationItems = [
  { label: 'Inicio operación', path: '/operations', icon: '▧' },
  { label: 'Encomiendas', path: '/operations/shipments', icon: '▣' },
  { label: 'Bultos', path: '/operations/packages', icon: '▦' },
  { label: 'Tracking', path: '/operations/tracking', icon: '◷' },
  { label: 'Rutas', path: '/operations/routes', icon: '↝' },
]

const upcomingItems = [
  { label: 'Incidencias', icon: '!' },
  { label: 'Documentos', icon: '□' },
]

type NavigationItem = {
  label: string
  path: string
  icon: string
}

type NavigationButtonProps = {
  key?: string
  item: NavigationItem
  isActive: boolean
  onClick: () => void
  isCompact?: boolean
}

function NavigationButton({ item, isActive, onClick, isCompact = false }: NavigationButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition ${
        isCompact ? 'py-2' : 'py-2.5'
      } ${isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
    >
      <span className="flex h-5 w-5 items-center justify-center text-base">{item.icon}</span>
      {item.label}
    </button>
  )
}

export function Sidebar() {
  const { navigate, path } = useAppRouter()

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-200 bg-white/90 px-4 py-5 shadow-sm backdrop-blur">
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white shadow-sm">
          SL
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">TMS MVP</p>
          <h1 className="text-base font-bold text-slate-950">Sistema Logístico</h1>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
        <div className="space-y-1">
          {mainItems.map((item) => (
            <NavigationButton key={item.path} item={item} isActive={path === item.path} onClick={() => navigate(item.path)} />
          ))}
        </div>

        <div>
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Maestros</p>
          <div className="mt-3 space-y-1">
            {masterItems.map((item) => (
              <NavigationButton key={item.path} item={item} isActive={path === item.path} onClick={() => navigate(item.path)} isCompact />
            ))}
          </div>
        </div>

        <div>
          <p className="px-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Operación logística</p>
          <div className="mt-3 space-y-1">
            {operationItems.map((item) => (
              <NavigationButton key={item.path} item={item} isActive={path === item.path} onClick={() => navigate(item.path)} isCompact />
            ))}
            {upcomingItems.map((item) => (
              <div key={item.label} className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-2 text-sm text-slate-400" title="Próximamente">
                <span className="flex items-center gap-3"><span className="flex h-5 w-5 items-center justify-center text-base">{item.icon}</span>{item.label}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Próximamente</span>
              </div>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  )
}

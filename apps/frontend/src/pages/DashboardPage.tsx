import { useAppRouter } from '../routes/AppRoutes'

const cards = [
  { label: 'Maestros logísticos', value: 'Disponible', icon: '◇' },
  { label: 'Encomiendas pendientes', value: 'Próximamente', icon: '▣' },
  { label: 'Rutas activas', value: 'Próximamente', icon: '↝' },
  { label: 'Incidencias abiertas', value: 'Próximamente', icon: '!' },
]

const mvpStatus = [
  'Prompt 001: Base monorepo',
  'Prompt 002: Backend y autenticación',
  'Prompt 003: Frontend operativo base',
  'Prompt 004: Backend maestros logísticos',
  'Prompt 005: Frontend CRUD de maestros logísticos',
]

export function DashboardPage() {
  const { navigate } = useAppRouter()

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">
            ◷ Prompt 005 — Frontend CRUD de maestros logísticos
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Panel de control logístico</h2>
          <p className="mt-3 text-slate-600">
            El módulo de maestros ya está disponible para gestionar clientes, contactos, zonas, direcciones, bodegas,
            tipos de vehículo, vehículos y conductores. Las métricas reales llegan en próximos prompts.
          </p>
          <button
            type="button"
            onClick={() => navigate('/masters')}
            className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Abrir maestros
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-3 text-xl font-bold text-slate-900">{card.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-600">
                {card.icon}
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Estado del MVP</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {mvpStatus.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-700">
              <span className="text-emerald-600">✓</span>
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

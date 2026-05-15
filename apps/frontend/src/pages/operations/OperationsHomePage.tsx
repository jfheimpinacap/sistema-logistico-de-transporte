import { useAppRouter } from '../../routes/AppRoutes'

const cards = [
  { title: 'Encomiendas', description: 'Crear, filtrar, editar y cambiar estados de encomiendas.', path: '/operations/shipments', icon: '▣', available: true },
  { title: 'Bultos', description: 'Administrar paquetes asociados a encomiendas.', path: '/operations/packages', icon: '▦', available: true },
  { title: 'Tracking', description: 'Revisar el historial de eventos operativos.', path: '/operations/tracking', icon: '◷', available: true },
  { title: 'Rutas', description: 'Planificación y paradas en próximos prompts.', icon: '↝', available: false },
  { title: 'Incidencias', description: 'Gestión avanzada de excepciones próximamente.', icon: '!', available: false },
  { title: 'Documentos', description: 'Documentos internos y respaldos próximamente.', icon: '□', available: false },
]

export function OperationsHomePage() {
  const { navigate } = useAppRouter()

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">▣ Prompt 007 — Operación logística</span>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Módulo operativo de encomiendas</h2>
        <p className="mt-3 max-w-3xl text-slate-600">Administra encomiendas, bultos y tracking desde el panel. Rutas reales, incidencias avanzadas, documentos, GPS y optimización quedan reservados para próximos prompts.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article key={card.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">{card.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{card.description}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-600">{card.icon}</div>
            </div>
            {card.available ? (
              <button type="button" onClick={() => navigate(card.path!)} className="mt-5 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">Abrir</button>
            ) : (
              <span className="mt-5 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Próximamente</span>
            )}
          </article>
        ))}
      </section>
    </div>
  )
}

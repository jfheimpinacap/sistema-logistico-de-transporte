import { useAppRouter } from '../../routes/AppRoutes'

const cards = [
  { title: 'Encomiendas', description: 'Crear, filtrar, editar y cambiar estados de encomiendas.', path: '/operations/shipments', icon: '▣' },
  { title: 'Bultos', description: 'Administrar paquetes asociados a encomiendas.', path: '/operations/packages', icon: '▦' },
  { title: 'Tracking', description: 'Revisar el historial de eventos operativos.', path: '/operations/tracking', icon: '◷' },
  { title: 'Rutas', description: 'Planificar rutas, paradas y asignar encomiendas.', path: '/operations/routes', icon: '↝' },
  { title: 'Modo conductor', description: 'Modo conductor web móvil mejorado: paradas, evidencias, incidencias y ubicación puntual.', path: '/driver', icon: '▣' },
  { title: 'Evidencias', description: 'Revisar, aceptar y rechazar pruebas de entrega.', path: '/operations/delivery-proofs', icon: '☑' },
  { title: 'Incidencias', description: 'Registrar, resolver y cancelar excepciones operativas.', path: '/operations/incidents', icon: '!' },
  { title: 'Documentos', description: 'Administrar documentos internos/provisorios, emisión interna y vista imprimible.', path: '/operations/documents', icon: '□' },
  { title: 'Reportes y exportaciones', description: 'Revisar métricas operativas y descargar CSV compatible con Excel.', path: '/reports', icon: '⇩' },
]

export function OperationsHomePage() {
  const { navigate } = useAppRouter()

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">✓ Prompt 024 — Modo conductor web móvil mejorado</span>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Módulo operativo de encomiendas</h2>
        <p className="mt-3 max-w-3xl text-slate-600">Administra encomiendas, bultos, tracking, rutas, evidencias, incidencias y documentos internos/provisorios desde el panel, usa el modo conductor para operación responsive en terreno y descarga CSV compatible con Excel desde reportes y listados clave. Offline, GPS en tiempo real, mapas y optimización quedan reservados para próximos prompts.</p>
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
            <button type="button" onClick={() => navigate(card.path)} className="mt-5 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">Abrir</button>
          </article>
        ))}
      </section>
    </div>
  )
}

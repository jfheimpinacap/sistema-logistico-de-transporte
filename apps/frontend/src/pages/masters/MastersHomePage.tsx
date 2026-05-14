import { useAppRouter } from '../../routes/AppRoutes'

const masterCards = [
  { label: 'Clientes', path: '/masters/customers', icon: '◆', description: 'Datos comerciales base para remitentes y destinatarios.' },
  { label: 'Contactos', path: '/masters/contacts', icon: '☏', description: 'Personas de contacto asociadas a clientes.' },
  { label: 'Zonas', path: '/masters/zones', icon: '◎', description: 'Agrupación operativa de cobertura y reparto.' },
  { label: 'Direcciones', path: '/masters/addresses', icon: '⌖', description: 'Ubicaciones y referencias geográficas opcionales.' },
  { label: 'Bodegas', path: '/masters/warehouses', icon: '▥', description: 'Centros de distribución y puntos internos.' },
  { label: 'Tipos de vehículo', path: '/masters/vehicle-types', icon: '▤', description: 'Capacidades y categorías de la flota.' },
  { label: 'Vehículos', path: '/masters/vehicles', icon: '▰', description: 'Flota disponible, estado y capacidades.' },
  { label: 'Conductores', path: '/masters/drivers', icon: '♙', description: 'Conductores, licencias y vehículo sugerido.' },
]

export function MastersHomePage() {
  const { navigate } = useAppRouter()

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
          ✓ Prompt 005 disponible
        </span>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Maestros logísticos</h2>
        <p className="mt-3 max-w-3xl text-slate-600">
          Gestiona los datos base que serán reutilizados por encomiendas, rutas, evidencias y operación logística en próximos prompts.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {masterCards.map((card) => (
          <button
            key={card.path}
            type="button"
            onClick={() => navigate(card.path)}
            className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-700">
              {card.icon}
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-950">{card.label}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
          </button>
        ))}
      </section>
    </div>
  )
}

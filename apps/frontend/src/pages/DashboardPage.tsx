import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useAppRouter } from '../routes/AppRoutes'
import { listShipments } from '../services/operationsService'
import { listRoutes } from '../services/routingService'
import type { Shipment } from '../types/operations'
import type { Route } from '../types/routing'

const mvpStatus = [
  'Prompt 001: Base monorepo',
  'Prompt 002: Backend y autenticación',
  'Prompt 003: Frontend operativo base',
  'Prompt 004: Backend maestros logísticos',
  'Prompt 005: Frontend CRUD de maestros logísticos',
  'Prompt 006: Backend operativo de encomiendas',
  'Prompt 007: Frontend operativo de encomiendas, bultos y tracking',
  'Prompt 008: Backend de rutas, paradas y asignación',
  'Prompt 009: Frontend de rutas, paradas y asignación',
]

export function DashboardPage() {
  const { navigate } = useAppRouter()
  const { accessToken } = useAuth()
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [metricsWarning, setMetricsWarning] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) return

    async function loadMetrics() {
      try {
        const [shipmentData, routeData] = await Promise.all([
          listShipments({ token: accessToken!, is_active: 'all' }),
          listRoutes({ token: accessToken!, is_active: 'all' }),
        ])
        setShipments(shipmentData)
        setRoutes(routeData)
        setMetricsWarning(null)
      } catch {
        setMetricsWarning('No fue posible cargar métricas operativas. El dashboard sigue disponible.')
      }
    }

    void loadMetrics()
  }, [accessToken])

  const cards = useMemo(() => {
    const routesInProgress = routes.filter((route) => route.status === 'in_progress').length
    const routesCompleted = routes.filter((route) => route.status === 'completed').length
    const routesWithIncidents = routes.filter((route) => route.status === 'with_incidents').length
    return [
      { label: 'Encomiendas registradas', value: String(shipments.length), icon: '▣' },
      { label: 'Rutas registradas', value: String(routes.length), icon: '↝' },
      { label: 'Rutas en curso', value: String(routesInProgress), icon: '◷' },
      { label: 'Rutas completadas', value: String(routesCompleted), icon: '✓' },
      { label: 'Rutas con incidencias', value: String(routesWithIncidents), icon: '!' },
    ]
  }, [routes, shipments])

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">
            ◷ Prompt 009 — Frontend de rutas, paradas y asignación
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Panel de control logístico</h2>
          <p className="mt-3 text-slate-600">
            El módulo operativo ya permite administrar encomiendas, bultos, timeline de tracking, rutas reales, paradas, asignación de encomiendas y cambios manuales de estado. Los maestros logísticos siguen disponibles para alimentar los formularios.
          </p>
          {metricsWarning ? <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{metricsWarning}</p> : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => navigate('/operations')} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">Abrir operación</button>
            <button type="button" onClick={() => navigate('/masters')} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Abrir maestros</button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-3 text-xl font-bold text-slate-900">{card.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-slate-600">{card.icon}</div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-950">Estado del MVP</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {mvpStatus.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-700"><span className="text-emerald-600">✓</span>{item}</div>
          ))}
        </div>
      </section>
    </div>
  )
}

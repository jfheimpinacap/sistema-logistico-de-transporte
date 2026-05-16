import { useEffect, useMemo, useState } from 'react'
import { ReportMetricCard } from '../components/reports/ReportMetricCard'
import { useAuth } from '../hooks/useAuth'
import { useAppRouter } from '../routes/AppRoutes'
import { getReadableReportError, reportsService } from '../services/reportsService'
import type { ReportsOverview } from '../types/reports'
import { toNumber } from '../utils/reportLabels'

const mvpStatus = [
  'Prompt 001: Base monorepo', 'Prompt 002: Backend y autenticación', 'Prompt 003: Frontend operativo base', 'Prompt 004: Backend maestros logísticos', 'Prompt 005: Frontend CRUD de maestros logísticos', 'Prompt 006: Backend operativo de encomiendas', 'Prompt 007: Frontend operativo de encomiendas, bultos y tracking', 'Prompt 008: Backend de rutas, paradas y asignación', 'Prompt 009: Frontend de rutas, paradas y asignación', 'Prompt 010: Backend de evidencias e incidencias', 'Prompt 011: Frontend de evidencias e incidencias operativas', 'Prompt 012: Vista conductor responsive MVP', 'Prompt 013: Backend de documentos internos logísticos', 'Prompt 014: Frontend de documentos internos logísticos', 'Prompt 015: Backend de reportes operativos y métricas', 'Prompt 016: Frontend de reportes operativos y dashboard analítico', 'Prompt 017: Exportación CSV compatible con Excel', 'Prompt 018: Exportación CSV en listados operativos y cierre MVP', 'Prompt 019: QA funcional y pruebas manuales guiadas', 'Prompt 020: Backend de georreferenciación base', 'Prompt 021: Frontend geográfico base y diagnóstico de coordenadas/rutas',
]

export function DashboardPage() {
  const { navigate } = useAppRouter()
  const { accessToken } = useAuth()
  const [overview, setOverview] = useState<ReportsOverview>({})
  const [metricsWarning, setMetricsWarning] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) return
    async function loadMetrics() {
      try {
        setOverview(await reportsService.getOverview({ token: accessToken! }))
        setMetricsWarning(null)
      } catch (error) {
        setMetricsWarning(`${getReadableReportError(error)} El dashboard sigue disponible.`)
      }
    }
    void loadMetrics()
  }, [accessToken])

  const cards = useMemo(() => [
    { title: 'Encomiendas activas', value: toNumber(overview.shipments?.active), variant: 'info' as const },
    { title: 'En tránsito', value: toNumber(overview.shipments?.in_transit), variant: 'info' as const },
    { title: 'Entregadas', value: toNumber(overview.shipments?.delivered), variant: 'success' as const },
    { title: 'Rutas en curso', value: toNumber(overview.routes?.in_progress), variant: 'info' as const },
    { title: 'Rutas completadas', value: toNumber(overview.routes?.completed), variant: 'success' as const },
    { title: 'Incidencias abiertas', value: toNumber(overview.incidents?.open), variant: 'warning' as const },
    { title: 'Incidencias críticas', value: toNumber(overview.incidents?.critical), variant: 'danger' as const },
    { title: 'Evidencias pendientes', value: toNumber(overview.delivery_proofs?.pending_review), variant: 'warning' as const },
    { title: 'Documentos emitidos internos', value: toNumber(overview.documents?.issued), variant: 'success' as const },
    { title: 'Documentos borrador', value: toNumber(overview.documents?.draft) },
  ], [overview])

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">⌖ Prompt 021 — Frontend geográfico base y diagnóstico</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Panel de control logístico</h2>
          <p className="mt-3 text-slate-600">Resumen ejecutivo del MVP: maestros, encomiendas, bultos, tracking, rutas, evidencias, incidencias, documentos internos, modo conductor, reportes analíticos y georreferenciación base con distancias lineales estimadas para preparar mapas y optimización futura.</p>
          {metricsWarning ? <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{metricsWarning}</p> : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => navigate('/geo')} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">Abrir georreferenciación</button>
            <button type="button" onClick={() => navigate('/reports')} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Abrir reportes</button>
            <button type="button" onClick={() => navigate('/driver')} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Abrir modo conductor</button>
            <button type="button" onClick={() => navigate('/operations')} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Abrir operación</button>
            <button type="button" onClick={() => navigate('/operations/documents')} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Abrir documentos</button>
            <button type="button" onClick={() => navigate('/masters')} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Abrir maestros</button>
          </div>
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{cards.map((card) => <ReportMetricCard key={card.title} title={card.title} value={card.value} variant={card.variant} />)}</section>
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-lg font-bold text-slate-950">Estado del MVP</h3><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{mvpStatus.map((item) => <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-medium text-slate-700"><span className="text-emerald-600">✓</span>{item}</div>)}</div></section>
    </div>
  )
}

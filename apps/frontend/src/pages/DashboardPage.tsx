import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useAppRouter } from '../routes/AppRoutes'
import { listDocuments } from '../services/documentsService'
import { listDeliveryProofs, listIncidents } from '../services/fieldOpsService'
import { listShipments } from '../services/operationsService'
import { listRoutes } from '../services/routingService'
import type { LogisticsDocument } from '../types/documents'
import type { DeliveryProof, Incident } from '../types/fieldops'
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
  'Prompt 010: Backend de evidencias e incidencias',
  'Prompt 011: Frontend de evidencias e incidencias operativas',
  'Prompt 012: Vista conductor responsive MVP',
  'Prompt 013: Backend de documentos internos logísticos',
  'Prompt 014: Frontend de documentos internos logísticos',
]

export function DashboardPage() {
  const { navigate } = useAppRouter()
  const { accessToken } = useAuth()
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [deliveryProofs, setDeliveryProofs] = useState<DeliveryProof[]>([])
  const [documents, setDocuments] = useState<LogisticsDocument[]>([])
  const [metricsWarning, setMetricsWarning] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) return

    async function loadMetrics() {
      try {
        const [shipmentData, routeData, incidentData, proofData, documentData] = await Promise.all([
          listShipments({ token: accessToken!, is_active: 'all' }),
          listRoutes({ token: accessToken!, is_active: 'all' }),
          listIncidents({ token: accessToken!, is_active: 'all' }),
          listDeliveryProofs({ token: accessToken!, is_active: 'all' }),
          listDocuments({ token: accessToken!, is_active: 'all' }),
        ])
        setShipments(shipmentData)
        setRoutes(routeData)
        setIncidents(incidentData)
        setDeliveryProofs(proofData)
        setDocuments(documentData)
        setMetricsWarning(null)
      } catch {
        setMetricsWarning('No fue posible cargar métricas operativas. El dashboard sigue disponible.')
      }
    }

    void loadMetrics()
  }, [accessToken])

  const cards = useMemo(() => {
    const routesInProgress = routes.filter((route) => route.status === 'in_progress').length
    const openIncidents = incidents.filter((incident) => incident.status === 'open').length
    const criticalIncidents = incidents.filter((incident) => incident.severity === 'critical').length
    const pendingProofs = deliveryProofs.filter((proof) => proof.status === 'pending_review').length
    const acceptedProofs = deliveryProofs.filter((proof) => proof.status === 'accepted').length
    const draftDocuments = documents.filter((document) => document.status === 'draft').length
    const issuedDocuments = documents.filter((document) => document.status === 'issued').length
    const cancelledDocuments = documents.filter((document) => document.status === 'cancelled').length
    return [
      { label: 'Encomiendas registradas', value: String(shipments.length), icon: '▣' },
      { label: 'Rutas en curso', value: String(routesInProgress), icon: '◷' },
      { label: 'Incidencias abiertas', value: String(openIncidents), icon: '!' },
      { label: 'Incidencias críticas', value: String(criticalIncidents), icon: '‼' },
      { label: 'Evidencias pendientes', value: String(pendingProofs), icon: '?' },
      { label: 'Evidencias aceptadas', value: String(acceptedProofs), icon: '✓' },
      { label: 'Documentos registrados', value: String(documents.length), icon: '□' },
      { label: 'Documentos borrador', value: String(draftDocuments), icon: '✎' },
      { label: 'Documentos emitidos internos', value: String(issuedDocuments), icon: '✓' },
      { label: 'Documentos anulados', value: String(cancelledDocuments), icon: '×' },
    ]
  }, [deliveryProofs, documents, incidents, routes, shipments])

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">
            ▣ Prompt 014 — Frontend de documentos internos logísticos
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Panel de control logístico</h2>
          <p className="mt-3 text-slate-600">
            El módulo operativo ya permite administrar encomiendas, bultos, tracking, rutas, evidencias, incidencias y documentos internos/provisorios; además incluye un modo conductor responsive para operar rutas desde pantallas pequeñas.
          </p>
          {metricsWarning ? <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{metricsWarning}</p> : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => navigate('/driver')} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">Abrir modo conductor</button>
            <button type="button" onClick={() => navigate('/operations')} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Abrir operación</button>
            <button type="button" onClick={() => navigate('/operations/documents')} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Abrir documentos</button>
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

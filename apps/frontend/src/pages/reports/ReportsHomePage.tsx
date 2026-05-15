import { useCallback, useEffect, useMemo, useState } from 'react'
import { ReportFiltersBar } from '../../components/reports/ReportFiltersBar'
import { ReportMetricCard } from '../../components/reports/ReportMetricCard'
import { ReportSection } from '../../components/reports/ReportSection'
import { useAuth } from '../../hooks/useAuth'
import { useAppRouter } from '../../routes/AppRoutes'
import { getReadableReportError, reportsService } from '../../services/reportsService'
import type { ReportFilters, ReportsOverview } from '../../types/reports'
import { toNumber } from '../../utils/reportLabels'

const links = [ ['Encomiendas','/reports/shipments'], ['Rutas','/reports/routes'], ['Incidencias','/reports/incidents'], ['Documentos','/reports/documents'], ['Conductores','/reports/drivers'], ['Vehículos','/reports/vehicles'] ]
export function ReportsHomePage() {
  const { accessToken } = useAuth(); const { navigate } = useAppRouter(); const [filters,setFilters]=useState<ReportFilters>({is_active:'all'}); const [applied,setApplied]=useState<ReportFilters>({is_active:'all'}); const [data,setData]=useState<ReportsOverview>({}); const [loading,setLoading]=useState(false); const [error,setError]=useState<string|null>(null)
  const load=useCallback(async()=>{ if(!accessToken) return; setLoading(true); try{ setData(await reportsService.getOverview({token:accessToken,...applied})); setError(null)}catch(e){setError(getReadableReportError(e))}finally{setLoading(false)}},[accessToken,applied])
  useEffect(()=>{void load()},[load])
  const cards=useMemo(()=>[
    {title:'Encomiendas activas',value:toNumber(data.shipments?.active),variant:'info' as const},{title:'En tránsito',value:toNumber(data.shipments?.in_transit),variant:'info' as const},{title:'Entregadas',value:toNumber(data.shipments?.delivered),variant:'success' as const},{title:'Entregas fallidas',value:toNumber(data.shipments?.failed_delivery),variant:'danger' as const},{title:'Rutas en curso',value:toNumber(data.routes?.in_progress),variant:'info' as const},{title:'Rutas completadas',value:toNumber(data.routes?.completed),variant:'success' as const},{title:'Incidencias abiertas',value:toNumber(data.incidents?.open),variant:'warning' as const},{title:'Incidencias críticas',value:toNumber(data.incidents?.critical),variant:'danger' as const},{title:'Evidencias pendientes',value:toNumber(data.delivery_proofs?.pending_review),variant:'warning' as const},{title:'Documentos emitidos internos',value:toNumber(data.documents?.issued),variant:'success' as const},
  ],[data])
  return <div className="space-y-6"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">Dashboard analítico</p><h2 className="mt-2 text-3xl font-bold text-slate-950">Reportes operativos</h2><p className="mt-2 text-slate-600">Resumen ejecutivo del TMS liviano con métricas operativas actualizadas.</p></div><ReportFiltersBar filters={filters} onChange={setFilters} onApply={()=>setApplied(filters)} onClear={()=>{setFilters({is_active:'all'});setApplied({is_active:'all'})}} onRefresh={load} showIsActive={false}/><ReportSection title="Resumen general" description="Métricas consolidadas desde /api/reports/overview/." isLoading={loading} error={error} onRetry={load}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{cards.map((c)=><ReportMetricCard key={c.title} title={c.title} value={c.value} variant={c.variant}/>)}</div></ReportSection><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{links.map(([label,path])=><button key={path} type="button" onClick={()=>navigate(path)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><p className="text-lg font-bold text-slate-900">{label}</p><p className="mt-2 text-sm text-slate-500">Abrir reporte específico</p></button>)}</section></div>
}

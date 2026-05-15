import type { ReactNode } from 'react'
import { ReportErrorState } from './ReportErrorState'
export function ReportSection({ title, description, children, isLoading, error, onRetry }: { title: string; description?: string; children: ReactNode; isLoading?: boolean; error?: string | null; onRetry?: () => void }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5"><h3 className="text-lg font-bold text-slate-950">{title}</h3>{description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}</div>{isLoading ? <div className="rounded-2xl bg-slate-50 p-6 text-sm font-semibold text-slate-500">Cargando métricas...</div> : error ? <ReportErrorState message={error} onRetry={onRetry} /> : children}</section>
}

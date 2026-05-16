import { useCallback, useEffect, useMemo, useState } from 'react'
import { AddressGeoTable } from '../../components/geo/AddressGeoTable'
import { DistanceCalculatorPanel } from '../../components/geo/DistanceCalculatorPanel'
import { GeoMetricCard } from '../../components/geo/GeoMetricCard'
import { GeoWarningBanner } from '../../components/geo/GeoWarningBanner'
import { RouteDistancePanel } from '../../components/geo/RouteDistancePanel'
import { useAuth } from '../../hooks/useAuth'
import { geoService, getReadableGeoError } from '../../services/geoService'
import type { AddressCheckResponse, GeoSummaryMetric } from '../../types/geo'

export function GeoPage() {
  const { accessToken } = useAuth()
  const [onlyMissing, setOnlyMissing] = useState(false)
  const [data, setData] = useState<AddressCheckResponse>({ addresses: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAddressCheck = useCallback(async () => {
    if (!accessToken) return
    setIsLoading(true)
    try {
      setData(await geoService.getAddressCheck({ token: accessToken, only_missing: onlyMissing }))
      setError(null)
    } catch (err) {
      setError(getReadableGeoError(err))
      setData({ addresses: [] })
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, onlyMissing])

  useEffect(() => {
    void loadAddressCheck()
  }, [loadAddressCheck])

  const metrics = useMemo<GeoSummaryMetric[]>(() => [
    { label: 'Total direcciones', value: data.total_addresses ?? 0, description: 'Direcciones revisadas' },
    { label: 'Con coordenadas', value: data.with_coordinates ?? 0, tone: 'emerald' },
    { label: 'Sin coordenadas', value: data.missing_coordinates ?? 0, tone: 'amber' },
    { label: 'Inválidas', value: data.invalid_coordinates ?? 0, tone: 'rose' },
  ], [data])

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">⌖ Prompt 021 — Geo base</span>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Georreferenciación base</h2>
        <p className="mt-3 max-w-3xl text-slate-600">Diagnóstico de coordenadas y distancias lineales estimadas para preparar mapas y optimización futura.</p>
      </section>

      <GeoWarningBanner />

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-600">Direcciones</p>
            <h3 className="mt-2 text-xl font-bold text-slate-950">Diagnóstico de coordenadas</h3>
            <p className="mt-1 text-sm text-slate-500">Revisa direcciones con coordenadas faltantes o inválidas antes de usar cálculos de ruta.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setOnlyMissing(false)} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${!onlyMissing ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>Todas</button>
            <button type="button" onClick={() => setOnlyMissing(true)} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${onlyMissing ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>Solo sin coordenadas</button>
            <button type="button" onClick={loadAddressCheck} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Recargar</button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => <GeoMetricCard key={metric.label} label={metric.label} value={metric.value} description={metric.description} tone={metric.tone} />)}
        </div>
        <AddressGeoTable addresses={data.addresses ?? []} isLoading={isLoading} error={error} />
      </section>

      <DistanceCalculatorPanel />
      <RouteDistancePanel />
    </div>
  )
}

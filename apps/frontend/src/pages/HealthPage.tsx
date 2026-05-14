import { useEffect, useState } from 'react'
import { API_BASE_URL, apiRequest } from '../services/apiClient'

type HealthResponse = {
  status: string
  service: string
  version: string
}

export function HealthPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadHealth() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await apiRequest<HealthResponse>('/health/')
        setHealth(data)
      } catch (requestError) {
        setHealth(null)
        setError(requestError instanceof Error ? requestError.message : 'No fue posible conectar con el backend.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadHealth()
  }, [])

  const isOnline = Boolean(health && !error)

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
          ◉ GET /api/health/
        </span>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Estado del sistema</h2>
        <p className="mt-3 text-slate-600">Consulta en vivo al backend configurado en {API_BASE_URL}.</p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {isOnline ? '✓' : '×'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">Conexión backend</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-950">
              {isLoading ? 'Consultando...' : isOnline ? 'Backend disponible' : 'Backend no responde'}
            </h3>
            {error ? <p className="mt-3 rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p> : null}
          </div>
        </div>

        {health ? (
          <dl className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-sm font-medium text-slate-500">Status</dt>
              <dd className="mt-1 text-lg font-bold text-slate-900">{health.status}</dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-sm font-medium text-slate-500">Service</dt>
              <dd className="mt-1 text-lg font-bold text-slate-900">{health.service}</dd>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <dt className="text-sm font-medium text-slate-500">Version</dt>
              <dd className="mt-1 text-lg font-bold text-slate-900">{health.version}</dd>
            </div>
          </dl>
        ) : null}
      </section>
    </div>
  )
}

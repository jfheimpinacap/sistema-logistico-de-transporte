import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { geoService, getReadableGeoError } from '../../services/geoService'
import type { DistanceCalculationResponse } from '../../types/geo'

const initialForm = {
  fromLatitude: '-33.448890',
  fromLongitude: '-70.669265',
  toLatitude: '-33.426280',
  toLongitude: '-70.617096',
  averageSpeedKmh: '35',
}

function isCoordinateInRange(value: number, min: number, max: number) {
  return Number.isFinite(value) && value >= min && value <= max
}

export function DistanceCalculatorPanel() {
  const { accessToken } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState<DistanceCalculationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function validate() {
    const fromLatitude = Number(form.fromLatitude)
    const fromLongitude = Number(form.fromLongitude)
    const toLatitude = Number(form.toLatitude)
    const toLongitude = Number(form.toLongitude)
    const averageSpeedKmh = Number(form.averageSpeedKmh)
    if (!isCoordinateInRange(fromLatitude, -90, 90)) return 'Latitud de origen inválida. Debe estar entre -90 y 90.'
    if (!isCoordinateInRange(toLatitude, -90, 90)) return 'Latitud de destino inválida. Debe estar entre -90 y 90.'
    if (!isCoordinateInRange(fromLongitude, -180, 180)) return 'Longitud de origen inválida. Debe estar entre -180 y 180.'
    if (!isCoordinateInRange(toLongitude, -180, 180)) return 'Longitud de destino inválida. Debe estar entre -180 y 180.'
    if (!Number.isFinite(averageSpeedKmh) || averageSpeedKmh <= 0) return 'La velocidad promedio debe ser mayor que cero.'
    return null
  }

  async function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      setResult(null)
      return
    }
    if (!accessToken) return
    setIsLoading(true)
    try {
      const payload = {
        from: { latitude: Number(form.fromLatitude), longitude: Number(form.fromLongitude) },
        to: { latitude: Number(form.toLatitude), longitude: Number(form.toLongitude) },
        average_speed_kmh: Number(form.averageSpeedKmh),
      }
      setResult(await geoService.calculateDistance(payload, accessToken))
      setError(null)
    } catch (err) {
      setError(getReadableGeoError(err))
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = 'mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100'

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-600">Calculadora manual</p>
        <h3 className="mt-2 text-xl font-bold text-slate-950">Distancia entre dos puntos</h3>
        <p className="mt-1 text-sm text-slate-500">Ingresa coordenadas para calcular una distancia lineal Haversine y duración aproximada.</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <label className="text-sm font-medium text-slate-700">Latitud origen<input className={inputClass} value={form.fromLatitude} onChange={(event: { target: { value: string } }) => updateField('fromLatitude', event.target.value)} /></label>
        <label className="text-sm font-medium text-slate-700">Longitud origen<input className={inputClass} value={form.fromLongitude} onChange={(event: { target: { value: string } }) => updateField('fromLongitude', event.target.value)} /></label>
        <label className="text-sm font-medium text-slate-700">Latitud destino<input className={inputClass} value={form.toLatitude} onChange={(event: { target: { value: string } }) => updateField('toLatitude', event.target.value)} /></label>
        <label className="text-sm font-medium text-slate-700">Longitud destino<input className={inputClass} value={form.toLongitude} onChange={(event: { target: { value: string } }) => updateField('toLongitude', event.target.value)} /></label>
        <label className="text-sm font-medium text-slate-700">Velocidad km/h<input className={inputClass} value={form.averageSpeedKmh} onChange={(event: { target: { value: string } }) => updateField('averageSpeedKmh', event.target.value)} /></label>
        <div className="md:col-span-2 xl:col-span-5">
          <button type="submit" disabled={isLoading} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{isLoading ? 'Calculando...' : 'Calcular distancia'}</button>
        </div>
      </form>
      {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
      {result ? (
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Distancia</p><p className="mt-1 text-2xl font-bold text-slate-950">{result.distance_km ?? '—'} km</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Duración estimada</p><p className="mt-1 text-2xl font-bold text-slate-950">{result.estimated_duration_minutes ?? '—'} min</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Método</p><p className="mt-1 font-semibold text-slate-800">{result.method ?? 'Haversine'}</p></div>
          {result.warning ? <p className="md:col-span-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">{result.warning}</p> : null}
        </div>
      ) : null}
    </section>
  )
}

export function GeoWarningBanner() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 shadow-sm">
      <p className="font-bold">Distancia lineal estimada con fórmula Haversine</p>
      <p className="mt-1">No considera calles, tráfico, restricciones, sentido de tránsito ni peajes.</p>
    </div>
  )
}

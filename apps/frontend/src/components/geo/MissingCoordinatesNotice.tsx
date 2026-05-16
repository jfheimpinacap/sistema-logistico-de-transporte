type Props = {
  missingCount?: number | null
}

export function MissingCoordinatesNotice({ missingCount = 0 }: Props) {
  if (!missingCount || missingCount <= 0) return null

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
      <p className="font-bold">Hay {missingCount} parada(s) sin coordenadas válidas.</p>
      <p className="mt-1">Completa latitud/longitud en Maestros &gt; Direcciones para mejorar el cálculo.</p>
    </div>
  )
}

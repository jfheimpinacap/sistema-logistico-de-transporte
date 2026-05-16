import type { GeoMapPoint, GeoMapSegment } from '../../types/geo'
import type { RoutingId } from '../../types/routing'
import { buildGeoBounds, projectGeoPoints } from '../../utils/geoProjection'

type Props = {
  points: GeoMapPoint[]
  segments: GeoMapSegment[]
  selectedPointId?: RoutingId | null
  onSelectPoint?: (point: GeoMapPoint) => void
  width?: number
  height?: number
  showLabels?: boolean
  showSegments?: boolean
}

function pointKey(value: RoutingId | null | undefined) {
  return String(value ?? '')
}

export function GeoSchematicMap({ points, segments, selectedPointId, onSelectPoint, width = 920, height = 520, showLabels = true, showSegments = true }: Props) {
  const bounds = buildGeoBounds(points)
  const projected = projectGeoPoints(points, bounds, width, height, 52)
  const projectedById = new Map(projected.map((item) => [pointKey(item.point.id), item]))
  const selectedKey = pointKey(selectedPointId)
  const gridLines = [0.2, 0.4, 0.6, 0.8]

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Mapa esquemático interno de ruta" className="h-auto w-full bg-slate-50">
        <rect x="0" y="0" width={width} height={height} rx="28" className="fill-slate-50" />
        {gridLines.map((ratio) => (
          <g key={ratio} className="stroke-slate-200">
            <line x1={width * ratio} y1="24" x2={width * ratio} y2={height - 24} strokeDasharray="6 8" />
            <line x1="24" y1={height * ratio} x2={width - 24} y2={height * ratio} strokeDasharray="6 8" />
          </g>
        ))}
        <rect x="24" y="24" width={width - 48} height={height - 48} rx="22" className="fill-transparent stroke-slate-200" />

        {projected.length === 0 ? (
          <text x={width / 2} y={height / 2} textAnchor="middle" className="fill-slate-500 text-sm font-semibold">No hay coordenadas disponibles para dibujar la ruta.</text>
        ) : null}
        {projected.length === 1 ? (
          <text x={width / 2} y={height - 34} textAnchor="middle" className="fill-amber-700 text-xs font-semibold">La ruta tiene un solo punto con coordenadas; agrega más paradas para visualizar segmentos.</text>
        ) : null}

        {showSegments ? segments.map((segment, index) => {
          const from = projectedById.get(pointKey(segment.fromPointId))
          const to = projectedById.get(pointKey(segment.toPointId))
          if (!from || !to) return null
          const midX = (from.x + to.x) / 2
          const midY = (from.y + to.y) / 2
          return (
            <g key={`${segment.fromPointId}-${segment.toPointId}-${index}`}>
              <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} className="stroke-cyan-500" strokeWidth="3" strokeLinecap="round" strokeDasharray={segment.warning ? '8 8' : undefined} />
              <rect x={midX - 34} y={midY - 13} width="68" height="22" rx="11" className="fill-white/90 stroke-cyan-100" />
              <text x={midX} y={midY + 4} textAnchor="middle" className="fill-cyan-800 text-[11px] font-bold">{segment.distance_km ?? '—'} km</text>
            </g>
          )
        }) : null}

        {projected.map(({ point, x, y }) => {
          const selected = pointKey(point.id) === selectedKey
          return (
            <g key={pointKey(point.id)} className="cursor-pointer" onClick={() => onSelectPoint?.(point)}>
              <circle cx={x} cy={y} r={selected ? 18 : 14} className={selected ? 'fill-slate-950 stroke-cyan-300' : 'fill-cyan-600 stroke-white'} strokeWidth="4" />
              <text x={x} y={y + 4} textAnchor="middle" className="pointer-events-none fill-white text-xs font-bold">{point.sequence ?? '•'}</text>
              {showLabels ? (
                <g>
                  <rect x={x + 18} y={y - 17} width={Math.min(Math.max(point.label.length * 7, 92), 220)} height="28" rx="14" className="fill-white/95 stroke-slate-200" />
                  <text x={x + 30} y={y + 1} className="fill-slate-800 text-xs font-semibold">{point.label.length > 28 ? `${point.label.slice(0, 28)}…` : point.label}</text>
                </g>
              ) : null}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

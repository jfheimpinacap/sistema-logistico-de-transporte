import type { GeoMapBounds, GeoMapPoint, GeoMapProjectionPoint, Nullable } from '../types/geo'

const MIN_COORDINATE_RANGE = 0.01
const POINT_COLLISION_RADIUS = 18

function toFiniteNumber(value: Nullable<number | string>) {
  if (value === null || value === undefined || value === '') return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

function isLatitude(value: number | null): value is number {
  return value !== null && value >= -90 && value <= 90
}

function isLongitude(value: number | null): value is number {
  return value !== null && value >= -180 && value <= 180
}

function normalizePointCoordinates(point: Pick<GeoMapPoint, 'latitude' | 'longitude'> | null | undefined): { latitude: number; longitude: number } | null {
  if (!point) return null
  const latitude = toFiniteNumber(point.latitude)
  const longitude = toFiniteNumber(point.longitude)
  if (!isLatitude(latitude) || !isLongitude(longitude)) return null
  return { latitude, longitude }
}

export function hasUsableCoordinates(point: Pick<GeoMapPoint, 'latitude' | 'longitude'> | null | undefined) {
  return normalizePointCoordinates(point) !== null
}

export function buildGeoBounds(points: GeoMapPoint[]): GeoMapBounds | null {
  const validPoints = points
    .map(normalizePointCoordinates)
    .filter((point): point is { latitude: number; longitude: number } => point !== null)

  if (validPoints.length === 0) return null

  const latitudes = validPoints.map((point) => point.latitude)
  const longitudes = validPoints.map((point) => point.longitude)
  let minLat = Math.min(...latitudes)
  let maxLat = Math.max(...latitudes)
  let minLon = Math.min(...longitudes)
  let maxLon = Math.max(...longitudes)

  // Expand zero or tiny ranges so one-point, equal-latitude and equal-longitude routes never divide by zero.
  if (maxLat - minLat < MIN_COORDINATE_RANGE) {
    const center = (minLat + maxLat) / 2
    minLat = center - MIN_COORDINATE_RANGE / 2
    maxLat = center + MIN_COORDINATE_RANGE / 2
  }
  if (maxLon - minLon < MIN_COORDINATE_RANGE) {
    const center = (minLon + maxLon) / 2
    minLon = center - MIN_COORDINATE_RANGE / 2
    maxLon = center + MIN_COORDINATE_RANGE / 2
  }

  return { minLat, maxLat, minLon, maxLon }
}

export function projectGeoPoint(point: GeoMapPoint, bounds: GeoMapBounds | null | undefined, width: number, height: number, padding = 32): GeoMapProjectionPoint | null {
  const coordinates = normalizePointCoordinates(point)
  if (!bounds || !coordinates) return null

  const safeWidth = Number.isFinite(width) && width > 0 ? width : 1
  const safeHeight = Number.isFinite(height) && height > 0 ? height : 1
  const safePadding = Math.max(Math.min(padding, safeWidth / 3, safeHeight / 3), 0)
  const usableWidth = Math.max(safeWidth - safePadding * 2, 1)
  const usableHeight = Math.max(safeHeight - safePadding * 2, 1)
  const lonRange = Math.max(bounds.maxLon - bounds.minLon, MIN_COORDINATE_RANGE)
  const latRange = Math.max(bounds.maxLat - bounds.minLat, MIN_COORDINATE_RANGE)
  const x = safePadding + ((coordinates.longitude - bounds.minLon) / lonRange) * usableWidth
  const y = safePadding + ((bounds.maxLat - coordinates.latitude) / latRange) * usableHeight

  if (!Number.isFinite(x) || !Number.isFinite(y)) return null
  return { x, y, point }
}

export function projectGeoPoints(points: GeoMapPoint[], bounds: GeoMapBounds | null | undefined, width: number, height: number, padding = 32) {
  const projected = points
    .map((point) => projectGeoPoint(point, bounds, width, height, padding))
    .filter((point): point is GeoMapProjectionPoint => point !== null)

  return projected.map((item, index, all) => {
    const nearbyBefore = all.slice(0, index).filter((other) => Math.hypot(other.x - item.x, other.y - item.y) < POINT_COLLISION_RADIUS)
    if (nearbyBefore.length === 0) return item
    const angle = ((nearbyBefore.length - 1) % 8) * (Math.PI / 4)
    const radius = POINT_COLLISION_RADIUS + Math.floor((nearbyBefore.length - 1) / 8) * 8
    return {
      ...item,
      x: Math.min(Math.max(item.x + Math.cos(angle) * radius, padding), width - padding),
      y: Math.min(Math.max(item.y + Math.sin(angle) * radius, padding), height - padding),
    }
  })
}

export function normalizeCoordinateLabel(latitude: Nullable<number | string>, longitude: Nullable<number | string>) {
  const coordinates = normalizePointCoordinates({ latitude, longitude })
  if (!coordinates) return 'Sin coordenadas válidas'
  return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`
}

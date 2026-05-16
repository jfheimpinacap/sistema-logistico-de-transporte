import type { GeoMapBounds, GeoMapPoint, GeoMapProjectionPoint, Nullable } from '../types/geo'

function toNumber(value: Nullable<number | string>) {
  if (value === null || value === undefined || value === '') return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

export function hasUsableCoordinates(point: Pick<GeoMapPoint, 'latitude' | 'longitude'> | null | undefined) {
  if (!point) return false
  return toNumber(point.latitude) !== null && toNumber(point.longitude) !== null
}

export function buildGeoBounds(points: GeoMapPoint[]): GeoMapBounds | null {
  const validPoints = points
    .map((point) => ({ latitude: toNumber(point.latitude), longitude: toNumber(point.longitude) }))
    .filter((point): point is { latitude: number; longitude: number } => point.latitude !== null && point.longitude !== null)

  if (validPoints.length === 0) return null

  const latitudes = validPoints.map((point) => point.latitude)
  const longitudes = validPoints.map((point) => point.longitude)
  let minLat = Math.min(...latitudes)
  let maxLat = Math.max(...latitudes)
  let minLon = Math.min(...longitudes)
  let maxLon = Math.max(...longitudes)

  if (minLat === maxLat) {
    minLat -= 0.01
    maxLat += 0.01
  }
  if (minLon === maxLon) {
    minLon -= 0.01
    maxLon += 0.01
  }

  return { minLat, maxLat, minLon, maxLon }
}

export function projectGeoPoint(point: GeoMapPoint, bounds: GeoMapBounds | null | undefined, width: number, height: number, padding = 32): GeoMapProjectionPoint | null {
  const latitude = toNumber(point.latitude)
  const longitude = toNumber(point.longitude)
  if (!bounds || latitude === null || longitude === null) return null

  const usableWidth = Math.max(width - padding * 2, 1)
  const usableHeight = Math.max(height - padding * 2, 1)
  const lonRange = bounds.maxLon - bounds.minLon || 1
  const latRange = bounds.maxLat - bounds.minLat || 1
  const x = padding + ((longitude - bounds.minLon) / lonRange) * usableWidth
  const y = padding + ((bounds.maxLat - latitude) / latRange) * usableHeight

  return { x, y, point }
}

export function projectGeoPoints(points: GeoMapPoint[], bounds: GeoMapBounds | null | undefined, width: number, height: number, padding = 32) {
  return points
    .map((point) => projectGeoPoint(point, bounds, width, height, padding))
    .filter((point): point is GeoMapProjectionPoint => point !== null)
}

export function normalizeCoordinateLabel(latitude: Nullable<number | string>, longitude: Nullable<number | string>) {
  const lat = toNumber(latitude)
  const lon = toNumber(longitude)
  if (lat === null || lon === null) return 'Sin coordenadas'
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`
}

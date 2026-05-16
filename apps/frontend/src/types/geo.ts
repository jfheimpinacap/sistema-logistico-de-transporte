import type { RoutingId } from './routing'

export type Nullable<T> = T | null | undefined

export type GeoCoordinate = {
  latitude?: Nullable<number | string>
  longitude?: Nullable<number | string>
}

export type AddressCheckItem = {
  id?: Nullable<number | string>
  label?: Nullable<string>
  display?: Nullable<string>
  street?: Nullable<string>
  number?: Nullable<string>
  commune?: Nullable<string>
  city?: Nullable<string>
  region?: Nullable<string>
  country?: Nullable<string>
  latitude?: Nullable<number | string>
  longitude?: Nullable<number | string>
  coordinates?: Nullable<string>
  has_coordinates?: Nullable<boolean>
  has_valid_coordinates?: Nullable<boolean>
  is_valid?: Nullable<boolean>
  status?: Nullable<string>
  warnings?: Nullable<string[]>
  errors?: Nullable<string[]>
}

export type AddressCheckResponse = {
  total_addresses?: Nullable<number>
  with_coordinates?: Nullable<number>
  missing_coordinates?: Nullable<number>
  invalid_coordinates?: Nullable<number>
  addresses?: Nullable<AddressCheckItem[]>
}

export type DistanceCalculationPayload = {
  from: GeoCoordinate
  to: GeoCoordinate
  average_speed_kmh?: Nullable<number | string>
}

export type DistanceCalculationResponse = {
  distance_km?: Nullable<number | string>
  estimated_duration_minutes?: Nullable<number>
  method?: Nullable<string>
  warning?: Nullable<string>
}

export type RouteDistanceStopPayload = {
  stop_id?: Nullable<number | string>
  sequence?: Nullable<number>
  address_id?: Nullable<number | string>
  address_label?: Nullable<string>
  address_display?: Nullable<string>
  coordinates?: Nullable<GeoCoordinate>
}

export type RouteDistanceSegment = {
  from_stop_id?: Nullable<number | string>
  to_stop_id?: Nullable<number | string>
  from_sequence?: Nullable<number>
  to_sequence?: Nullable<number>
  from_label?: Nullable<string>
  to_label?: Nullable<string>
  from_coordinates?: Nullable<GeoCoordinate>
  to_coordinates?: Nullable<GeoCoordinate>
  from_stop?: Nullable<RouteDistanceStopPayload>
  to_stop?: Nullable<RouteDistanceStopPayload>
  distance_km?: Nullable<number | string>
  estimated_duration_minutes?: Nullable<number>
  method?: Nullable<string>
  warning?: Nullable<string>
}

export type RouteDistanceSummary = {
  route_id?: Nullable<RoutingId>
  route_code?: Nullable<string>
  stops_total?: Nullable<number>
  stops_with_coordinates?: Nullable<number>
  stops_missing_coordinates?: Nullable<number>
  stops?: Nullable<RouteDistanceStopPayload[]>
  distance_km?: Nullable<number | string>
  estimated_duration_minutes?: Nullable<number>
  segments?: Nullable<RouteDistanceSegment[]>
  warnings?: Nullable<string[]>
  method?: Nullable<string>
}

export type UpdateRouteEstimatesPayload = {
  average_speed_kmh?: Nullable<number | string>
}

export type UpdateRouteEstimatesResponse = {
  route_id?: Nullable<RoutingId>
  route_code?: Nullable<string>
  estimated_distance_km?: Nullable<number | string>
  estimated_duration_minutes?: Nullable<number>
  distance_summary?: Nullable<RouteDistanceSummary>
}

export type GeoError = {
  message: string
  status?: number
  fields?: Record<string, unknown>
}

export type GeoSummaryMetric = {
  key?: string
  label: string
  value: string | number
  description?: string
  tone?: 'slate' | 'cyan' | 'emerald' | 'amber' | 'rose'
}

export type GeoMapPointKind = 'address' | 'route_stop' | 'warehouse' | 'missing'

export type GeoMapPoint = {
  id: RoutingId
  label: string
  latitude?: Nullable<number | string>
  longitude?: Nullable<number | string>
  sequence?: Nullable<number>
  status?: Nullable<string>
  kind: GeoMapPointKind
  metadata?: Record<string, unknown>
}

export type GeoMapBounds = {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}

export type GeoMapSegment = {
  fromPointId: RoutingId
  toPointId: RoutingId
  fromSequence?: Nullable<number>
  toSequence?: Nullable<number>
  distance_km?: Nullable<number | string>
  estimated_duration_minutes?: Nullable<number>
  warning?: Nullable<string>
}

export type GeoMapProjectionPoint = {
  x: number
  y: number
  point: GeoMapPoint
}

export type RouteMapViewData = {
  route_id?: Nullable<RoutingId>
  route_code?: Nullable<string>
  points: GeoMapPoint[]
  segments: GeoMapSegment[]
  missing_points: GeoMapPoint[]
  stops_total?: Nullable<number>
  stops_with_coordinates?: Nullable<number>
  stops_missing_coordinates?: Nullable<number>
  invalid_points?: GeoMapPoint[]
  bounds?: Nullable<GeoMapBounds>
  distance_km?: Nullable<number | string>
  estimated_duration_minutes?: Nullable<number>
  warnings: string[]
}

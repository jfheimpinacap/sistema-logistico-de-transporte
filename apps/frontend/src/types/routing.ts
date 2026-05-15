export type RoutingId = number | string

export type RouteStatus = 'draft' | 'planned' | 'assigned' | 'loaded' | 'in_progress' | 'completed' | 'cancelled' | 'with_incidents'
export type RouteStopStatus = 'pending' | 'arrived' | 'completed' | 'failed' | 'skipped' | 'cancelled'
export type RouteStopType = 'pickup' | 'delivery' | 'transfer' | 'warehouse' | 'return'
export type RouteShipmentStatus = 'assigned' | 'loaded' | 'in_transit' | 'delivered' | 'failed_delivery' | 'returned' | 'cancelled'

export type Route = {
  id: RoutingId
  route_code: string
  name: string
  description?: string
  route_date: string
  planned_start_time?: string | null
  planned_end_time?: string | null
  actual_start_time?: string | null
  actual_end_time?: string | null
  origin_warehouse?: RoutingId | null
  origin_warehouse_name?: string | null
  driver?: RoutingId | null
  driver_name?: string | null
  vehicle?: RoutingId | null
  vehicle_plate?: string | null
  route_name_or_code?: string
  status: RouteStatus | string
  estimated_distance_km?: string | number | null
  estimated_duration_minutes?: number | null
  total_shipments?: number
  total_packages?: number
  total_weight_kg?: string | number | null
  total_volume_m3?: string | number | null
  notes?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
  stops_count?: number
  route_shipments_count?: number
}

export type RouteStop = {
  id: RoutingId
  route: RoutingId
  route_name_or_code?: string
  sequence: number
  address?: RoutingId | null
  address_label?: string | null
  zone?: RoutingId | null
  zone_name?: string | null
  stop_type: RouteStopType | string
  status: RouteStopStatus | string
  planned_arrival_time?: string | null
  actual_arrival_time?: string | null
  completed_at?: string | null
  contact_name?: string
  contact_phone?: string
  instructions?: string
  notes?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type RouteShipment = {
  id: RoutingId
  route: RoutingId
  route_name_or_code?: string
  stop?: RoutingId | null
  shipment: RoutingId
  shipment_tracking_code?: string
  shipment_recipient_name?: string
  stop_sequence?: number | null
  assigned_at?: string
  loaded_at?: string | null
  delivered_at?: string | null
  status: RouteShipmentStatus | string
  notes?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type ChangeRouteStatusPayload = { status: RouteStatus; notes?: string }
export type ChangeRouteStopStatusPayload = { status: RouteStopStatus; notes?: string }
export type AssignShipmentsPayload = { shipment_ids: number[]; stop_id?: number | null }
export type ReorderStopsPayload = { stops: Array<{ id: number; sequence: number }> }

export type DrfListResponse<T> = T[] | { count?: number; next?: string | null; previous?: string | null; results: T[] }
export type RoutingListParams = {
  token: string
  search?: string
  is_active?: 'true' | 'false' | 'all' | boolean
  status?: string
  route_date?: string
  driver?: RoutingId | ''
  vehicle?: RoutingId | ''
  origin_warehouse?: RoutingId | ''
  route?: RoutingId | ''
  stop?: RoutingId | ''
  shipment?: RoutingId | ''
  stop_type?: string
  zone?: RoutingId | ''
}

export type RoutePayload = Record<string, string | number | boolean | null | undefined>
export type RouteStopPayload = Record<string, string | number | boolean | null | undefined>
export type RouteShipmentPayload = Record<string, string | number | boolean | null | undefined>

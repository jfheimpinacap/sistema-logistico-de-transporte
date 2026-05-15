export type OperationId = number | string

export type ShipmentStatus =
  | 'draft'
  | 'received'
  | 'classified'
  | 'ready_for_route'
  | 'assigned_to_route'
  | 'in_transit'
  | 'delivered'
  | 'failed_delivery'
  | 'returned'
  | 'cancelled'

export type ShipmentPriority = 'standard' | 'express' | 'urgent'
export type ShipmentServiceType = 'pickup' | 'delivery' | 'transfer'

export type PackageStatus =
  | 'received'
  | 'classified'
  | 'loaded'
  | 'in_transit'
  | 'delivered'
  | 'failed_delivery'
  | 'returned'
  | 'cancelled'

export type TrackingEventType = 'status_change' | 'manual_note' | 'system' | 'exception'

export type LatestTrackingEvent = {
  id: OperationId
  status: ShipmentStatus | string
  event_type: TrackingEventType | string
  title: string
  location_text?: string | null
  occurred_at: string
}

export type Shipment = {
  id: OperationId
  tracking_code: string
  external_reference?: string | null
  customer?: OperationId | null
  customer_name?: string | null
  origin_address?: OperationId | null
  origin_address_label?: string | null
  destination_address?: OperationId | null
  destination_address_label?: string | null
  origin_warehouse?: OperationId | null
  origin_warehouse_name?: string | null
  sender_name: string
  sender_phone?: string
  sender_email?: string
  recipient_name: string
  recipient_phone?: string
  recipient_email?: string
  description?: string
  package_count: number
  package_count_real?: number
  total_weight_kg?: string | number | null
  total_volume_m3?: string | number | null
  priority: ShipmentPriority | string
  service_type: ShipmentServiceType | string
  current_status: ShipmentStatus | string
  requested_delivery_date?: string | null
  delivery_window_start?: string | null
  delivery_window_end?: string | null
  received_at?: string | null
  delivered_at?: string | null
  notes?: string
  is_active: boolean
  latest_event?: LatestTrackingEvent | null
  created_at?: string
  updated_at?: string
}

export type Package = {
  id: OperationId
  shipment: OperationId
  shipment_tracking_code?: string
  package_code: string
  description?: string
  weight_kg?: string | number | null
  length_cm?: string | number | null
  width_cm?: string | number | null
  height_cm?: string | number | null
  volume_m3?: string | number | null
  declared_value?: string | number | null
  barcode?: string
  status: PackageStatus | string
  is_fragile: boolean
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type TrackingEvent = {
  id: OperationId
  shipment: OperationId
  shipment_tracking_code?: string
  package?: OperationId | null
  package_code?: string | null
  status: ShipmentStatus | string
  event_type: TrackingEventType | string
  title: string
  description?: string
  location_text?: string
  warehouse?: OperationId | null
  warehouse_name?: string | null
  occurred_at: string
  created_at?: string
  created_by?: OperationId | null
  created_by_username?: string | null
}

export type ChangeStatusPayload = {
  status: ShipmentStatus
  title: string
  description?: string
  location_text?: string
  warehouse?: OperationId | null
  occurred_at?: string
}

export type DrfListResponse<T> =
  | T[]
  | {
      count?: number
      next?: string | null
      previous?: string | null
      results: T[]
    }

export type OperationListParams = {
  token: string
  search?: string
  is_active?: 'true' | 'false' | 'all' | boolean
  current_status?: string
  priority?: string
  service_type?: string
  customer?: OperationId | ''
  shipment?: OperationId | ''
  package?: OperationId | ''
  status?: string
}

export type ShipmentPayload = Record<string, string | number | boolean | null | undefined>
export type PackagePayload = Record<string, string | number | boolean | null | undefined>
export type TrackingEventPayload = Record<string, string | number | boolean | null | undefined>

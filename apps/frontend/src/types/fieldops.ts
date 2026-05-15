export type FieldOpsId = number | string

export type DeliveryProofType = 'delivery' | 'failed_delivery' | 'pickup' | 'return'
export type DeliveryProofStatus = 'pending_review' | 'accepted' | 'rejected'

export type IncidentCategory =
  | 'customer_absent'
  | 'wrong_address'
  | 'damaged_package'
  | 'rejected_by_recipient'
  | 'inaccessible_zone'
  | 'vehicle_issue'
  | 'partial_delivery'
  | 'rescheduled'
  | 'returned_to_warehouse'
  | 'lost_package'
  | 'other'
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'
export type IncidentStatus = 'open' | 'in_review' | 'resolved' | 'cancelled'

export type DeliveryProof = {
  id: FieldOpsId
  shipment?: FieldOpsId | null
  shipment_tracking_code?: string | null
  package?: FieldOpsId | null
  package_code?: string | null
  route?: FieldOpsId | null
  route_code?: string | null
  route_stop?: FieldOpsId | null
  route_stop_sequence?: number | null
  route_shipment?: FieldOpsId | null
  route_shipment_status?: string | null
  proof_type: DeliveryProofType | string
  status: DeliveryProofStatus | string
  received_by_name?: string
  received_by_rut?: string
  recipient_relationship?: string
  delivery_notes?: string
  photo?: string | null
  signature_file?: string | null
  signature_text?: string
  latitude?: string | number | null
  longitude?: string | number | null
  location_accuracy_m?: string | number | null
  location_text?: string
  captured_at?: string | null
  created_at?: string
  updated_at?: string
  created_by?: FieldOpsId | null
  created_by_name?: string | null
  reviewed_by?: FieldOpsId | null
  reviewed_by_name?: string | null
  reviewed_at?: string | null
  review_notes?: string
  is_active: boolean
}

export type Incident = {
  id: FieldOpsId
  shipment?: FieldOpsId | null
  shipment_tracking_code?: string | null
  package?: FieldOpsId | null
  package_code?: string | null
  route?: FieldOpsId | null
  route_code?: string | null
  route_stop?: FieldOpsId | null
  route_stop_sequence?: number | null
  route_shipment?: FieldOpsId | null
  driver?: FieldOpsId | null
  driver_name?: string | null
  vehicle?: FieldOpsId | null
  vehicle_plate?: string | null
  incident_code?: string
  category: IncidentCategory | string
  severity: IncidentSeverity | string
  status: IncidentStatus | string
  title: string
  description?: string
  resolution_notes?: string
  location_text?: string
  latitude?: string | number | null
  longitude?: string | number | null
  evidence_file?: string | null
  occurred_at?: string | null
  resolved_at?: string | null
  created_at?: string
  updated_at?: string
  reported_by?: FieldOpsId | null
  reported_by_name?: string | null
  resolved_by?: FieldOpsId | null
  resolved_by_name?: string | null
  is_active: boolean
}

export type AcceptProofPayload = { review_notes?: string }
export type RejectProofPayload = { review_notes?: string }
export type ResolveIncidentPayload = { resolution_notes?: string }
export type CancelIncidentPayload = { resolution_notes?: string }

export type DrfListResponse<T> = T[] | { count?: number; next?: string | null; previous?: string | null; results: T[] }

export type FieldOpsListParams = {
  token: string
  search?: string
  shipment?: FieldOpsId | ''
  package?: FieldOpsId | ''
  route?: FieldOpsId | ''
  route_stop?: FieldOpsId | ''
  route_shipment?: FieldOpsId | ''
  proof_type?: DeliveryProofType | ''
  status?: string
  is_active?: 'true' | 'false' | 'all' | boolean
  driver?: FieldOpsId | ''
  vehicle?: FieldOpsId | ''
  category?: IncidentCategory | ''
  severity?: IncidentSeverity | ''
}

export type FieldOpsPayloadValue = string | number | boolean | File | null | undefined
export type DeliveryProofPayload = Record<string, FieldOpsPayloadValue>
export type IncidentPayload = Record<string, FieldOpsPayloadValue>

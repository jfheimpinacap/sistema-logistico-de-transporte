export type DocumentId = number | string

export type LogisticsDocumentType =
  | 'transfer_note'
  | 'route_manifest'
  | 'route_sheet'
  | 'delivery_receipt'
  | 'incident_report'
  | 'internal_note'

export type LogisticsDocumentStatus = 'draft' | 'issued' | 'cancelled' | 'archived'

export type LogisticsDocument = {
  id: DocumentId
  document_number?: string | null
  document_type: LogisticsDocumentType | string
  document_type_label?: string | null
  status: LogisticsDocumentStatus | string
  status_label?: string | null
  customer?: DocumentId | null
  customer_name?: string | null
  route?: DocumentId | null
  route_code?: string | null
  shipment?: DocumentId | null
  shipment_tracking_code?: string | null
  warehouse?: DocumentId | null
  warehouse_name?: string | null
  driver?: DocumentId | null
  driver_name?: string | null
  vehicle?: DocumentId | null
  vehicle_plate?: string | null
  delivery_proof?: DocumentId | null
  incident?: DocumentId | null
  title: string
  description?: string
  issue_date?: string | null
  issued_at?: string | null
  cancelled_at?: string | null
  archived_at?: string | null
  origin_text?: string
  destination_text?: string
  customer_name_snapshot?: string
  driver_name_snapshot?: string
  vehicle_plate_snapshot?: string
  route_code_snapshot?: string
  shipment_tracking_code_snapshot?: string
  notes?: string
  internal_observations?: string
  external_reference?: string
  sii_reference?: string
  total_shipments?: number | string | null
  total_packages?: number | string | null
  total_weight_kg?: number | string | null
  total_volume_m3?: number | string | null
  created_by?: DocumentId | null
  created_by_name?: string | null
  issued_by?: DocumentId | null
  issued_by_name?: string | null
  cancelled_by?: DocumentId | null
  cancelled_by_name?: string | null
  attachment?: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type LogisticsDocumentLine = {
  id: DocumentId
  document: DocumentId
  line_number: number
  shipment?: DocumentId | null
  shipment_tracking_code?: string | null
  package?: DocumentId | null
  package_code?: string | null
  route_stop?: DocumentId | null
  route_stop_sequence?: number | null
  description: string
  quantity?: number | string | null
  weight_kg?: number | string | null
  volume_m3?: number | string | null
  reference_code?: string
  notes?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type PrintData = {
  document: LogisticsDocument
  lines: LogisticsDocumentLine[]
  generated_at?: string
  title?: string
  totals?: {
    total_shipments?: number | string | null
    total_packages?: number | string | null
    total_weight_kg?: number | string | null
    total_volume_m3?: number | string | null
    [key: string]: unknown
  }
  route?: Record<string, unknown> | null
  shipment?: Record<string, unknown> | null
  related?: Record<string, unknown> | null
  [key: string]: unknown
}

export type IssueDocumentPayload = { notes?: string }
export type CancelDocumentPayload = { notes?: string }
export type ArchiveDocumentPayload = { notes?: string }
export type GenerateFromRoutePayload = { route_id: DocumentId; document_type: Extract<LogisticsDocumentType, 'route_manifest' | 'route_sheet' | 'transfer_note'>; notes?: string }
export type GenerateFromShipmentPayload = { shipment_id: DocumentId; document_type: Extract<LogisticsDocumentType, 'delivery_receipt' | 'transfer_note'>; notes?: string }

export type DrfListResponse<T> = T[] | { count?: number; next?: string | null; previous?: string | null; results: T[] }

export type DocumentsListParams = {
  token: string
  search?: string
  document_type?: LogisticsDocumentType | ''
  status?: LogisticsDocumentStatus | ''
  customer?: DocumentId | ''
  route?: DocumentId | ''
  shipment?: DocumentId | ''
  warehouse?: DocumentId | ''
  driver?: DocumentId | ''
  vehicle?: DocumentId | ''
  is_active?: 'true' | 'false' | 'all' | boolean
  issue_date?: string
}

export type DocumentLinesListParams = {
  token: string
  document?: DocumentId | ''
  shipment?: DocumentId | ''
  package?: DocumentId | ''
  route_stop?: DocumentId | ''
  is_active?: 'true' | 'false' | 'all' | boolean
}

export type DocumentPayloadValue = string | number | boolean | File | null | undefined
export type LogisticsDocumentPayload = Record<string, DocumentPayloadValue>
export type LogisticsDocumentLinePayload = Record<string, string | number | boolean | null | undefined>

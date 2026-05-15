export type ReportCountMap = Record<string, number | null | undefined>

export type KeyValueCount = {
  key?: string
  label?: string
  name?: string
  date?: string
  total?: number | null
  value?: number | null
  count?: number | null
}

export type ReportDateFilters = {
  date_from?: string
  date_to?: string
}

export type ReportFilters = ReportDateFilters & {
  current_status?: string
  status?: string
  priority?: string
  service_type?: string
  customer?: string | number
  driver?: string | number
  vehicle?: string | number
  origin_warehouse?: string | number
  document_type?: string
  category?: string
  severity?: string
  is_active?: 'true' | 'false' | 'all' | ''
  [key: string]: string | number | undefined
}

export type ReportMetricCard = {
  title: string
  value: string | number | null | undefined
  subtitle?: string
  status?: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

export type ReportsOverview = {
  shipments?: ReportCountMap
  routes?: ReportCountMap
  incidents?: ReportCountMap
  delivery_proofs?: ReportCountMap
  documents?: ReportCountMap
}

export type ShipmentsSummary = {
  total?: number | null
  by_status?: ReportCountMap
  by_current_status?: ReportCountMap
  by_priority?: ReportCountMap
  by_service_type?: ReportCountMap
  packages_total?: number | null
  total_weight_kg?: number | null
  estimated_weight_kg?: number | null
  total_volume_m3?: number | null
  estimated_volume_m3?: number | null
  delivered_today?: number | null
  failed_today?: number | null
}

export type RoutesSummary = {
  total?: number | null
  by_status?: ReportCountMap
  by_date?: KeyValueCount[] | ReportCountMap
  in_progress?: number | null
  completed?: number | null
  with_incidents?: number | null
  assigned_shipments_total?: number | null
  shipments_assigned?: number | null
  stops_total?: number | null
  stops_completed?: number | null
  stops_failed?: number | null
}

export type IncidentTopDriver = { driver_id?: number | string; driver_name?: string; total?: number | null }
export type IncidentTopVehicle = { vehicle_id?: number | string; vehicle_plate?: string; total?: number | null }

export type IncidentsSummary = {
  total?: number | null
  by_status?: ReportCountMap
  by_category?: ReportCountMap
  by_severity?: ReportCountMap
  open?: number | null
  critical?: number | null
  resolved?: number | null
  average_resolution_hours?: number | null
  top_drivers?: IncidentTopDriver[]
  top_vehicles?: IncidentTopVehicle[]
}

export type DocumentsSummary = {
  total?: number | null
  by_document_type?: ReportCountMap
  by_status?: ReportCountMap
  issued?: number | null
  cancelled?: number | null
  draft?: number | null
  by_issue_date?: KeyValueCount[] | ReportCountMap
}

export type DriverPerformanceRow = {
  driver_id?: number | string
  driver_name?: string
  routes_total?: number | null
  routes_completed?: number | null
  stops_total?: number | null
  stops_completed?: number | null
  stops_failed?: number | null
  shipments_assigned?: number | null
  shipments_delivered?: number | null
  incidents_total?: number | null
  incidents_open?: number | null
}

export type VehicleUsageRow = {
  vehicle_id?: number | string
  vehicle_plate?: string
  vehicle_type_name?: string
  routes_total?: number | null
  routes_completed?: number | null
  shipments_assigned?: number | null
  total_weight_kg?: number | null
  incidents_total?: number | null
  current_status?: string
}

export type ReportListResponse<T> = T[] | { results?: T[]; total_drivers?: number; total_vehicles?: number; count?: number }

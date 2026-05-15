export const routeStatusLabels: Record<string, string> = {
  draft: 'Borrador',
  planned: 'Planificada',
  assigned: 'Asignada',
  loaded: 'Cargada',
  in_progress: 'En curso',
  completed: 'Completada',
  cancelled: 'Cancelada',
  with_incidents: 'Con incidencias',
}

export const stopStatusLabels: Record<string, string> = {
  pending: 'Pendiente',
  arrived: 'Llegada marcada',
  completed: 'Completada',
  failed: 'Fallida',
  skipped: 'Saltada',
  cancelled: 'Cancelada',
}

export const stopTypeLabels: Record<string, string> = {
  pickup: 'Retiro',
  delivery: 'Entrega',
  transfer: 'Transferencia',
  warehouse: 'Bodega',
  return: 'Retorno',
}

export const routeShipmentStatusLabels: Record<string, string> = {
  assigned: 'Asignada',
  loaded: 'Cargada',
  in_transit: 'En tránsito',
  delivered: 'Entregada',
  failed_delivery: 'Entrega fallida',
  returned: 'Devuelta',
  cancelled: 'Cancelada',
}

export function labelFor(labels: Record<string, string>, value?: string | null) {
  if (!value) return 'Sin dato'
  return labels[value] ?? value
}

export function statusPillClass(status?: string | null) {
  if (status === 'completed' || status === 'delivered') return 'bg-emerald-50 text-emerald-700 ring-emerald-100'
  if (status === 'in_progress' || status === 'arrived' || status === 'loaded') return 'bg-blue-50 text-blue-700 ring-blue-100'
  if (status === 'failed' || status === 'failed_delivery' || status === 'with_incidents') return 'bg-rose-50 text-rose-700 ring-rose-100'
  if (status === 'planned' || status === 'assigned' || status === 'pending') return 'bg-amber-50 text-amber-700 ring-amber-100'
  return 'bg-slate-100 text-slate-700 ring-slate-200'
}

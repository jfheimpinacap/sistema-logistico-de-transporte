export function EmptyReportState({ message = 'No hay datos para los filtros seleccionados.' }: { message?: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-medium text-slate-500">{message}</div>
}

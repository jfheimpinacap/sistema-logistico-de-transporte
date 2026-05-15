export function ReportErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-800"><p className="font-semibold">No fue posible cargar el reporte</p><p className="mt-1">{message}</p>{onRetry ? <button type="button" onClick={onRetry} className="mt-3 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700">Reintentar</button> : null}</div>
}

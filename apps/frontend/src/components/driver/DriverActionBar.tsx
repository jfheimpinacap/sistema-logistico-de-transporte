import type { Route } from '../../types/routing'

type DriverActionBarProps = {
  route: Route
  isBusy?: boolean
  onBack: () => void
  onStart: () => void
  onComplete: () => void
}

export function DriverActionBar({ route, isBusy = false, onBack, onStart, onComplete }: DriverActionBarProps) {
  const canStart = ['planned', 'assigned', 'loaded'].includes(String(route.status))
  const canComplete = route.status === 'in_progress'

  return (
    <div className="sticky bottom-3 z-10 rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur">
      <div className="grid gap-2 sm:grid-cols-3">
        <button type="button" onClick={onBack} disabled={isBusy} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
          Volver a rutas
        </button>
        <button type="button" onClick={onStart} disabled={!canStart || isBusy} className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300">
          Iniciar ruta
        </button>
        <button type="button" onClick={onComplete} disabled={!canComplete || isBusy} className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300">
          Completar ruta
        </button>
      </div>
    </div>
  )
}

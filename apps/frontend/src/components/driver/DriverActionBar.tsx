import type { Route } from '../../types/routing'

const buttonBase = 'min-h-12 rounded-2xl px-4 py-3 text-sm font-black shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60'

type DriverActionBarProps = {
  route: Route
  isBusy?: boolean
  onBack: () => void
  onRefresh: () => void
  onStart: () => void
  onComplete: () => void
}

export function DriverActionBar({ route, isBusy = false, onBack, onRefresh, onStart, onComplete }: DriverActionBarProps) {
  const canStart = ['planned', 'assigned', 'loaded'].includes(String(route.status))
  const canComplete = route.status === 'in_progress'
  const primaryAction = canStart
    ? { label: 'Iniciar ruta', onClick: onStart, className: 'bg-blue-600 text-white hover:bg-blue-700', disabled: isBusy }
    : { label: 'Completar ruta', onClick: onComplete, className: 'bg-emerald-600 text-white hover:bg-emerald-700', disabled: !canComplete || isBusy }

  return (
    <div className="sticky bottom-2 z-10 rounded-3xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur sm:bottom-3">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <button type="button" onClick={onBack} disabled={isBusy} className={`${buttonBase} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}>
          Volver
        </button>
        <button type="button" onClick={onRefresh} disabled={isBusy} className={`${buttonBase} border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100`}>
          Refrescar
        </button>
        <button type="button" onClick={onStart} disabled={!canStart || isBusy} className={`${buttonBase} hidden bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 lg:block`}>
          Iniciar ruta
        </button>
        <button type="button" onClick={onComplete} disabled={!canComplete || isBusy} className={`${buttonBase} hidden bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300 lg:block`}>
          Completar ruta
        </button>
        <button type="button" onClick={primaryAction.onClick} disabled={primaryAction.disabled} className={`${buttonBase} col-span-2 ${primaryAction.className} disabled:bg-slate-300 lg:hidden`}>
          {primaryAction.label}
        </button>
      </div>
    </div>
  )
}

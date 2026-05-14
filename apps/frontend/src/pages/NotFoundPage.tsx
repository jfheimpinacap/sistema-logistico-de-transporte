import { useAppRouter } from '../routes/AppRoutes'

export function NotFoundPage() {
  const { navigate } = useAppRouter()

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">404</p>
      <h2 className="mt-3 text-3xl font-bold text-slate-950">Página no encontrada</h2>
      <p className="mt-3 text-slate-600">La ruta solicitada no existe en el frontend base del MVP.</p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-6 inline-flex rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Volver al dashboard
      </button>
    </div>
  )
}

import { FormEvent, useState } from 'react'
import { useAppRouter } from '../routes/AppRoutes'
import { useAuth } from '../hooks/useAuth'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const [username, setUsername] = useState('demo')
  const [password, setPassword] = useState('demo1234')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { navigate } = useAppRouter()

  if (isAuthenticated) {
    navigate('/', true)
    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login({ username, password })
      navigate('/', true)
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'No fue posible iniciar sesión.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-white">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl md:grid-cols-[1.05fr_0.95fr]">
        <div className="bg-slate-900 p-8 md:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
            SL
          </div>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Sistema logístico</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Panel operativo para transporte y encomiendas</h1>
          <p className="mt-5 text-slate-300">
            Accede con el usuario demo para validar el flujo JWT y navegar la base del frontend del MVP.
          </p>
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            <p className="font-semibold text-white">Credenciales demo</p>
            <p className="mt-2">Usuario: <span className="font-mono text-cyan-200">demo</span></p>
            <p>Password: <span className="font-mono text-cyan-200">demo1234</span></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 text-slate-950 md:p-10">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              🔐 Login demo
            </span>
            <h2 className="mt-4 text-3xl font-bold">Iniciar sesión</h2>
            <p className="mt-2 text-sm text-slate-500">No existe registro público en esta etapa del MVP.</p>
          </div>

          <label className="block text-sm font-semibold text-slate-700" htmlFor="username">Usuario</label>
          <input
            id="username"
            value={username}
            onChange={(event: { target: { value: string } }) => setUsername(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
            autoComplete="username"
            required
          />

          <label className="mt-5 block text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event: { target: { value: string } }) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
            autoComplete="current-password"
            required
          />

          {error ? <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? 'Ingresando...' : 'Entrar al dashboard'}
          </button>
        </form>
      </section>
    </main>
  )
}

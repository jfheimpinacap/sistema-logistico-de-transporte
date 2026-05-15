import { useState } from 'react'
import type { DriverLocationSnapshot } from '../../types/driver'

type DriverLocationButtonProps = {
  onCaptured: (location: DriverLocationSnapshot) => void
}

export function DriverLocationButton({ onCaptured }: DriverLocationButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('La ubicación es opcional y se captura una sola vez.')

  function captureLocation() {
    if (!navigator.geolocation) {
      setStatus('error')
      setMessage('Este navegador no soporta geolocalización. Puedes guardar el formulario sin ubicación.')
      return
    }

    setStatus('loading')
    setMessage('Solicitando permiso de ubicación...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const snapshot = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
          capturedAt: new Date().toISOString(),
        }
        onCaptured(snapshot)
        setStatus('success')
        setMessage(`Ubicación capturada con precisión aproximada de ${Math.round(snapshot.accuracy ?? 0)} m.`)
      },
      (error) => {
        setStatus('error')
        setMessage(error.code === error.PERMISSION_DENIED ? 'Permiso de ubicación denegado. Puedes continuar sin GPS.' : 'No fue posible capturar ubicación. Puedes continuar sin GPS.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <button type="button" onClick={captureLocation} disabled={status === 'loading'} className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:bg-slate-400">
        {status === 'loading' ? 'Capturando ubicación...' : 'Capturar ubicación puntual'}
      </button>
      <p className={`mt-2 text-xs ${status === 'error' ? 'text-rose-700' : status === 'success' ? 'text-emerald-700' : 'text-slate-500'}`}>{message}</p>
    </div>
  )
}

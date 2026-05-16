import { useState } from 'react'
import type { DriverLocationSnapshot } from '../../types/driver'

type DriverLocationButtonProps = {
  onCaptured: (location: DriverLocationSnapshot) => void
}

function getLocationErrorMessage(error: GeolocationPositionError) {
  if (error.code === error.PERMISSION_DENIED) return 'Permiso de ubicación denegado. Puedes guardar el formulario sin ubicación.'
  if (error.code === error.TIMEOUT) return 'La captura de ubicación demoró demasiado. Puedes intentar de nuevo o continuar sin ubicación.'
  if (error.code === error.POSITION_UNAVAILABLE) return 'El navegador no pudo obtener la ubicación actual. Puedes continuar sin ubicación.'
  return 'No fue posible capturar ubicación. Puedes continuar sin ubicación.'
}

export function DriverLocationButton({ onCaptured }: DriverLocationButtonProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('La ubicación se captura solo una vez al presionar el botón.')
  const [snapshot, setSnapshot] = useState<DriverLocationSnapshot | null>(null)

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
        const nextSnapshot = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
          capturedAt: new Date().toISOString(),
        }
        setSnapshot(nextSnapshot)
        onCaptured(nextSnapshot)
        setStatus('success')
        setMessage('Ubicación capturada. No se hará seguimiento continuo.')
      },
      (error) => {
        setStatus('error')
        setMessage(getLocationErrorMessage(error))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <button type="button" onClick={captureLocation} disabled={status === 'loading'} className="min-h-12 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-wait disabled:bg-slate-400">
        {status === 'loading' ? 'Capturando ubicación...' : status === 'success' ? 'Capturar nuevamente' : 'Capturar ubicación actual'}
      </button>
      <p className={`mt-2 text-sm font-semibold ${status === 'error' ? 'text-rose-700' : status === 'success' ? 'text-emerald-700' : 'text-slate-600'}`}>{message}</p>
      {snapshot ? (
        <dl className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-2"><dt className="font-bold text-slate-500">Latitud</dt><dd className="mt-1 text-slate-900">{snapshot.latitude.toFixed(6)}</dd></div>
          <div className="rounded-xl bg-white p-2"><dt className="font-bold text-slate-500">Longitud</dt><dd className="mt-1 text-slate-900">{snapshot.longitude.toFixed(6)}</dd></div>
          <div className="rounded-xl bg-white p-2"><dt className="font-bold text-slate-500">Precisión</dt><dd className="mt-1 text-slate-900">{snapshot.accuracy == null ? 'Sin dato' : `${Math.round(snapshot.accuracy)} m`}</dd></div>
        </dl>
      ) : null}
    </div>
  )
}

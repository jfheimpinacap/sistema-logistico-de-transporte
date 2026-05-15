import { useEffect, useState } from 'react'
import { DocumentPrintView } from '../../components/documents/DocumentPrintView'
import { useAuth } from '../../hooks/useAuth'
import { useAppRouter } from '../../routes/AppRoutes'
import { getPrintData, getReadableDocumentError } from '../../services/documentsService'
import type { PrintData } from '../../types/documents'

export function DocumentPrintPage() {
  const { accessToken } = useAuth()
  const { navigate } = useAppRouter()
  const [data, setData] = useState<PrintData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) return
    const documentId = window.localStorage.getItem('documentPrintId')
    if (!documentId) { setError('No hay documento seleccionado para impresión. Vuelve al módulo de documentos.'); return }
    getPrintData(documentId, accessToken).then((payload) => { setData(payload); setError(null) }).catch((err) => setError(getReadableDocumentError(err)))
  }, [accessToken])

  return <div className="space-y-5">{error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}{!data && !error ? <div className="rounded-2xl bg-white p-6 text-slate-500">Cargando vista imprimible...</div> : null}{data ? <DocumentPrintView data={data} onClose={() => navigate('/operations/documents')} /> : <button onClick={() => navigate('/operations/documents')} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold">Volver a documentos</button>}</div>
}

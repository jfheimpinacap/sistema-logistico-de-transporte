// @ts-nocheck
import { useEffect, useState } from 'react'
import { DocumentActionPanel } from '../../components/documents/DocumentActionPanel'
import { DocumentDetailPanel } from '../../components/documents/DocumentDetailPanel'
import { DocumentForm } from '../../components/documents/DocumentForm'
import { DocumentLineForm } from '../../components/documents/DocumentLineForm'
import { DocumentsTable } from '../../components/documents/DocumentsTable'
import { GenerateDocumentPanel } from '../../components/documents/GenerateDocumentPanel'
import { documentStatusOptions, documentTypeOptions } from '../../components/documents/labels'
import { useAuth } from '../../hooks/useAuth'
import { useAppRouter } from '../../routes/AppRoutes'
import { archiveDocument, cancelDocument, createDocument, createDocumentLine, deleteDocument, deleteDocumentLine, generateFromRoute, generateFromShipment, getReadableDocumentError, issueDocument, listDocumentLines, listDocuments, updateDocument, updateDocumentLine } from '../../services/documentsService'
import type { GenerateFromRoutePayload, GenerateFromShipmentPayload, LogisticsDocument, LogisticsDocumentLine, LogisticsDocumentLinePayload, LogisticsDocumentPayload } from '../../types/documents'
import { emptyDocumentFormOptions, loadDocumentOptions } from './options'

type Action = 'issue' | 'cancel' | 'archive'

export function DocumentsPage() {
  const { accessToken } = useAuth()
  const { navigate } = useAppRouter()
  const [documents, setDocuments] = useState<LogisticsDocument[]>([])
  const [lines, setLines] = useState<LogisticsDocumentLine[]>([])
  const [search, setSearch] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [status, setStatus] = useState('')
  const [activeFilter, setActiveFilter] = useState<'true' | 'false' | 'all'>('true')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formDocument, setFormDocument] = useState<LogisticsDocument | null | undefined>(undefined)
  const [detailDocument, setDetailDocument] = useState<LogisticsDocument | null>(null)
  const [lineForm, setLineForm] = useState<LogisticsDocumentLine | null | undefined>(undefined)
  const [actionDocument, setActionDocument] = useState<{ document: LogisticsDocument; action: Action } | null>(null)
  const [options, setOptions] = useState(emptyDocumentFormOptions)

  async function load() {
    if (!accessToken) return
    setIsLoading(true)
    try {
      const data = await listDocuments({ token: accessToken, search, document_type: documentType as never, status: status as never, is_active: activeFilter })
      setDocuments(data)
      setError(null)
      if (detailDocument) {
        const refreshed = data.find((item) => item.id === detailDocument.id) ?? detailDocument
        setDetailDocument(refreshed)
        await loadLines(refreshed.id)
      }
    } catch (err) { setError(getReadableDocumentError(err)) } finally { setIsLoading(false) }
  }

  async function loadLines(documentId: string | number) {
    if (!accessToken) return
    try { setLines(await listDocumentLines({ token: accessToken, document: documentId, is_active: 'all' })) } catch (err) { setError(getReadableDocumentError(err)) }
  }

  useEffect(() => { void load() }, [accessToken, search, documentType, status, activeFilter])
  useEffect(() => { if (accessToken) loadDocumentOptions(accessToken).then(setOptions).catch((err) => setError(getReadableDocumentError(err))) }, [accessToken])

  function showDetail(document: LogisticsDocument) { setDetailDocument(document); setFormDocument(undefined); setLineForm(undefined); setActionDocument(null); void loadLines(document.id) }
  async function saveDocument(payload: LogisticsDocumentPayload) {
    if (!accessToken) return
    setIsSubmitting(true)
    try { const saved = formDocument ? await updateDocument(formDocument.id, payload, accessToken) : await createDocument(payload, accessToken); setMessage('Documento guardado correctamente.'); setFormDocument(undefined); setDetailDocument(saved); await load(); await loadLines(saved.id) } catch (err) { setError(getReadableDocumentError(err)) } finally { setIsSubmitting(false) }
  }
  async function runAction(action: Action, notes: string) {
    if (!accessToken || !actionDocument) return
    setIsSubmitting(true)
    try {
      const id = actionDocument.document.id
      const saved = action === 'issue' ? await issueDocument(id, { notes }, accessToken) : action === 'cancel' ? await cancelDocument(id, { notes }, accessToken) : await archiveDocument(id, { notes }, accessToken)
      setMessage('Acción aplicada correctamente.'); setActionDocument(null); setDetailDocument(saved); await load(); await loadLines(saved.id)
    } catch (err) { setError(getReadableDocumentError(err)) } finally { setIsSubmitting(false) }
  }
  async function generateRouteDocument(payload: GenerateFromRoutePayload) {
    if (!accessToken) return
    setIsSubmitting(true)
    try { const saved = await generateFromRoute(payload, accessToken); setMessage('Documento generado desde ruta.'); setDetailDocument(saved); await load(); await loadLines(saved.id) } catch (err) { setError(getReadableDocumentError(err)) } finally { setIsSubmitting(false) }
  }
  async function generateShipmentDocument(payload: GenerateFromShipmentPayload) {
    if (!accessToken) return
    setIsSubmitting(true)
    try { const saved = await generateFromShipment(payload, accessToken); setMessage('Documento generado desde encomienda.'); setDetailDocument(saved); await load(); await loadLines(saved.id) } catch (err) { setError(getReadableDocumentError(err)) } finally { setIsSubmitting(false) }
  }
  async function saveLine(payload: LogisticsDocumentLinePayload) {
    if (!accessToken) return
    setIsSubmitting(true)
    try { if (lineForm) await updateDocumentLine(lineForm.id, payload, accessToken); else await createDocumentLine(payload, accessToken); setMessage('Línea guardada correctamente.'); setLineForm(undefined); if (detailDocument) await loadLines(detailDocument.id); await load() } catch (err) { setError(getReadableDocumentError(err)) } finally { setIsSubmitting(false) }
  }
  async function deactivateDocument(document: LogisticsDocument) {
    if (!accessToken || !window.confirm('¿Desactivar este documento?')) return
    try { await deleteDocument(document.id, accessToken); setMessage('Documento desactivado.'); await load() } catch (err) { setError(getReadableDocumentError(err)) }
  }
  async function deactivateLine(line: LogisticsDocumentLine) {
    if (!accessToken || !window.confirm('¿Desactivar esta línea?')) return
    try { await deleteDocumentLine(line.id, accessToken); setMessage('Línea desactivada.'); if (detailDocument) await loadLines(detailDocument.id); await load() } catch (err) { setError(getReadableDocumentError(err)) }
  }
  function openPrint(document: LogisticsDocument) { window.localStorage.setItem('documentPrintId', String(document.id)); navigate('/operations/documents/print') }

  return <div className="space-y-5"><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">Documentos internos</span><h2 className="mt-3 text-3xl font-bold text-slate-950">Documentos internos logísticos</h2><p className="mt-2 max-w-3xl text-slate-600">Lista, crea, emite internamente, anula, archiva, genera desde rutas/encomiendas y abre una vista HTML imprimible.</p><p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">Documento interno/provisorio. No corresponde a emisión tributaria SII.</p></div><button onClick={() => { setFormDocument(null); setDetailDocument(null); setLineForm(undefined); setActionDocument(null) }} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">Nuevo documento manual</button></div></section>{message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p> : null}{error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}<section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-4"><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar documento" className="rounded-xl border border-slate-200 px-3 py-2" /><select value={documentType} onChange={(e) => setDocumentType(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2"><option value="">Todos los tipos</option>{documentTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2"><option value="">Todos los estados</option>{documentStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value as typeof activeFilter)} className="rounded-xl border border-slate-200 px-3 py-2"><option value="true">Activos</option><option value="false">Inactivos</option><option value="all">Todos</option></select></section><GenerateDocumentPanel options={options} isSubmitting={isSubmitting} onGenerateFromRoute={generateRouteDocument} onGenerateFromShipment={generateShipmentDocument} />{formDocument !== undefined ? <DocumentForm document={formDocument} options={options} isSubmitting={isSubmitting} onCancel={() => setFormDocument(undefined)} onSubmit={saveDocument} /> : null}{actionDocument ? <DocumentActionPanel document={actionDocument.document} action={actionDocument.action} isSubmitting={isSubmitting} onCancel={() => setActionDocument(null)} onSubmit={runAction} /> : null}{detailDocument ? <DocumentDetailPanel document={detailDocument} lines={lines} onClose={() => setDetailDocument(null)} onEdit={() => setFormDocument(detailDocument)} onNewLine={() => setLineForm(null)} onEditLine={(line) => setLineForm(line)} onDeactivateLine={deactivateLine} onIssue={() => setActionDocument({ document: detailDocument, action: 'issue' })} onCancelDocument={() => setActionDocument({ document: detailDocument, action: 'cancel' })} onArchive={() => setActionDocument({ document: detailDocument, action: 'archive' })} onPrint={() => openPrint(detailDocument)} /> : null}{lineForm !== undefined && detailDocument ? <DocumentLineForm document={detailDocument} line={lineForm} options={options} isSubmitting={isSubmitting} onCancel={() => setLineForm(undefined)} onSubmit={saveLine} /> : null}<DocumentsTable documents={documents} isLoading={isLoading} onView={showDetail} onEdit={(document) => setFormDocument(document)} onIssue={(document) => setActionDocument({ document, action: 'issue' })} onCancel={(document) => setActionDocument({ document, action: 'cancel' })} onArchive={(document) => setActionDocument({ document, action: 'archive' })} onPrint={openPrint} onDeactivate={deactivateDocument} /></div>
}

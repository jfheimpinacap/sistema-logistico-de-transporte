import { useCallback, useEffect, useState } from 'react'
import { PackageForm } from '../../components/operations/PackageForm'
import { packageStatusOptions } from '../../components/operations/OperationStatusBadge'
import { PackagesTable } from '../../components/operations/PackagesTable'
import { useAuth } from '../../hooks/useAuth'
import { useAppRouter } from '../../routes/AppRoutes'
import { createPackage, deletePackage, getReadableOperationError, listPackages, listShipments, updatePackage } from '../../services/operationsService'
import type { SelectOption } from '../../types/masterData'
import type { Package, PackagePayload, Shipment } from '../../types/operations'

export function PackagesPage() {
  const { accessToken, logout } = useAuth()
  const { navigate } = useAppRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [shipmentOptions, setShipmentOptions] = useState<SelectOption[]>([])
  const [shipmentFilter, setShipmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<Package | null>(null)

  const handleAuthError = useCallback((message: string) => {
    if (message.includes('sesión expiró')) {
      logout()
      navigate('/login', true)
    }
  }, [logout, navigate])

  const loadShipments = useCallback(async () => {
    if (!accessToken) return
    try {
      const shipments = await listShipments({ token: accessToken, is_active: 'true' })
      setShipmentOptions((shipments as Shipment[]).map((shipment) => ({ value: shipment.id, label: `${shipment.tracking_code} · ${shipment.recipient_name}` })))
    } catch (err) {
      const message = getReadableOperationError(err)
      setError(message)
      handleAuthError(message)
    }
  }, [accessToken, handleAuthError])

  const loadPackages = useCallback(async () => {
    if (!accessToken) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await listPackages({ token: accessToken, shipment: shipmentFilter, status: statusFilter, is_active: 'all' })
      setPackages(data)
    } catch (err) {
      const message = getReadableOperationError(err)
      setError(message)
      handleAuthError(message)
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, handleAuthError, shipmentFilter, statusFilter])

  useEffect(() => { void loadShipments() }, [loadShipments])
  useEffect(() => { void loadPackages() }, [loadPackages])

  function openCreateForm() {
    setEditingPackage(null)
    setFormError(null)
    setIsFormOpen(true)
  }

  function openEditForm(pkg: Package) {
    setEditingPackage(pkg)
    setFormError(null)
    setIsFormOpen(true)
  }

  async function handleSubmit(payload: PackagePayload) {
    if (!accessToken) {
      setFormError('No hay sesión activa. Vuelve al login para continuar.')
      return
    }
    setIsSaving(true)
    setFormError(null)
    try {
      if (editingPackage) {
        await updatePackage(editingPackage.id, payload, accessToken)
      } else {
        await createPackage(payload, accessToken)
      }
      setIsFormOpen(false)
      setEditingPackage(null)
      await loadPackages()
    } catch (err) {
      const message = getReadableOperationError(err)
      setFormError(message)
      handleAuthError(message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(pkg: Package) {
    if (!accessToken) return
    setIsLoading(true)
    setError(null)
    try {
      await deletePackage(pkg.id, accessToken)
      await loadPackages()
    } catch (err) {
      const message = getReadableOperationError(err)
      setError(message)
      handleAuthError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Bultos</h2>
            <p className="mt-1 text-sm text-slate-500">Administra paquetes asociados a encomiendas.</p>
          </div>
          <button type="button" onClick={openCreateForm} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">Nuevo bulto</button>
        </div>
        {shipmentOptions.length === 0 ? <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Primero debes crear encomiendas para asociar bultos.</p> : null}
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <select value={shipmentFilter} onChange={(event: any) => setShipmentFilter(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="">Todas las encomiendas</option>{shipmentOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          <select value={statusFilter} onChange={(event: any) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="">Todos los estados</option>{packageStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
        </div>
      </section>

      <PackagesTable packages={packages} isLoading={isLoading} error={error} onEdit={openEditForm} onDelete={(pkg) => void handleDelete(pkg)} />

      {isFormOpen ? <PackageForm title={editingPackage ? 'Editar bulto' : 'Nuevo bulto'} packageRecord={editingPackage} shipmentOptions={shipmentOptions} isSaving={isSaving} error={formError} onSubmit={(payload) => void handleSubmit(payload)} onCancel={() => setIsFormOpen(false)} /> : null}
    </div>
  )
}

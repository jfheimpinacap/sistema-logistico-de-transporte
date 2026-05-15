import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChangeStatusPanel } from '../../components/operations/ChangeStatusPanel'
import { OperationStatusBadge, getPriorityLabel, getServiceTypeLabel, priorityOptions, serviceTypeOptions, shipmentStatusOptions } from '../../components/operations/OperationStatusBadge'
import { PackagesTable } from '../../components/operations/PackagesTable'
import { ShipmentForm } from '../../components/operations/ShipmentForm'
import { ShipmentsTable } from '../../components/operations/ShipmentsTable'
import { TrackingTimeline } from '../../components/operations/TrackingTimeline'
import { useAuth } from '../../hooks/useAuth'
import { useAppRouter } from '../../routes/AppRoutes'
import { listMasterData } from '../../services/masterDataService'
import { changeShipmentStatus, createShipment, deleteShipment, getReadableOperationError, getShipment, listPackages, listShipments, listTrackingEvents, updateShipment } from '../../services/operationsService'
import type { Address, Customer, SelectOption, Warehouse } from '../../types/masterData'
import type { ChangeStatusPayload, Package, Shipment, ShipmentPayload, TrackingEvent } from '../../types/operations'

type ActiveFilter = 'true' | 'false' | 'all'

function toCustomerOption(customer: Customer): SelectOption {
  return { value: customer.id, label: customer.name }
}

function toAddressOption(address: Address): SelectOption {
  return { value: address.id, label: `${address.label} · ${address.commune}, ${address.city}` }
}

function toWarehouseOption(warehouse: Warehouse): SelectOption {
  return { value: warehouse.id, label: `${warehouse.name}${warehouse.code ? ` · ${warehouse.code}` : ''}` }
}

function formatDateTime(value?: string | null) {
  return value ? new Date(value).toLocaleString('es-CL') : '—'
}

export function ShipmentsPage() {
  const { accessToken, logout } = useAuth()
  const { navigate } = useAppRouter()
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [packages, setPackages] = useState<Package[]>([])
  const [events, setEvents] = useState<TrackingEvent[]>([])
  const [search, setSearch] = useState('')
  const [currentStatus, setCurrentStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('true')
  const [isLoading, setIsLoading] = useState(false)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null)
  const [customerOptions, setCustomerOptions] = useState<SelectOption[]>([])
  const [addressOptions, setAddressOptions] = useState<SelectOption[]>([])
  const [warehouseOptions, setWarehouseOptions] = useState<SelectOption[]>([])

  const handleAuthError = useCallback((message: string) => {
    if (message.includes('sesión expiró')) {
      logout()
      navigate('/login', true)
    }
  }, [logout, navigate])

  const loadOptions = useCallback(async () => {
    if (!accessToken) return
    try {
      const [customers, addresses, warehouses] = await Promise.all([
        listMasterData('customers', { token: accessToken, activeFilter: 'active' }),
        listMasterData('addresses', { token: accessToken, activeFilter: 'active' }),
        listMasterData('warehouses', { token: accessToken, activeFilter: 'active' }),
      ])
      setCustomerOptions((customers as Customer[]).map(toCustomerOption))
      setAddressOptions((addresses as Address[]).map(toAddressOption))
      setWarehouseOptions((warehouses as Warehouse[]).map(toWarehouseOption))
    } catch (err) {
      const message = getReadableOperationError(err)
      setError(message)
      handleAuthError(message)
    }
  }, [accessToken, handleAuthError])

  const loadShipments = useCallback(async () => {
    if (!accessToken) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await listShipments({ token: accessToken, search, current_status: currentStatus, priority, service_type: serviceType, is_active: activeFilter })
      setShipments(data)
      if (selectedShipment && !data.some((shipment) => shipment.id === selectedShipment.id)) {
        setSelectedShipment(null)
      }
    } catch (err) {
      const message = getReadableOperationError(err)
      setError(message)
      handleAuthError(message)
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, activeFilter, currentStatus, handleAuthError, priority, search, selectedShipment, serviceType])

  const loadDetail = useCallback(async (shipment: Shipment) => {
    if (!accessToken) return
    setIsDetailLoading(true)
    setDetailError(null)
    try {
      const [freshShipment, shipmentPackages, shipmentEvents] = await Promise.all([
        getShipment(shipment.id, accessToken),
        listPackages({ token: accessToken, shipment: shipment.id, is_active: 'all' }),
        listTrackingEvents({ token: accessToken, shipment: shipment.id }),
      ])
      setSelectedShipment(freshShipment)
      setPackages(shipmentPackages)
      setEvents(shipmentEvents)
    } catch (err) {
      const message = getReadableOperationError(err)
      setDetailError(message)
      handleAuthError(message)
    } finally {
      setIsDetailLoading(false)
    }
  }, [accessToken, handleAuthError])

  useEffect(() => {
    const timeout = window.setTimeout(() => { void loadShipments() }, 250)
    return () => window.clearTimeout(timeout)
  }, [loadShipments])

  useEffect(() => { void loadOptions() }, [loadOptions])

  function openCreateForm() {
    setEditingShipment(null)
    setFormError(null)
    setIsFormOpen(true)
  }

  function openEditForm(shipment: Shipment) {
    setEditingShipment(shipment)
    setFormError(null)
    setIsFormOpen(true)
  }

  async function handleSubmit(payload: ShipmentPayload) {
    if (!accessToken) {
      setFormError('No hay sesión activa. Vuelve al login para continuar.')
      return
    }
    setIsSaving(true)
    setFormError(null)
    try {
      const saved = editingShipment ? await updateShipment(editingShipment.id, payload, accessToken) : await createShipment(payload, accessToken)
      setIsFormOpen(false)
      setEditingShipment(null)
      await loadShipments()
      await loadDetail(saved)
    } catch (err) {
      const message = getReadableOperationError(err)
      setFormError(message)
      handleAuthError(message)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(shipment: Shipment) {
    if (!accessToken) return
    setIsLoading(true)
    setError(null)
    try {
      await deleteShipment(shipment.id, accessToken)
      await loadShipments()
      if (selectedShipment?.id === shipment.id) {
        await loadDetail({ ...shipment, is_active: false })
      }
    } catch (err) {
      const message = getReadableOperationError(err)
      setError(message)
      handleAuthError(message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleChangeStatus(payload: ChangeStatusPayload) {
    if (!accessToken || !selectedShipment) return
    setIsChangingStatus(true)
    setStatusError(null)
    try {
      await changeShipmentStatus(selectedShipment.id, payload, accessToken)
      await loadShipments()
      await loadDetail(selectedShipment)
    } catch (err) {
      const message = getReadableOperationError(err)
      setStatusError(message)
      handleAuthError(message)
    } finally {
      setIsChangingStatus(false)
    }
  }

  const activeShipmentId = selectedShipment?.id ?? null
  const detailCards = useMemo(() => selectedShipment ? [
    ['Cliente', selectedShipment.customer_name || '—'],
    ['Origen', selectedShipment.origin_address_label || selectedShipment.origin_warehouse_name || '—'],
    ['Destino', selectedShipment.destination_address_label || '—'],
    ['Recibida', formatDateTime(selectedShipment.received_at)],
    ['Entregada', formatDateTime(selectedShipment.delivered_at)],
    ['Última actualización', formatDateTime(selectedShipment.updated_at)],
  ] : [], [selectedShipment])

  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Encomiendas</h2>
            <p className="mt-1 text-sm text-slate-500">Listado, filtros, creación, edición, detalle y cambio manual de estado.</p>
          </div>
          <button type="button" onClick={openCreateForm} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">Nueva encomienda</button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input value={search} onChange={(event: any) => setSearch(event.target.value)} placeholder="Buscar tracking, referencia, remitente..." className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" />
          <select value={currentStatus} onChange={(event: any) => setCurrentStatus(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="">Todos los estados</option>{shipmentStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          <select value={priority} onChange={(event: any) => setPriority(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="">Todas las prioridades</option>{priorityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          <select value={serviceType} onChange={(event: any) => setServiceType(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="">Todos los servicios</option>{serviceTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          <select value={activeFilter} onChange={(event: any) => setActiveFilter(event.target.value as ActiveFilter)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="true">Activas</option><option value="false">Inactivas</option><option value="all">Todas</option></select>
        </div>
      </section>

      <ShipmentsTable shipments={shipments} isLoading={isLoading} error={error} selectedId={activeShipmentId} onView={(shipment) => void loadDetail(shipment)} onEdit={openEditForm} onDelete={(shipment) => void handleDelete(shipment)} />

      {selectedShipment ? (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-400">Detalle encomienda</p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-950">{selectedShipment.tracking_code}</h3>
                  <p className="mt-1 text-sm text-slate-500">Ref. externa: {selectedShipment.external_reference || '—'}</p>
                </div>
                <div className="flex flex-wrap gap-2"><OperationStatusBadge value={selectedShipment.current_status} /><OperationStatusBadge value={selectedShipment.priority} type="priority" /><OperationStatusBadge value={selectedShipment.service_type} type="service" /></div>
              </div>
              {detailError ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{detailError}</p> : null}
              {isDetailLoading ? <p className="mt-4 text-sm text-slate-500">Actualizando detalle...</p> : null}
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {detailCards.map(([label, value]) => <div key={label} className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-sm font-semibold text-slate-700">{value}</p></div>)}
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 p-4"><h4 className="font-bold text-slate-950">Remitente</h4><p className="mt-2 text-sm text-slate-600">{selectedShipment.sender_name}</p><p className="text-sm text-slate-500">{selectedShipment.sender_phone || 'Sin teléfono'} · {selectedShipment.sender_email || 'Sin email'}</p></div>
                <div className="rounded-2xl border border-slate-100 p-4"><h4 className="font-bold text-slate-950">Destinatario</h4><p className="mt-2 text-sm text-slate-600">{selectedShipment.recipient_name}</p><p className="text-sm text-slate-500">{selectedShipment.recipient_phone || 'Sin teléfono'} · {selectedShipment.recipient_email || 'Sin email'}</p></div>
              </div>
              <p className="mt-4 text-sm text-slate-600">{selectedShipment.description || 'Sin descripción.'}</p>
              <p className="mt-2 text-sm text-slate-500">Notas: {selectedShipment.notes || '—'}</p>
              <p className="mt-3 text-sm font-medium text-slate-700">Prioridad: {getPriorityLabel(selectedShipment.priority)} · Servicio: {getServiceTypeLabel(selectedShipment.service_type)} · Bultos: {packages.length}/{selectedShipment.package_count}</p>
            </article>
            <PackagesTable packages={packages} isLoading={isDetailLoading} onEdit={() => navigate('/operations/packages')} onDelete={() => navigate('/operations/packages')} />
            <TrackingTimeline events={events} isLoading={isDetailLoading} />
          </div>
          <ChangeStatusPanel shipment={selectedShipment} isSaving={isChangingStatus} error={statusError} onSubmit={handleChangeStatus} />
        </section>
      ) : null}

      {isFormOpen ? <ShipmentForm title={editingShipment ? 'Editar encomienda' : 'Nueva encomienda'} shipment={editingShipment} customerOptions={customerOptions} addressOptions={addressOptions} warehouseOptions={warehouseOptions} isSaving={isSaving} error={formError} onSubmit={(payload) => void handleSubmit(payload)} onCancel={() => setIsFormOpen(false)} /> : null}
    </div>
  )
}

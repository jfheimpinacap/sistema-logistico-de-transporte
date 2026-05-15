import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChangeRouteStopStatusPanel } from '../../components/routing/ChangeRouteStopStatusPanel'
import { RouteForm } from '../../components/routing/RouteForm'
import { RouteStopForm } from '../../components/routing/RouteStopForm'
import { routeStatusOptions } from '../../components/routing/RouteStatusBadge'
import { RoutesTable } from '../../components/routing/RoutesTable'
import { useAuth } from '../../hooks/useAuth'
import { useAppRouter } from '../../routes/AppRoutes'
import { listMasterData } from '../../services/masterDataService'
import { assignShipments, changeRouteStatus, changeRouteStopStatus, createRoute, createRouteStop, deleteRoute, deleteRouteShipment, deleteRouteStop, getReadableRoutingError, getRoute, listRouteShipments, listRouteStops, listRoutes, recalculateRouteSummary, reorderStops, updateRoute, updateRouteStop } from '../../services/routingService'
import type { Address, Driver, SelectOption, Vehicle, Warehouse, Zone } from '../../types/masterData'
import type { AssignShipmentsPayload, ChangeRouteStatusPayload, ChangeRouteStopStatusPayload, ReorderStopsPayload, Route, RoutePayload, RouteShipment, RouteStop, RouteStopPayload } from '../../types/routing'
import { RouteDetailPanel } from './RouteDetailPanel'

type ActiveFilter = 'true' | 'false' | 'all'
function toWarehouseOption(warehouse: Warehouse): SelectOption { return { value: warehouse.id, label: `${warehouse.name}${warehouse.code ? ` · ${warehouse.code}` : ''}` } }
function toDriverOption(driver: Driver): SelectOption { return { value: driver.id, label: `${driver.first_name} ${driver.last_name}` } }
function toVehicleOption(vehicle: Vehicle): SelectOption { return { value: vehicle.id, label: `${vehicle.plate_number}${vehicle.vehicle_type_name ? ` · ${vehicle.vehicle_type_name}` : ''}` } }
function toAddressOption(address: Address): SelectOption { return { value: address.id, label: `${address.label} · ${address.street} · ${address.commune}` } }
function toZoneOption(zone: Zone): SelectOption { return { value: zone.id, label: `${zone.name}${zone.code ? ` · ${zone.code}` : ''}` } }

export function RoutesPage() {
  const { accessToken, logout } = useAuth()
  const { navigate } = useAppRouter()
  const [routes, setRoutes] = useState<Route[]>([])
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [stops, setStops] = useState<RouteStop[]>([])
  const [assignments, setAssignments] = useState<RouteShipment[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('true')
  const [isLoading, setIsLoading] = useState(false)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [isStopFormOpen, setIsStopFormOpen] = useState(false)
  const [editingStop, setEditingStop] = useState<RouteStop | null>(null)
  const [changingStop, setChangingStop] = useState<RouteStop | null>(null)
  const [warehouseOptions, setWarehouseOptions] = useState<SelectOption[]>([])
  const [driverOptions, setDriverOptions] = useState<SelectOption[]>([])
  const [vehicleOptions, setVehicleOptions] = useState<SelectOption[]>([])
  const [addressOptions, setAddressOptions] = useState<SelectOption[]>([])
  const [zoneOptions, setZoneOptions] = useState<SelectOption[]>([])

  const handleAuthError = useCallback((message: string) => { if (message.includes('sesión expiró')) { logout(); navigate('/login', true) } }, [logout, navigate])

  const loadOptions = useCallback(async () => {
    if (!accessToken) return
    try {
      const [warehouses, drivers, vehicles, addresses, zones] = await Promise.all([
        listMasterData('warehouses', { token: accessToken, activeFilter: 'active' }),
        listMasterData('drivers', { token: accessToken, activeFilter: 'active' }),
        listMasterData('vehicles', { token: accessToken, activeFilter: 'active' }),
        listMasterData('addresses', { token: accessToken, activeFilter: 'active' }),
        listMasterData('zones', { token: accessToken, activeFilter: 'active' }),
      ])
      setWarehouseOptions(warehouses.map(toWarehouseOption)); setDriverOptions(drivers.map(toDriverOption)); setVehicleOptions(vehicles.map(toVehicleOption)); setAddressOptions(addresses.map(toAddressOption)); setZoneOptions(zones.map(toZoneOption))
    } catch (err) { setError(getReadableRoutingError(err)) }
  }, [accessToken])

  const loadRoutes = useCallback(async () => {
    if (!accessToken) return
    setIsLoading(true)
    try {
      const data = await listRoutes({ token: accessToken, search, status, is_active: activeFilter })
      setRoutes(data); setError(null)
      if (selectedRoute && !data.some((route) => route.id === selectedRoute.id)) setSelectedRoute(null)
    } catch (err) { const message = getReadableRoutingError(err); setError(message); handleAuthError(message) } finally { setIsLoading(false) }
  }, [accessToken, activeFilter, handleAuthError, search, selectedRoute, status])

  const loadRouteDetail = useCallback(async (routeId: string | number) => {
    if (!accessToken) return
    setIsDetailLoading(true)
    try {
      const [route, routeStops, routeAssignments] = await Promise.all([getRoute(routeId, accessToken), listRouteStops({ token: accessToken, route: routeId, is_active: 'all' }), listRouteShipments({ token: accessToken, route: routeId, is_active: 'all' })])
      setSelectedRoute(route); setStops(routeStops); setAssignments(routeAssignments); setDetailError(null)
    } catch (err) { const message = getReadableRoutingError(err); setDetailError(message); handleAuthError(message) } finally { setIsDetailLoading(false) }
  }, [accessToken, handleAuthError])

  useEffect(() => { void loadOptions() }, [loadOptions])
  useEffect(() => { void loadRoutes() }, [loadRoutes])

  const hasMissingMasters = useMemo(() => warehouseOptions.length === 0 || driverOptions.length === 0 || vehicleOptions.length === 0 || addressOptions.length === 0, [addressOptions.length, driverOptions.length, vehicleOptions.length, warehouseOptions.length])

  async function handleSaveRoute(payload: RoutePayload) {
    if (!accessToken) return
    setIsSaving(true); setFormError(null)
    try {
      const saved = editingRoute ? await updateRoute(editingRoute.id, payload, accessToken) : await createRoute(payload, accessToken)
      setIsFormOpen(false); setEditingRoute(null); await loadRoutes(); await loadRouteDetail(saved.id)
    } catch (err) { setFormError(getReadableRoutingError(err)) } finally { setIsSaving(false) }
  }
  async function handleDeleteRoute(route: Route) {
    if (!accessToken || !window.confirm(`¿Desactivar la ruta ${route.route_code || route.name}?`)) return
    setIsSaving(true)
    try { await deleteRoute(route.id, accessToken); await loadRoutes(); if (selectedRoute?.id === route.id) await loadRouteDetail(route.id) } catch (err) { setError(getReadableRoutingError(err)) } finally { setIsSaving(false) }
  }
  async function handleSaveStop(payload: RouteStopPayload) {
    if (!accessToken || !selectedRoute) return
    setIsSaving(true); setFormError(null)
    try { editingStop ? await updateRouteStop(editingStop.id, payload, accessToken) : await createRouteStop(payload, accessToken); setIsStopFormOpen(false); setEditingStop(null); await loadRouteDetail(selectedRoute.id) } catch (err) { setFormError(getReadableRoutingError(err)) } finally { setIsSaving(false) }
  }
  async function handleDeleteStop(stop: RouteStop) {
    if (!accessToken || !selectedRoute || !window.confirm(`¿Desactivar la parada #${stop.sequence}?`)) return
    setIsSaving(true)
    try { await deleteRouteStop(stop.id, accessToken); await loadRouteDetail(selectedRoute.id) } catch (err) { setActionError(getReadableRoutingError(err)) } finally { setIsSaving(false) }
  }
  async function handleChangeRouteStatus(payload: ChangeRouteStatusPayload) {
    if (!accessToken || !selectedRoute) return
    setIsSaving(true); setActionError(null)
    try { await changeRouteStatus(selectedRoute.id, payload, accessToken); await loadRouteDetail(selectedRoute.id); await loadRoutes() } catch (err) { setActionError(getReadableRoutingError(err)) } finally { setIsSaving(false) }
  }
  async function handleChangeStopStatus(payload: ChangeRouteStopStatusPayload) {
    if (!accessToken || !selectedRoute || !changingStop) return
    setIsSaving(true); setActionError(null)
    try { await changeRouteStopStatus(changingStop.id, payload, accessToken); setChangingStop(null); await loadRouteDetail(selectedRoute.id) } catch (err) { setActionError(getReadableRoutingError(err)) } finally { setIsSaving(false) }
  }
  async function handleAssignShipments(payload: AssignShipmentsPayload) {
    if (!accessToken || !selectedRoute) return
    setIsSaving(true); setActionError(null)
    try { await assignShipments(selectedRoute.id, payload, accessToken); await loadRouteDetail(selectedRoute.id); await loadRoutes() } catch (err) { setActionError(getReadableRoutingError(err)) } finally { setIsSaving(false) }
  }
  async function handleReorderStops(payload: ReorderStopsPayload) {
    if (!accessToken || !selectedRoute) return
    setIsSaving(true); setActionError(null)
    try { await reorderStops(selectedRoute.id, payload, accessToken); await loadRouteDetail(selectedRoute.id) } catch (err) { setActionError(getReadableRoutingError(err)) } finally { setIsSaving(false) }
  }
  async function handleRecalculate() {
    if (!accessToken || !selectedRoute) return
    setIsSaving(true); setActionError(null)
    try { await recalculateRouteSummary(selectedRoute.id, accessToken); await loadRouteDetail(selectedRoute.id); await loadRoutes() } catch (err) { setActionError(getReadableRoutingError(err)) } finally { setIsSaving(false) }
  }
  async function handleDeleteAssignment(assignment: RouteShipment) {
    if (!accessToken || !selectedRoute || !window.confirm(`¿Desactivar la asignación ${assignment.shipment_tracking_code || assignment.shipment}?`)) return
    setIsSaving(true)
    try { await deleteRouteShipment(assignment.id, accessToken); await loadRouteDetail(selectedRoute.id); await loadRoutes() } catch (err) { setActionError(getReadableRoutingError(err)) } finally { setIsSaving(false) }
  }

  return <div className="space-y-6"><section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">↝ Prompt 009 — Rutas, paradas y asignación</span><h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">Rutas operativas</h2><p className="mt-2 max-w-3xl text-slate-600">Lista, crea, edita y opera rutas reales con paradas, asignación de encomiendas, cambio de estados, resumen y reordenamiento manual.</p></div><button type="button" onClick={() => { setEditingRoute(null); setFormError(null); setIsFormOpen(true) }} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">Nueva ruta</button></div>{hasMissingMasters ? <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Primero debes crear bodegas, conductores, vehículos o direcciones en Maestros para aprovechar todos los formularios.</p> : null}{error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p> : null}</section><section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="grid gap-3 md:grid-cols-[1fr_220px_180px_auto]"><input value={search} onChange={(event: any) => setSearch(event.target.value)} placeholder="Buscar por código, nombre, conductor o vehículo" className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100" /><select value={status} onChange={(event: any) => setStatus(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="">Todos los estados</option>{routeStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><select value={activeFilter} onChange={(event: any) => setActiveFilter(event.target.value as ActiveFilter)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm"><option value="true">Activas</option><option value="false">Inactivas</option><option value="all">Todas</option></select><button type="button" onClick={() => void loadRoutes()} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Refrescar</button></div></section><RoutesTable routes={routes} isLoading={isLoading} selectedId={selectedRoute?.id} onView={(route) => void loadRouteDetail(route.id)} onEdit={(route) => { setEditingRoute(route); setFormError(null); setIsFormOpen(true) }} onDelete={(route) => void handleDeleteRoute(route)} />{detailError ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{detailError}</p> : null}{selectedRoute ? <RouteDetailPanel token={accessToken!} route={selectedRoute} stops={stops} assignments={assignments} isLoading={isDetailLoading} isSaving={isSaving} actionError={actionError} onCreateStop={() => { setEditingStop(null); setFormError(null); setIsStopFormOpen(true) }} onEditStop={(stop) => { setEditingStop(stop); setFormError(null); setIsStopFormOpen(true) }} onDeleteStop={(stop) => void handleDeleteStop(stop)} onChangeStopStatus={(stop) => setChangingStop(stop)} onDeleteAssignment={(assignment) => void handleDeleteAssignment(assignment)} onChangeRouteStatus={handleChangeRouteStatus} onAssignShipments={handleAssignShipments} onReorderStops={handleReorderStops} onRecalculate={handleRecalculate} /> : null}{isFormOpen ? <RouteForm title={editingRoute ? 'Editar ruta' : 'Crear ruta'} route={editingRoute} warehouseOptions={warehouseOptions} driverOptions={driverOptions} vehicleOptions={vehicleOptions} isSaving={isSaving} error={formError} onSubmit={(payload) => void handleSaveRoute(payload)} onCancel={() => setIsFormOpen(false)} /> : null}{isStopFormOpen && selectedRoute ? <RouteStopForm routeId={selectedRoute.id} stop={editingStop} addressOptions={addressOptions} zoneOptions={zoneOptions} isSaving={isSaving} error={formError} onSubmit={(payload) => void handleSaveStop(payload)} onCancel={() => setIsStopFormOpen(false)} /> : null}{changingStop ? <ChangeRouteStopStatusPanel stop={changingStop} isSaving={isSaving} error={actionError} onSubmit={handleChangeStopStatus} onCancel={() => setChangingStop(null)} /> : null}</div>
}

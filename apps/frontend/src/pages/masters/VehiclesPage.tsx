import { MasterCrudPage } from './MasterCrudPage'
import type { MasterFormField, MasterTableColumn, Vehicle, VehicleType } from '../../types/masterData'

const columns: MasterTableColumn<Vehicle>[] = [
  { key: 'plate_number', label: 'Patente' },
  { key: 'vehicle_type_name', label: 'Tipo' },
  { key: 'brand', label: 'Marca' },
  { key: 'model', label: 'Modelo' },
  { key: 'status', label: 'Estado' },
]

const optionLoaders = [
  { endpoint: 'vehicle-types' as const, field: 'vehicle_type', getLabel: (record: unknown) => (record as VehicleType).name },
]

const fields: MasterFormField<Record<string, unknown>>[] = [
  { name: 'plate_number', label: 'Patente', required: true },
  { name: 'vehicle_type', label: 'Tipo de vehículo', type: 'select', required: true },
  { name: 'brand', label: 'Marca' },
  { name: 'model', label: 'Modelo' },
  { name: 'year', label: 'Año', type: 'number' },
  { name: 'capacity_kg', label: 'Capacidad kg', type: 'number' },
  { name: 'capacity_m3', label: 'Capacidad m³', type: 'number' },
  {
    name: 'status',
    label: 'Estado operativo',
    type: 'select',
    required: true,
    defaultValue: 'available',
    options: [
      { value: 'available', label: 'Disponible' },
      { value: 'assigned', label: 'Asignado' },
      { value: 'maintenance', label: 'Mantención' },
      { value: 'inactive', label: 'Inactivo' },
    ],
  },
  { name: 'is_active', label: 'Activo', type: 'checkbox' },
]

export function VehiclesPage() {
  return (
    <MasterCrudPage
      endpoint="vehicles"
      title="Vehículos"
      subtitle="Administra la flota disponible para futuras rutas y asignaciones."
      formTitle="vehículo"
      columns={columns}
      fields={fields}
      optionLoaders={optionLoaders}
    />
  )
}

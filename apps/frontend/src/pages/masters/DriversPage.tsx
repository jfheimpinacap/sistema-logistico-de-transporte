import { MasterCrudPage } from './MasterCrudPage'
import type { Driver, MasterFormField, MasterTableColumn, Vehicle } from '../../types/masterData'

const columns: MasterTableColumn<Driver>[] = [
  { key: 'last_name', label: 'Apellido' },
  { key: 'first_name', label: 'Nombre' },
  { key: 'rut', label: 'RUT' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'default_vehicle_plate', label: 'Vehículo' },
  { key: 'status', label: 'Estado' },
]

const optionLoaders = [
  { endpoint: 'vehicles' as const, field: 'default_vehicle', getLabel: (record: unknown) => (record as Vehicle).plate_number },
]

const fields: MasterFormField<Record<string, unknown>>[] = [
  { name: 'first_name', label: 'Nombres', required: true },
  { name: 'last_name', label: 'Apellidos', required: true },
  { name: 'rut', label: 'RUT' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Teléfono' },
  { name: 'license_class', label: 'Clase de licencia' },
  { name: 'default_vehicle', label: 'Vehículo por defecto', type: 'select', helperText: 'Opcional. Se puede asignar después.' },
  {
    name: 'status',
    label: 'Estado operativo',
    type: 'select',
    required: true,
    defaultValue: 'available',
    options: [
      { value: 'available', label: 'Disponible' },
      { value: 'assigned', label: 'Asignado' },
      { value: 'inactive', label: 'Inactivo' },
    ],
  },
  { name: 'is_active', label: 'Activo', type: 'checkbox' },
]

export function DriversPage() {
  return (
    <MasterCrudPage
      endpoint="drivers"
      title="Conductores"
      subtitle="Gestiona conductores, licencias y vehículo sugerido para la operación."
      formTitle="conductor"
      columns={columns}
      fields={fields}
      optionLoaders={optionLoaders}
    />
  )
}

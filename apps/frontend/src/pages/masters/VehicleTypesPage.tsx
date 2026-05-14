import { MasterCrudPage } from './MasterCrudPage'
import type { MasterFormField, MasterTableColumn, VehicleType } from '../../types/masterData'

const columns: MasterTableColumn<VehicleType>[] = [
  { key: 'name', label: 'Tipo' },
  { key: 'code', label: 'Código' },
  { key: 'max_weight_kg', label: 'Peso máx. kg' },
  { key: 'max_volume_m3', label: 'Volumen máx. m³' },
]

const fields: MasterFormField<Record<string, unknown>>[] = [
  { name: 'name', label: 'Nombre', required: true },
  { name: 'code', label: 'Código' },
  { name: 'description', label: 'Descripción', type: 'textarea' },
  { name: 'max_weight_kg', label: 'Peso máximo kg', type: 'number' },
  { name: 'max_volume_m3', label: 'Volumen máximo m³', type: 'number' },
  { name: 'is_active', label: 'Activo', type: 'checkbox' },
]

export function VehicleTypesPage() {
  return (
    <MasterCrudPage
      endpoint="vehicle-types"
      title="Tipos de vehículo"
      subtitle="Define capacidades referenciales para motos, camionetas, camiones u otros vehículos."
      formTitle="tipo de vehículo"
      columns={columns}
      fields={fields}
    />
  )
}

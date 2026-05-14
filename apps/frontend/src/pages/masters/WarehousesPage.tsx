import { MasterCrudPage } from './MasterCrudPage'
import type { Address, MasterFormField, MasterTableColumn, Warehouse } from '../../types/masterData'

const columns: MasterTableColumn<Warehouse>[] = [
  { key: 'name', label: 'Bodega' },
  { key: 'code', label: 'Código' },
  { key: 'address_label', label: 'Dirección' },
  { key: 'phone', label: 'Teléfono' },
]

const optionLoaders = [
  { endpoint: 'addresses' as const, field: 'address', getLabel: (record: unknown) => (record as Address).label },
]

const fields: MasterFormField<Record<string, unknown>>[] = [
  { name: 'name', label: 'Nombre', required: true },
  { name: 'code', label: 'Código' },
  { name: 'address', label: 'Dirección', type: 'select', helperText: 'Opcional. Crea una dirección si no aparece en la lista.' },
  { name: 'phone', label: 'Teléfono' },
  { name: 'is_active', label: 'Activo', type: 'checkbox' },
]

export function WarehousesPage() {
  return (
    <MasterCrudPage
      endpoint="warehouses"
      title="Bodegas"
      subtitle="Mantiene centros de distribución y bodegas internas del sistema."
      formTitle="bodega"
      columns={columns}
      fields={fields}
      optionLoaders={optionLoaders}
    />
  )
}

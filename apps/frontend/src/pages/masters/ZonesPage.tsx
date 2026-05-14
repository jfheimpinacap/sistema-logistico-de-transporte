import { MasterCrudPage } from './MasterCrudPage'
import type { MasterFormField, MasterTableColumn, Zone } from '../../types/masterData'

const columns: MasterTableColumn<Zone>[] = [
  { key: 'name', label: 'Zona' },
  { key: 'code', label: 'Código' },
  { key: 'description', label: 'Descripción' },
]

const fields: MasterFormField<Record<string, unknown>>[] = [
  { name: 'name', label: 'Nombre', required: true },
  { name: 'code', label: 'Código' },
  { name: 'description', label: 'Descripción', type: 'textarea' },
  { name: 'is_active', label: 'Activo', type: 'checkbox' },
]

export function ZonesPage() {
  return (
    <MasterCrudPage
      endpoint="zones"
      title="Zonas"
      subtitle="Agrupa comunas y direcciones en zonas operativas para planificación futura."
      formTitle="zona"
      columns={columns}
      fields={fields}
    />
  )
}

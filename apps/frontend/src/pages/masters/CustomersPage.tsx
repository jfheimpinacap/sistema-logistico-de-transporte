import { MasterCrudPage } from './MasterCrudPage'
import type { Customer, MasterFormField, MasterTableColumn } from '../../types/masterData'

const columns: MasterTableColumn<Customer>[] = [
  { key: 'name', label: 'Cliente' },
  { key: 'tax_id', label: 'RUT' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Teléfono' },
]

const fields: MasterFormField<Record<string, unknown>>[] = [
  { name: 'name', label: 'Nombre o razón social', required: true },
  { name: 'tax_id', label: 'RUT' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Teléfono' },
  { name: 'address_text', label: 'Dirección principal', type: 'textarea' },
  { name: 'is_active', label: 'Activo', type: 'checkbox' },
]

export function CustomersPage() {
  return (
    <MasterCrudPage
      endpoint="customers"
      title="Clientes"
      subtitle="Administra clientes y datos comerciales base para futuras encomiendas y órdenes logísticas."
      formTitle="cliente"
      columns={columns}
      fields={fields}
    />
  )
}

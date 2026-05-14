import { MasterCrudPage } from './MasterCrudPage'
import type { Contact, Customer, MasterFormField, MasterTableColumn } from '../../types/masterData'

const columns: MasterTableColumn<Contact>[] = [
  { key: 'customer_name', label: 'Cliente' },
  { key: 'name', label: 'Contacto' },
  { key: 'role', label: 'Rol' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Teléfono' },
]

const optionLoaders = [
  { endpoint: 'customers' as const, field: 'customer', getLabel: (record: unknown) => (record as Customer).name },
]

const fields: MasterFormField<Record<string, unknown>>[] = [
  { name: 'customer', label: 'Cliente', type: 'select', required: true },
  { name: 'name', label: 'Nombre', required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Teléfono' },
  { name: 'role', label: 'Rol o cargo' },
  { name: 'is_active', label: 'Activo', type: 'checkbox' },
]

export function ContactsPage() {
  return (
    <MasterCrudPage
      endpoint="contacts"
      title="Contactos"
      subtitle="Administra personas de contacto asociadas a clientes."
      formTitle="contacto"
      columns={columns}
      fields={fields}
      optionLoaders={optionLoaders}
    />
  )
}

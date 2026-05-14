import { MasterCrudPage } from './MasterCrudPage'
import type { Address, MasterFormField, MasterTableColumn, Zone } from '../../types/masterData'

const columns: MasterTableColumn<Address>[] = [
  { key: 'label', label: 'Nombre' },
  { key: 'street', label: 'Calle' },
  { key: 'commune', label: 'Comuna' },
  { key: 'city', label: 'Ciudad' },
  { key: 'zone_name', label: 'Zona' },
]

const optionLoaders = [
  { endpoint: 'zones' as const, field: 'zone', getLabel: (record: unknown) => (record as Zone).name },
]

const fields: MasterFormField<Record<string, unknown>>[] = [
  { name: 'label', label: 'Nombre / etiqueta', required: true },
  { name: 'street', label: 'Calle', required: true },
  { name: 'number', label: 'Número' },
  { name: 'apartment', label: 'Depto. / oficina' },
  { name: 'commune', label: 'Comuna', required: true },
  { name: 'city', label: 'Ciudad', required: true },
  { name: 'region', label: 'Región', required: true },
  { name: 'country', label: 'País', placeholder: 'Chile', defaultValue: 'Chile' },
  { name: 'postal_code', label: 'Código postal' },
  { name: 'latitude', label: 'Latitud', type: 'number' },
  { name: 'longitude', label: 'Longitud', type: 'number' },
  { name: 'zone', label: 'Zona', type: 'select', helperText: 'Opcional. Crea una zona si no aparece en la lista.' },
  { name: 'notes', label: 'Notas', type: 'textarea' },
  { name: 'is_active', label: 'Activo', type: 'checkbox' },
]

export function AddressesPage() {
  return (
    <MasterCrudPage
      endpoint="addresses"
      title="Direcciones"
      subtitle="Centraliza direcciones operativas, georreferencias opcionales y zonas asociadas."
      formTitle="dirección"
      columns={columns}
      fields={fields}
      optionLoaders={optionLoaders}
    />
  )
}

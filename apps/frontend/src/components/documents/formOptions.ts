import type { DocumentId } from '../../types/documents'

export type SelectOption = { value: DocumentId | ''; label: string }

export type DocumentFormOptions = {
  customers: SelectOption[]
  routes: SelectOption[]
  shipments: SelectOption[]
  warehouses: SelectOption[]
  drivers: SelectOption[]
  vehicles: SelectOption[]
  deliveryProofs: SelectOption[]
  incidents: SelectOption[]
  packages: SelectOption[]
  routeStops: SelectOption[]
}

export const emptyDocumentFormOptions: DocumentFormOptions = {
  customers: [], routes: [], shipments: [], warehouses: [], drivers: [], vehicles: [], deliveryProofs: [], incidents: [], packages: [], routeStops: [],
}

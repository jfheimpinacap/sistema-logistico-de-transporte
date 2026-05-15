import type { MasterId } from '../../types/masterData'
export type SelectOption = { value: MasterId | ''; label: string }
export type FieldOpsFormOptions = {
  shipments: SelectOption[]
  packages: SelectOption[]
  routes: SelectOption[]
  routeStops: SelectOption[]
  routeShipments: SelectOption[]
  drivers: SelectOption[]
  vehicles: SelectOption[]
}

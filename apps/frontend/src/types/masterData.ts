export type ActiveFilter = 'active' | 'inactive' | 'all'

export type MasterId = number | string

export type BaseMasterRecord = {
  id: MasterId
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type Customer = BaseMasterRecord & {
  name: string
  tax_id?: string | null
  email?: string
  phone?: string
  address_text?: string
}

export type Contact = BaseMasterRecord & {
  customer: MasterId
  customer_name?: string
  name: string
  email?: string
  phone?: string
  role?: string
}

export type Zone = BaseMasterRecord & {
  name: string
  code?: string | null
  description?: string
}

export type Address = BaseMasterRecord & {
  label: string
  street: string
  number?: string
  apartment?: string
  commune: string
  city: string
  region: string
  country?: string
  postal_code?: string
  latitude?: string | number | null
  longitude?: string | number | null
  zone?: MasterId | null
  zone_name?: string
  notes?: string
}

export type Warehouse = BaseMasterRecord & {
  name: string
  code?: string | null
  address?: MasterId | null
  address_label?: string
  phone?: string
}

export type VehicleType = BaseMasterRecord & {
  name: string
  code?: string | null
  description?: string
  max_weight_kg?: string | number | null
  max_volume_m3?: string | number | null
}

export type Vehicle = BaseMasterRecord & {
  plate_number: string
  vehicle_type: MasterId
  vehicle_type_name?: string
  brand?: string
  model?: string
  year?: number | null
  capacity_kg?: string | number | null
  capacity_m3?: string | number | null
  status: 'available' | 'assigned' | 'maintenance' | 'inactive' | string
}

export type Driver = BaseMasterRecord & {
  first_name: string
  last_name: string
  rut?: string | null
  email?: string
  phone?: string
  license_class?: string
  default_vehicle?: MasterId | null
  default_vehicle_plate?: string
  status: 'available' | 'assigned' | 'inactive' | string
}

export type MasterEntityMap = {
  customers: Customer
  contacts: Contact
  zones: Zone
  addresses: Address
  warehouses: Warehouse
  'vehicle-types': VehicleType
  vehicles: Vehicle
  drivers: Driver
}

export type MasterEndpoint = keyof MasterEntityMap
export type MasterRecord = MasterEntityMap[MasterEndpoint]
export type MasterPayload<T extends MasterEndpoint> = Partial<Omit<MasterEntityMap[T], 'id' | 'created_at' | 'updated_at'>>

export type ListResponse<T> = T[] | {
  count?: number
  next?: string | null
  previous?: string | null
  results: T[]
}

export type SelectOption = {
  value: MasterId | ''
  label: string
  disabled?: boolean
}

export type FieldType = 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox'

export type MasterFormField<T extends Record<string, unknown> = Record<string, unknown>> = {
  name: keyof T & string
  label: string
  type?: FieldType
  required?: boolean
  placeholder?: string
  options?: SelectOption[]
  helperText?: string
  defaultValue?: unknown
}

export type MasterTableColumn<T> = {
  key: keyof T & string
  label: string
  render?: (record: T) => string | number | null | undefined
}

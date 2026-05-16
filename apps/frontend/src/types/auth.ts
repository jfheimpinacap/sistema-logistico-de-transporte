export type DriverProfile = {
  id: number
  first_name: string
  last_name: string
  rut: string | null
  phone: string
  driver_type: 'internal' | 'external'
  location_source: 'mobile_web' | 'mobile_app' | 'vehicle_gps' | 'manual' | 'unknown'
  status: string
  default_vehicle: number | null
}

export type AuthUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  is_superuser: boolean
  driver_profile: DriverProfile | null
}

export type LoginCredentials = {
  username: string
  password: string
}

export type AuthTokens = {
  access: string
  refresh: string
}

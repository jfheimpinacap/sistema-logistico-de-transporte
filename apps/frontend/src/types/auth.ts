export type AuthUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  is_superuser: boolean
}

export type LoginCredentials = {
  username: string
  password: string
}

export type AuthTokens = {
  access: string
  refresh: string
}

export type UserRole = 'super_admin' | 'hr' | 'manager' | 'employee'

export interface User {
  id: string
  email: string
  role: UserRole
  company_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AdminUserCreate {
  email: string
  password: string
  role: UserRole
  company_id?: string
}

export interface RoleUpdateRequest {
  role: UserRole
}

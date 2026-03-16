import type { BaseModel } from './common.types'

export interface Department extends BaseModel {
    name: string
    description?: string
    manager_id?: string
}

export interface DepartmentCreate {
    name: string
    description?: string
    manager_id?: string
}

export interface DepartmentUpdate {
    name?: string
    description?: string
    manager_id?: string
}

export interface DepartmentListResponse {
    total: number
    departments: Department[]
}

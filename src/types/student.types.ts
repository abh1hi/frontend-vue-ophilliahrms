import type { BaseModel } from './common.types'

export interface SchoolClass extends BaseModel {
    name: string
    grade_level: number
    section: string
    academic_year: string
    capacity: number
}

export interface Student extends BaseModel {
    student_number: string
    first_name: string
    last_name: string
    date_of_birth: string
    gender: 'male' | 'female' | 'other'
    email?: string
    phone?: string
    address?: string
    class_id?: string
    enrollment_date: string
    status: 'active' | 'inactive' | 'withdrawn' | 'graduated'
}

export interface StudentUpdate {
    first_name?: string
    last_name?: string
    date_of_birth?: string
    gender?: 'male' | 'female' | 'other'
    email?: string
    phone?: string
    address?: string
    class_id?: string
}

export interface StudentStatusChange {
    status: 'active' | 'inactive' | 'withdrawn' | 'graduated'
}

export interface Guardian extends BaseModel {
    student_id: string
    first_name: string
    last_name: string
    relationship: 'father' | 'mother' | 'other'
    phone: string
    email?: string
    is_primary: boolean
}

export interface GuardianCreate {
    student_id: string
    first_name: string
    last_name: string
    relationship: 'father' | 'mother' | 'other'
    phone: string
    email?: string
    is_primary?: boolean
}

export interface GuardianUpdate {
    first_name?: string
    last_name?: string
    relationship?: 'father' | 'mother' | 'other'
    phone?: string
    email?: string
    is_primary?: boolean
}

export interface ClassCreate {
    name: string
    grade_level: number
    section: string
    academic_year: string
    capacity: number
}

export interface ClassUpdate {
    name?: string
    grade_level?: number
    section?: string
    academic_year?: string
    capacity?: number
}

export interface StudentListResponse {
    total: number
    page: number
    page_size: number
    items: Student[]
}

export interface ClassListResponse {
    total: number
    page: number
    page_size: number
    items: SchoolClass[]
}

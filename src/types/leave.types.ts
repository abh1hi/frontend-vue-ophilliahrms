import type { BaseModel } from './common.types'

export interface LeaveType extends BaseModel {
    name: string
    description?: string
    days_allowed: number
    requires_approval: boolean
}

export interface LeaveBalance extends BaseModel {
    employee_id: string
    leave_type_id: string
    total_days: number
    used_days: number
    pending_days: number
    year: number
    leave_type: LeaveType
}

export interface LeaveRequest extends BaseModel {
    employee_id: string
    leave_type_id: string
    start_date: string
    end_date: string
    reason?: string
    total_days: number
    status: string
    approved_by_id?: string
    manager_notes?: string
    leave_type: LeaveType
}

export interface Holiday extends BaseModel {
    name: string
    date: string
    description?: string
    is_recurring: boolean
}

import type { BaseModel } from './common.types'

export interface Attendance extends BaseModel {
    employee_id: string
    clock_in: string
    clock_out?: string
    clock_in_lat?: number
    clock_in_lng?: number
    clock_out_lat?: number
    clock_out_lng?: number
    work_hours?: number
    overtime_hours: number
    status: string
    method: string
    notes?: string
    date: string
}

export interface ClockInRequest {
    latitude?: number
    longitude?: number
    notes?: string
}

export interface ClockOutRequest {
    latitude?: number
    longitude?: number
    notes?: string
}

export interface ManualAttendanceCreate {
    employee_id: string
    date: string
    clock_in: string
    clock_out?: string
    status: string
    notes?: string
}

export interface AttendanceUpdate {
    clock_in?: string
    clock_out?: string
    status?: string
    notes?: string
}

export interface AttendanceListResponse {
    total: number
    skip: number
    limit: number
    records: Attendance[]
}

export interface Geofence extends BaseModel {
    name: string
    latitude: number
    longitude: number
    radius_meters: number
}

export interface GeofenceCreate {
    name: string
    latitude: number
    longitude: number
    radius_meters: number
}

export interface AttendancePolicy extends BaseModel {
    department_id?: string
    employee_id?: string
    method: string
    geofence_id?: string
    work_start_time?: string
    work_hours_per_day: number
}

export interface PolicyCreate {
    department_id?: string
    employee_id?: string
    method: string
    geofence_id?: string
    work_start_time?: string
    work_hours_per_day?: number
}

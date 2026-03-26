import type { BaseModel } from './common.types'

export interface Attendance extends BaseModel {
    employee_id: string
    clock_in: string
    clock_out?: string
    clock_in_lat?: number
    clock_in_lng?: number
    clock_out_lat?: number
    clock_out_lng?: number
    clock_in_location_name?: string
    clock_out_location_name?: string
    work_hours?: number
    overtime_hours: number
    status: string
    state?: string
    method: string
    notes?: string
    date: string
    day_rating?: number
    rating_comment?: string
    productivity_score?: number
    device_info?: string
    network_info?: string
    shift_number?: number
    tasks?: AttendanceTask[]
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
    max_shifts_per_day?: number
    auto_close_time?: string
    task_planning_grace_minutes?: number
    allow_night_shift?: string
}

export interface PolicyCreate {
    department_id?: string
    employee_id?: string
    method: string
    geofence_id?: string
    work_start_time?: string
    work_hours_per_day?: number
    max_shifts_per_day?: number
    auto_close_time?: string
    task_planning_grace_minutes?: number
    allow_night_shift?: string
}

export interface PolicyUpdate {
    department_id?: string
    employee_id?: string
    method?: string
    geofence_id?: string
    work_start_time?: string
    work_hours_per_day?: number
    max_shifts_per_day?: number
    auto_close_time?: string
    task_planning_grace_minutes?: number
    allow_night_shift?: string
}

export interface GeofenceUpdate {
    name?: string
    latitude?: number
    longitude?: number
    radius_meters?: number
}

export interface AttendanceTask {
    id: string
    attendance_id?: string
    employee_id?: string
    title: string
    description?: string
    status: string
    estimated_finish_time?: string
    completion_notes?: string
    actual_expenses?: number
    created_at: string
    updated_at: string
}

export interface TaskCreate {
    title: string
    description?: string
    estimated_finish_time?: string
}

export interface TaskUpdate {
    title?: string
    description?: string
    status?: string
    estimated_finish_time?: string
}

export interface TaskComplete {
    completion_notes?: string
    actual_expenses?: number
    status?: string
}

export interface TaskAssign {
    employee_id: string
    title: string
    description?: string
    estimated_finish_time?: string
}

export interface SchoolModeEntry {
    employee_id: string
    date: string
    status: string
    notes?: string
}

export interface BulkSchoolModeRequest {
    entries: SchoolModeEntry[]
}

export interface ProductivityReport {
    employee_id: string
    employee_name?: string
    total_present_days: number
    total_absent_days: number
    total_late_days: number
    total_half_days: number
    total_work_hours: number
    total_overtime_hours: number
    avg_work_hours: number
    task_completion_rate: number
    avg_day_rating: number
}

// ──────────── ADMIN KPI / DASHBOARD ────────────

export interface AdminKPI {
    date: string
    total_employees_present: number
    late_checkins: number
    absent_employees: number
    missed_punchouts: number
    auto_closed_count: number
    avg_working_hours: number | null
    total_tasks_today: number
    completed_tasks_today: number
    task_completion_rate: number | null
}

export interface AttendanceTrendItem {
    date: string
    present: number
    late: number
    absent: number
    half_day: number
    auto_closed: number
    avg_hours: number | null
}

export interface DailyStatusBreakdown {
    date: string
    present: number
    late: number
    half_day: number
    absent: number
    auto_closed: number
}

export interface EmployeeProductivitySummary {
    employee_id: string
    total_tasks: number
    completed_tasks: number
    completion_rate: number
    avg_rating: number | null
    productivity_score: number | null
}

export interface PerformersResponse {
    top_performers: EmployeeProductivitySummary[]
    low_performers: EmployeeProductivitySummary[]
}

export interface TaskTemplate extends BaseModel {
    created_by?: string
    title: string
    details?: string
    estimated_finish_time?: string
    expected_expenses?: number
    is_shared: boolean
    is_active: boolean
}

export interface TaskTemplateCreate {
    title: string
    details?: string
    estimated_finish_time?: string
    expected_expenses?: number
    is_shared?: boolean
}

export interface PolicyCreateExtended extends PolicyCreate {
    auto_close_time?: string
    task_planning_grace_minutes?: number
    allow_night_shift?: string
    max_shifts_per_day?: number
}

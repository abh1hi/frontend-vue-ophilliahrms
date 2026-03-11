// Global Type definitions for OphilliaHRMS API Contract

/**
 * Standard API Response Envelope
 * Every API response must conform to this structure.
 */
export interface ApiResponse<T = any> {
    success: boolean
    data: T | null
    meta: ApiMeta | null
    error: ApiError | null
}

/**
 * Standard Pagination and Metadata
 */
export interface ApiMeta {
    page?: number
    page_size?: number
    total_items?: number
    total_pages?: number
    [key: string]: any // For any additional metadata
}

/**
 * Standard Error Response Structure
 */
export interface ApiError {
    code: string
    message: string
    details?: any
}

/**
 * Standard Model Traits
 * Every entity generally includes these tracking fields.
 */
export interface BaseModel {
    id: string
    created_at: string
    updated_at: string
    created_by?: string
    updated_by?: string
    deleted_at?: string | null
    is_active?: boolean
}

/**
 * Employee Types
 */
export interface Employee extends BaseModel {
    user_id: string
    first_name: string
    last_name: string
    email: string
    phone?: string
    gender?: string
    date_of_birth?: string
    date_joined: string
    department_id?: string
    designation?: string
    employment_status: string
    address?: string
}

export interface EmployeeCreate {
    user_id: string
    first_name: string
    last_name: string
    email: string
    phone?: string
    gender?: string
    date_of_birth?: string
    date_joined: string
    department_id?: string
    designation?: string
    address?: string
}

export interface EmployeeUpdate {
    first_name?: string
    last_name?: string
    phone?: string
    gender?: string
    date_of_birth?: string
    department_id?: string
    designation?: string
    employment_status?: string
    address?: string
}

export interface EmployeeListResponse {
    total: number
    skip: number
    limit: number
    employees: Employee[]
}

/**
 * Department Types
 */
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

/**
 * Attendance Types
 */
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

/**
 * Geofence Types
 */
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

/**
 * Attendance Policy Types
 */
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

/**
 * Leave Service Types
 */
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

/**
 * Payroll Service Types
 */
export interface SalaryStructure extends BaseModel {
    name: string
    description?: string
    basic_pct: number
    hra_pct: number
    allowances_pct: number
    pf_pct: number
    esi_pct: number
    professional_tax: number
}

export interface EmployeeSalary extends BaseModel {
    employee_id: string
    salary_structure_id: string
    ctc: number
    effective_from: string
    effective_to?: string
}

export interface PayrollRun extends BaseModel {
    period_start: string
    period_end: string
    status: string
    total_employees: number
    total_gross: number
    total_net: number
    total_deductions: number
    error_message?: string
}

export interface Payslip extends BaseModel {
    payroll_run_id: string
    employee_id: string
    ctc: number
    basic: number
    hra: number
    allowances: number
    pf_deduction: number
    esi_deduction: number
    professional_tax: number
    other_deductions: number
    gross: number
    total_deductions: number
    net: number
    period_start: string
    period_end: string
}

/**
 * Notification Service Types
 */
export interface NotificationLog extends BaseModel {
    type: string
    subject?: string
    message: string
    status: string
    error_message?: string
    sent_at?: string
}

/**
 * Audit Service Types
 */
export interface AuditLog {
    id: string
    event_id: string
    event_version: number
    event_type: string
    service_source: string
    user_id?: string
    correlation_id?: string
    ip_address?: string
    user_agent?: string
    http_method?: string
    endpoint?: string
    payload: any
    timestamp: string
    created_at: string
}

export interface AuditLogListResponse {
    items: AuditLog[]
    total: number
    skip: number
    limit: number
}

/**
 * Student Module Types
 */
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

export interface Guardian extends BaseModel {
    student_id: string
    first_name: string
    last_name: string
    relationship: 'father' | 'mother' | 'other'
    phone: string
    email?: string
    is_primary: boolean
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


import type { BaseModel } from './common.types'

export interface Employee extends BaseModel {
    user_id: string
    // Personal
    first_name: string
    last_name: string
    gender?: string
    date_of_birth?: string
    // Address
    door_no?: string
    street?: string
    village_town?: string
    pin_code?: string
    // Contact
    phone?: string
    phone_2?: string
    personal_email?: string
    email: string
    // Government IDs
    driving_license_number?: string
    aadhaar_number?: string
    uan_number?: string
    esi_number?: string
    pan_number?: string
    // Banking
    bank_account_number?: string
    bank_name?: string
    bank_branch?: string
    ifsc_code?: string
    // Emergency contact
    emergency_contact_name?: string
    emergency_contact_number?: string
    emergency_contact_relation?: string
    // Education
    highest_qualification?: string
    year_of_passing?: string
    percentage?: string
    institute_name?: string
    // Work history
    last_firm_name?: string
    years_of_experience?: string
    last_designation?: string
    last_drawn_salary?: number | null
    reason_to_quit?: string
    referred_by?: string
    // Health
    health_issues?: string
    allergies?: string
    // Job info
    date_joined: string
    department_id?: string
    designation?: string
    employment_status: string
    project?: string
    joining_salary?: number | null
    role?: string
    // Files
    staff_photo_url?: string
    staff_documents_urls?: string
}

export interface EmployeeCreate {
    user_id: string
    first_name: string
    last_name: string
    gender?: string
    date_of_birth?: string
    door_no?: string
    street?: string
    village_town?: string
    pin_code?: string
    phone?: string
    phone_2?: string
    personal_email?: string
    email: string
    driving_license_number?: string
    aadhaar_number?: string
    uan_number?: string
    esi_number?: string
    pan_number?: string
    bank_account_number?: string
    bank_name?: string
    bank_branch?: string
    ifsc_code?: string
    emergency_contact_name?: string
    emergency_contact_number?: string
    emergency_contact_relation?: string
    highest_qualification?: string
    year_of_passing?: string
    percentage?: string
    institute_name?: string
    last_firm_name?: string
    years_of_experience?: string
    last_designation?: string
    last_drawn_salary?: number | null
    reason_to_quit?: string
    referred_by?: string
    health_issues?: string
    allergies?: string
    date_joined: string
    department_id?: string
    designation?: string
    project?: string
    joining_salary?: number | null
    role?: string
    staff_photo_url?: string
    staff_documents_urls?: string
}

export interface EmployeeUpdate {
    first_name?: string
    last_name?: string
    gender?: string
    date_of_birth?: string
    door_no?: string
    street?: string
    village_town?: string
    pin_code?: string
    phone?: string
    phone_2?: string
    personal_email?: string
    driving_license_number?: string
    aadhaar_number?: string
    uan_number?: string
    esi_number?: string
    pan_number?: string
    bank_account_number?: string
    bank_name?: string
    bank_branch?: string
    ifsc_code?: string
    emergency_contact_name?: string
    emergency_contact_number?: string
    emergency_contact_relation?: string
    highest_qualification?: string
    year_of_passing?: string
    percentage?: string
    institute_name?: string
    last_firm_name?: string
    years_of_experience?: string
    last_designation?: string
    last_drawn_salary?: number | null
    reason_to_quit?: string
    referred_by?: string
    health_issues?: string
    allergies?: string
    department_id?: string
    designation?: string
    employment_status?: string
    project?: string
    joining_salary?: number | null
    role?: string
    staff_photo_url?: string
    staff_documents_urls?: string
}

export interface EmployeeListResponse {
    total: number
    skip: number
    limit: number
    employees: Employee[]
}

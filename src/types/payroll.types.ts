import type { BaseModel } from './common.types'

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

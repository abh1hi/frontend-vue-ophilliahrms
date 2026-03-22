import { defineStore } from 'pinia'
import apiClient from '@/utils/api-client'
import type {
    SalaryStructure,
    EmployeeSalary,
    PayrollRun,
    Payslip,
    SalaryStructureCreate,
    SalaryStructureUpdate,
    SalaryAssign,
} from '@/types/api.types'
import { useToastStore } from './toast.store'

export const usePayrollStore = defineStore('payroll', {
    state: () => ({
        salaryStructures: [] as SalaryStructure[],
        employeeSalaries: [] as EmployeeSalary[],
        payrollRuns: [] as PayrollRun[],
        payslips: [] as Payslip[],
        totalRuns: 0,
        isLoading: false,
        error: null as string | null,
    }),

    actions: {
        async fetchSalaryStructures() {
            try {
                const response: any = await apiClient.get('/payroll/salary-structures')
                this.salaryStructures = response.data || response
            } catch (err) {
                console.error('Failed to fetch salary structures', err)
            }
        },

        async fetchPayrollRuns(params: any = {}) {
            this.isLoading = true
            try {
                const response: any = await apiClient.get('/payroll/runs', { params })
                const data = response.data || response
                this.payrollRuns = data.records || data
                this.totalRuns = data.total || this.payrollRuns.length
            } catch (err: any) {
                this.error = err.error?.message || 'Failed to fetch payroll runs'
            } finally {
                this.isLoading = false
            }
        },

        async createPayrollRun(runData: any) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                const response: any = await apiClient.post('/payroll/runs', runData)
                const newRun = response.data || response
                this.payrollRuns.unshift(newRun)
                toast.show('Payroll run initiated', 'success')
                return newRun
            } catch (err: any) {
                const msg = err.error?.message || 'Failed to initiate payroll run'
                toast.show(msg, 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async fetchPayslips(runId: string) {
            this.isLoading = true
            try {
                const response: any = await apiClient.get(`/payroll/runs/${runId}/payslips`)
                const data = response.data || response
                this.payslips = Array.isArray(data) ? data : data.payslips || []
            } catch (err) {
                console.error('Failed to fetch payslips', err)
            } finally {
                this.isLoading = false
            }
        },

        // ── Salary Structures CRUD ──
        async createSalaryStructure(data: SalaryStructureCreate) {
            const toast = useToastStore()
            try {
                const response: any = await apiClient.post('/salary/structures', data)
                const created: SalaryStructure = response.data || response
                this.salaryStructures.unshift(created)
                toast.show('Salary structure created', 'success')
                return created
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to create structure', 'error')
                throw err
            }
        },

        async updateSalaryStructure(id: string, data: SalaryStructureUpdate) {
            const toast = useToastStore()
            try {
                const response: any = await apiClient.patch(`/salary/structures/${id}`, data)
                const updated: SalaryStructure = response.data || response
                const idx = this.salaryStructures.findIndex(s => s.id === id)
                if (idx !== -1) this.salaryStructures[idx] = updated
                toast.show('Salary structure updated', 'success')
                return updated
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to update structure', 'error')
                throw err
            }
        },

        async deleteSalaryStructure(id: string) {
            const toast = useToastStore()
            try {
                await apiClient.delete(`/salary/structures/${id}`)
                this.salaryStructures = this.salaryStructures.filter(s => s.id !== id)
                toast.show('Salary structure deleted', 'success')
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to delete structure', 'error')
                throw err
            }
        },

        // ── Salary Assignment ──
        async assignSalary(data: SalaryAssign) {
            const toast = useToastStore()
            try {
                const response: any = await apiClient.post('/salary/assign', data)
                const assignment: EmployeeSalary = response.data || response
                this.employeeSalaries.unshift(assignment)
                toast.show('Salary assigned', 'success')
                return assignment
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to assign salary', 'error')
                throw err
            }
        },

        async fetchEmployeeSalary(employeeId: string) {
            try {
                const response: any = await apiClient.get(`/salary/employee/${employeeId}`)
                return response.data || response
            } catch (err) {
                console.error('Failed to fetch employee salary', err)
                return null
            }
        },

        async fetchSalaryHistory(employeeId: string) {
            try {
                const response: any = await apiClient.get(`/salary/employee/${employeeId}/history`)
                const data = response.data || response
                return Array.isArray(data) ? data : data.history || []
            } catch (err) {
                console.error('Failed to fetch salary history', err)
                return []
            }
        },
    }
})

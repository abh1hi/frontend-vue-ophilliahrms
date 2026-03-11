import { defineStore } from 'pinia'
import apiClient from '@/utils/api-client'
import type {
    SalaryStructure,
    EmployeeSalary,
    PayrollRun,
    Payslip
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
                this.payslips = response.data || response
            } catch (err) {
                console.error('Failed to fetch payslips', err)
            } finally {
                this.isLoading = false
            }
        }
    }
})

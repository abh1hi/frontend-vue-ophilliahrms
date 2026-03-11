import { defineStore } from 'pinia'
import { EmployeeService, type Employee, type CreateEmployeeDto, type UpdateEmployeeDto } from '../api/employee.api'
import { useToastStore } from '@/store/toast.store'
import type { ApiMeta } from '@/types/api.types'

export const useEmployeeStore = defineStore('employee', {
    state: () => ({
        employees: [] as Employee[],
        currentEmployee: null as Employee | null,
        meta: null as ApiMeta | null,
        isLoading: false,
        error: null as string | null,
    }),

    actions: {
        async fetchEmployees(params?: { page?: number; page_size?: number; search?: string }) {
            this.isLoading = true
            this.error = null
            const toast = useToastStore()

            try {
                const response = await EmployeeService.getEmployees(params)
                if (response.success && response.data) {
                    this.employees = response.data
                    this.meta = response.meta || null
                }
            } catch (err: any) {
                this.error = err.error?.message || 'Failed to fetch employees'
                toast.error(this.error as string)
            } finally {
                this.isLoading = false
            }
        },

        async fetchEmployee(id: string) {
            this.isLoading = true
            this.error = null

            try {
                const response = await EmployeeService.getEmployee(id)
                if (response.success && response.data) {
                    this.currentEmployee = response.data
                    return response.data
                }
            } catch (err: any) {
                this.error = err.error?.message || 'Failed to load employee details'
                useToastStore().error(this.error as string)
            } finally {
                this.isLoading = false
            }
        },

        async create(data: CreateEmployeeDto) {
            this.isLoading = true
            const toast = useToastStore()

            try {
                const response = await EmployeeService.createEmployee(data)
                if (response.success) {
                    toast.success('Employee created successfully')
                    await this.fetchEmployees() // Refresh list
                    return true
                }
            } catch (err: any) {
                toast.error(err.error?.message || 'Failed to create employee')
                return false
            } finally {
                this.isLoading = false
            }
        },

        async update(id: string, data: UpdateEmployeeDto) {
            this.isLoading = true
            const toast = useToastStore()

            try {
                const response = await EmployeeService.updateEmployee(id, data)
                if (response.success) {
                    toast.success('Employee updated successfully')
                    await this.fetchEmployees() // Refresh list
                    return true
                }
            } catch (err: any) {
                toast.error(err.error?.message || 'Failed to update employee')
                return false
            } finally {
                this.isLoading = false
            }
        },

        async delete(id: string) {
            this.isLoading = true
            const toast = useToastStore()

            try {
                const response = await EmployeeService.deleteEmployee(id)
                if (response.success) {
                    toast.success('Employee removed')
                    await this.fetchEmployees() // refresh list
                    return true
                }
            } catch (err: any) {
                toast.error(err.error?.message || 'Failed to remove employee')
                return false
            } finally {
                this.isLoading = false
            }
        }
    }
})

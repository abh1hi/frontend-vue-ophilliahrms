import { defineStore } from 'pinia'
import apiClient from '@/utils/api-client'
import type {
    Employee,
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeListResponse
} from '@/types/api.types'
import { useToastStore } from './toast.store'

export const useEmployeeStore = defineStore('employee', {
    state: () => ({
        employees: [] as Employee[],
        totalEmployees: 0,
        isLoading: false,
        error: null as string | null,
        pagination: {
            page: 1,
            pageSize: 10
        }
    }),

    actions: {
        async fetchEmployees(params: any = {}) {
            this.isLoading = true
            this.error = null
            try {
                const queryParams = {
                    page: params.page || this.pagination.page,
                    page_size: params.pageSize || this.pagination.pageSize,
                    ...params
                }
                const response: any = await apiClient.get('/employees', { params: queryParams })
                // Handle both wrapped and unwrapped response
                const data: EmployeeListResponse = response.data || response
                this.employees = data.employees
                this.totalEmployees = data.total

                if (params.page) this.pagination.page = params.page
                if (params.pageSize) this.pagination.pageSize = params.pageSize
            } catch (err: any) {
                this.error = err.error?.message || 'Failed to fetch employees'
                console.error(this.error)
            } finally {
                this.isLoading = false
            }
        },

        async createEmployee(employeeData: EmployeeCreate) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                const response: any = await apiClient.post('/employees', employeeData)
                const newEmp: Employee = response.data || response
                this.employees.unshift(newEmp)
                this.totalEmployees++
                toast.show('Employee created successfully', 'success')
                return newEmp
            } catch (err: any) {
                const msg = err.error?.message || 'Failed to create employee'
                toast.show(msg, 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async updateEmployee(id: string, employeeData: EmployeeUpdate) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                const response: any = await apiClient.patch(`/employees/${id}`, employeeData)
                const updatedEmp: Employee = response.data || response
                const index = this.employees.findIndex(e => e.id === id)
                if (index !== -1) {
                    this.employees[index] = updatedEmp
                }
                toast.show('Employee updated successfully', 'success')
                return updatedEmp
            } catch (err: any) {
                const msg = err.error?.message || 'Failed to update employee'
                toast.show(msg, 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async deleteEmployee(id: string) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                await apiClient.delete(`/employees/${id}`)
                this.employees = this.employees.filter(e => e.id !== id)
                this.totalEmployees--
                toast.show('Employee deactivated successfully', 'success')
            } catch (err: any) {
                const msg = err.error?.message || 'Failed to deactivate employee'
                toast.show(msg, 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async bulkImport(file: File) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                const formData = new FormData()
                formData.append('file', file)
                const response: any = await apiClient.post('/employees/bulk', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                const result = response.data || response
                toast.show(`Bulk import completed: ${result.created || 0} created, ${result.errors?.length || 0} errors`, 'success')
                await this.fetchEmployees()
                return result
            } catch (err: any) {
                const msg = err.error?.message || 'Bulk import failed'
                toast.show(msg, 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async fetchMyProfile() {
            try {
                const response: any = await apiClient.get('/employees/me')
                return response.data || response
            } catch (err) {
                console.error('Failed to fetch profile', err)
                return null
            }
        },
    }
})

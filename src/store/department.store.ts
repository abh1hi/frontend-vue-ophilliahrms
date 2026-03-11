import { defineStore } from 'pinia'
import apiClient from '@/utils/api-client'
import type {
    Department,
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentListResponse
} from '@/types/api.types'
import { useToastStore } from './toast.store'

export const useDepartmentStore = defineStore('department', {
    state: () => ({
        departments: [] as Department[],
        totalDepartments: 0,
        isLoading: false,
        error: null as string | null,
    }),

    actions: {
        async fetchDepartments() {
            this.isLoading = true
            this.error = null
            try {
                const response: any = await apiClient.get('/departments')
                // Handle both wrapped and unwrapped response
                const data: DepartmentListResponse = response.data || response
                this.departments = data.departments
                this.totalDepartments = data.total
            } catch (err: any) {
                this.error = err.error?.message || 'Failed to fetch departments'
                console.error(this.error)
            } finally {
                this.isLoading = false
            }
        },

        async createDepartment(departmentData: DepartmentCreate) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                const response: any = await apiClient.post('/departments', departmentData)
                const newDept: Department = response.data || response
                this.departments.push(newDept)
                this.totalDepartments++
                toast.show('Department created successfully', 'success')
                return newDept
            } catch (err: any) {
                const msg = err.error?.message || 'Failed to create department'
                toast.show(msg, 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async updateDepartment(id: string, departmentData: DepartmentUpdate) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                const response: any = await apiClient.patch(`/departments/${id}`, departmentData)
                const updatedDept: Department = response.data || response
                const index = this.departments.findIndex(d => d.id === id)
                if (index !== -1) {
                    this.departments[index] = updatedDept
                }
                toast.show('Department updated successfully', 'success')
                return updatedDept
            } catch (err: any) {
                const msg = err.error?.message || 'Failed to update department'
                toast.show(msg, 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async deleteDepartment(id: string) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                await apiClient.delete(`/departments/${id}`)
                this.departments = this.departments.filter(d => d.id !== id)
                this.totalDepartments--
                toast.show('Department deleted successfully', 'success')
            } catch (err: any) {
                const msg = err.error?.message || 'Failed to delete department'
                toast.show(msg, 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        }
    }
})

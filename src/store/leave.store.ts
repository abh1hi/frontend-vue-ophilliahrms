import { defineStore } from 'pinia'
import apiClient from '@/utils/api-client'
import type {
    LeaveRequest,
    LeaveType,
    LeaveBalance,
    Holiday
} from '@/types/api.types'
import { useToastStore } from './toast.store'

export const useLeaveStore = defineStore('leave', {
    state: () => ({
        leaveRequests: [] as LeaveRequest[],
        leaveTypes: [] as LeaveType[],
        leaveBalances: [] as LeaveBalance[],
        holidays: [] as Holiday[],
        totalRequests: 0,
        isLoading: false,
        error: null as string | null,
    }),

    actions: {
        async fetchLeaveTypes() {
            try {
                const response: any = await apiClient.get('/leave-types')
                this.leaveTypes = response.data || response
            } catch (err) {
                console.error('Failed to fetch leave types', err)
            }
        },

        async fetchLeaveBalances() {
            try {
                const response: any = await apiClient.get('/leave-balances')
                this.leaveBalances = response.data || response
            } catch (err) {
                console.error('Failed to fetch leave balances', err)
            }
        },

        async fetchLeaveRequests(params: any = {}) {
            this.isLoading = true
            try {
                const response: any = await apiClient.get('/leave-requests', { params })
                const data = response.data || response
                this.leaveRequests = data.records || data
                this.totalRequests = data.total || this.leaveRequests.length
            } catch (err: any) {
                this.error = err.error?.message || 'Failed to fetch leave requests'
            } finally {
                this.isLoading = false
            }
        },

        async createLeaveRequest(requestData: any) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                const response: any = await apiClient.post('/leave-requests', requestData)
                const newRequest = response.data || response
                this.leaveRequests.unshift(newRequest)
                toast.show('Leave request submitted successfully', 'success')
                return newRequest
            } catch (err: any) {
                const msg = err.error?.message || 'Failed to submit leave request'
                toast.show(msg, 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async updateLeaveStatus(id: string, status: string, managerNotes?: string) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                const response: any = await apiClient.patch(`/leave-requests/${id}`, {
                    status,
                    manager_notes: managerNotes
                })
                const updated = response.data || response
                const index = this.leaveRequests.findIndex(r => r.id === id)
                if (index !== -1) {
                    this.leaveRequests[index] = updated
                }
                toast.show(`Leave request ${status}`, 'success')
                return updated
            } catch (err: any) {
                const msg = err.error?.message || 'Failed to update leave status'
                toast.show(msg, 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async fetchHolidays() {
            try {
                const response: any = await apiClient.get('/holidays')
                this.holidays = response.data || response
            } catch (err) {
                console.error('Failed to fetch holidays', err)
            }
        }
    }
})

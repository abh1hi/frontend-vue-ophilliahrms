import { defineStore } from 'pinia'
import apiClient from '@/utils/api-client'
import type {
    LeaveRequest,
    LeaveType,
    LeaveBalance,
    Holiday,
    LeaveTypeCreate,
    LeaveTypeUpdate,
    LeaveBalanceCreate,
    BulkLeaveBalanceRequest,
    HolidayCreate,
    CalendarDate,
} from '@/types/api.types'
import { useToastStore } from './toast.store'

export const useLeaveStore = defineStore('leave', {
    state: () => ({
        leaveRequests: [] as LeaveRequest[],
        leaveTypes: [] as LeaveType[],
        leaveBalances: [] as LeaveBalance[],
        holidays: [] as Holiday[],
        calendarDates: [] as CalendarDate[],
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

        async fetchLeaveBalances(year?: number) {
            try {
                const params = year ? { year } : { year: new Date().getFullYear() }
                const response: any = await apiClient.get('/leave-balances/', { params })
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
                const response: any = await apiClient.put(`/leave-requests/${id}/status`, {
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
                const data = response.data || response
                this.holidays = Array.isArray(data) ? data : data.holidays || []
            } catch (err) {
                console.error('Failed to fetch holidays', err)
            }
        },

        // ── Leave Types CRUD ──
        async createLeaveType(data: LeaveTypeCreate) {
            const toast = useToastStore()
            try {
                const response: any = await apiClient.post('/leave-types', data)
                const created: LeaveType = response.data || response
                this.leaveTypes.unshift(created)
                toast.show('Leave type created', 'success')
                return created
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to create leave type', 'error')
                throw err
            }
        },

        async updateLeaveType(id: string, data: LeaveTypeUpdate) {
            const toast = useToastStore()
            try {
                const response: any = await apiClient.patch(`/leave-types/${id}`, data)
                const updated: LeaveType = response.data || response
                const idx = this.leaveTypes.findIndex(t => t.id === id)
                if (idx !== -1) this.leaveTypes[idx] = updated
                toast.show('Leave type updated', 'success')
                return updated
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to update leave type', 'error')
                throw err
            }
        },

        async deleteLeaveType(id: string) {
            const toast = useToastStore()
            try {
                await apiClient.delete(`/leave-types/${id}`)
                this.leaveTypes = this.leaveTypes.filter(t => t.id !== id)
                toast.show('Leave type deleted', 'success')
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to delete leave type', 'error')
                throw err
            }
        },

        // ── Leave Balances ──
        async createLeaveBalance(data: LeaveBalanceCreate) {
            const toast = useToastStore()
            try {
                const response: any = await apiClient.post('/leave-balances', data)
                const created: LeaveBalance = response.data || response
                this.leaveBalances.unshift(created)
                toast.show('Leave balance allocated', 'success')
                return created
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to allocate balance', 'error')
                throw err
            }
        },

        async bulkCreateLeaveBalances(data: BulkLeaveBalanceRequest) {
            const toast = useToastStore()
            try {
                const response: any = await apiClient.post('/leave-balances/bulk', data)
                toast.show('Bulk allocation completed', 'success')
                await this.fetchLeaveBalances()
                return response.data || response
            } catch (err: any) {
                toast.show(err.error?.message || 'Bulk allocation failed', 'error')
                throw err
            }
        },

        // ── Holidays ──
        async createHoliday(data: HolidayCreate) {
            const toast = useToastStore()
            try {
                const response: any = await apiClient.post('/holidays', data)
                const created: Holiday = response.data || response
                this.holidays.unshift(created)
                toast.show('Holiday created', 'success')
                return created
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to create holiday', 'error')
                throw err
            }
        },

        async deleteHoliday(id: string) {
            const toast = useToastStore()
            try {
                await apiClient.delete(`/holidays/${id}`)
                this.holidays = this.holidays.filter(h => h.id !== id)
                toast.show('Holiday deleted', 'success')
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to delete holiday', 'error')
                throw err
            }
        },

        // ── Calendar ──
        async fetchLeaveCalendar(startDate: string, endDate: string) {
            try {
                const response: any = await apiClient.get('/leave-calendar', {
                    params: { start_date: startDate, end_date: endDate },
                })
                const data = response.data || response
                this.calendarDates = Array.isArray(data) ? data : data.dates || []
                return this.calendarDates
            } catch (err) {
                console.error('Failed to fetch calendar', err)
                return []
            }
        },
    }
})

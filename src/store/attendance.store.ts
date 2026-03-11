import { defineStore } from 'pinia'
import apiClient from '@/utils/api-client'
import type {
    Attendance,
    AttendanceListResponse,
    ClockInRequest,
    ClockOutRequest,
    ManualAttendanceCreate,
    AttendanceUpdate
} from '@/types/api.types'
import { useToastStore } from './toast.store'

export const useAttendanceStore = defineStore('attendance', {
    state: () => ({
        records: [] as Attendance[],
        todayRecord: null as Attendance | null,
        totalRecords: 0,
        isLoading: false,
        error: null as string | null,
        pagination: {
            page: 1,
            pageSize: 10
        }
    }),

    actions: {
        async fetchAttendance(params: any = {}) {
            this.isLoading = true
            this.error = null
            try {
                const queryParams = {
                    page: params.page || this.pagination.page,
                    page_size: params.pageSize || this.pagination.pageSize,
                    ...params
                }
                const response: any = await apiClient.get('/attendance', { params: queryParams })
                const data: AttendanceListResponse = response.data || response
                this.records = data.records
                this.totalRecords = data.total

                if (params.page) this.pagination.page = params.page
                if (params.pageSize) this.pagination.pageSize = params.pageSize
            } catch (err: any) {
                this.error = err.error?.message || 'Failed to fetch attendance'
            } finally {
                this.isLoading = false
            }
        },

        async fetchTodayRecord() {
            try {
                const response: any = await apiClient.get('/attendance/me/today')
                this.todayRecord = response.data || response || null
            } catch (err) {
                console.error("Failed to fetch today's attendance", err)
            }
        },

        async clockIn(data: ClockInRequest = {}) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                const response: any = await apiClient.post('/attendance/clock-in', data)
                this.todayRecord = response.data || response
                toast.show('Clocked in successfully', 'success')
                return this.todayRecord
            } catch (err: any) {
                const msg = err.error?.message || 'Clock in failed'
                toast.show(msg, 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async clockOut(data: ClockOutRequest = {}) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                const response: any = await apiClient.post('/attendance/clock-out', data)
                this.todayRecord = response.data || response
                toast.show('Clocked out successfully', 'success')
                return this.todayRecord
            } catch (err: any) {
                const msg = err.error?.message || 'Clock out failed'
                toast.show(msg, 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async createManualEntry(data: ManualAttendanceCreate) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                const response: any = await apiClient.post('/attendance/manual', data)
                const newRecord = response.data || response
                this.records.unshift(newRecord)
                this.totalRecords++
                toast.show('Attendance record added manually', 'success')
                return newRecord
            } catch (err: any) {
                const msg = err.error?.message || 'Failed to add manual entry'
                toast.show(msg, 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async updateRecord(id: string, data: AttendanceUpdate) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                const response: any = await apiClient.patch(`/attendance/${id}`, data)
                const updated = response.data || response
                const index = this.records.findIndex(r => r.id === id)
                if (index !== -1) {
                    this.records[index] = updated
                }
                toast.show('Attendance record updated', 'success')
                return updated
            } catch (err: any) {
                const msg = err.error?.message || 'Failed to update record'
                toast.show(msg, 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        }
    }
})

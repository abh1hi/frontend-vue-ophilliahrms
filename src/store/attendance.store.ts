import { defineStore } from 'pinia'
import apiClient from '@/utils/api-client'
import type {
    Attendance,
    AttendanceListResponse,
    ClockInRequest,
    ClockOutRequest,
    ManualAttendanceCreate,
    AttendanceUpdate,
    AttendanceTask,
    TaskCreate,
    TaskUpdate,
    TaskComplete,
    TaskAssign,
    Geofence,
    GeofenceCreate,
    GeofenceUpdate,
    AttendancePolicy,
    PolicyCreate,
    PolicyUpdate,
    ProductivityReport,
    SchoolModeEntry,
    BulkSchoolModeRequest,
    AdminKPI,
    AttendanceTrendItem,
    DailyStatusBreakdown,
    PerformersResponse,
    TaskTemplate,
    TaskTemplateCreate,
} from '@/types/api.types'
import { useToastStore } from './toast.store'

export const useAttendanceStore = defineStore('attendance', {
    state: () => ({
        records: [] as Attendance[],
        todayRecord: null as Attendance | null,
        totalRecords: 0,
        tasks: [] as AttendanceTask[],
        geofences: [] as Geofence[],
        policies: [] as AttendancePolicy[],
        productivityReport: [] as ProductivityReport[],
        templates: [] as TaskTemplate[],
        // Admin Dashboard KPI state
        adminKPI: null as AdminKPI | null,
        attendanceTrend: [] as AttendanceTrendItem[],
        statusBreakdown: null as DailyStatusBreakdown | null,
        performers: null as PerformersResponse | null,
        alerts: null as any,
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
        },

        // ── Tasks ──
        async fetchTodayTasks() {
            try {
                const response: any = await apiClient.get('/attendance/tasks/today')
                const data = response.data || response
                this.tasks = Array.isArray(data) ? data : data.tasks || []
            } catch (err: any) {
                console.error('Failed to fetch tasks', err)
            }
        },

        async createTask(data: TaskCreate) {
            const toast = useToastStore()
            try {
                const response: any = await apiClient.post('/attendance/tasks', data)
                const task: AttendanceTask = response.data || response
                this.tasks.unshift(task)
                toast.show('Task created', 'success')
                return task
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to create task', 'error')
                throw err
            }
        },

        async updateTask(taskId: string, data: TaskUpdate) {
            const toast = useToastStore()
            try {
                const response: any = await apiClient.patch(`/attendance/tasks/${taskId}`, data)
                const updated: AttendanceTask = response.data || response
                const idx = this.tasks.findIndex(t => t.id === taskId)
                if (idx !== -1) this.tasks[idx] = updated
                toast.show('Task updated', 'success')
                return updated
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to update task', 'error')
                throw err
            }
        },

        async deleteTask(taskId: string) {
            const toast = useToastStore()
            try {
                await apiClient.delete(`/attendance/tasks/${taskId}`)
                this.tasks = this.tasks.filter(t => t.id !== taskId)
                toast.show('Task deleted', 'success')
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to delete task', 'error')
                throw err
            }
        },

        async completeTask(taskId: string, data: TaskComplete) {
            const toast = useToastStore()
            try {
                const response: any = await apiClient.patch(`/attendance/tasks/${taskId}/complete`, data)
                const updated: AttendanceTask = response.data || response
                const idx = this.tasks.findIndex(t => t.id === taskId)
                if (idx !== -1) this.tasks[idx] = updated
                toast.show('Task completed', 'success')
                return updated
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to complete task', 'error')
                throw err
            }
        },

        async assignTask(data: TaskAssign) {
            const toast = useToastStore()
            try {
                const response: any = await apiClient.post('/attendance/tasks/assign', data)
                const task: AttendanceTask = response.data || response
                this.tasks.unshift(task)
                toast.show('Task assigned', 'success')
                return task
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to assign task', 'error')
                throw err
            }
        },

        // ── Geofences ──
        async fetchGeofences() {
            this.isLoading = true
            try {
                const response: any = await apiClient.get('/attendance/geofences')
                const data = response.data || response
                this.geofences = Array.isArray(data) ? data : data.geofences || []
            } catch (err: any) {
                console.error('Failed to fetch geofences', err)
            } finally {
                this.isLoading = false
            }
        },

        async createGeofence(data: GeofenceCreate) {
            const toast = useToastStore()
            try {
                const response: any = await apiClient.post('/attendance/geofences', data)
                const gf: Geofence = response.data || response
                this.geofences.unshift(gf)
                toast.show('Geofence created', 'success')
                return gf
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to create geofence', 'error')
                throw err
            }
        },

        async updateGeofence(id: string, data: GeofenceUpdate) {
            const toast = useToastStore()
            try {
                const response: any = await apiClient.patch(`/attendance/geofences/${id}`, data)
                const updated: Geofence = response.data || response
                const idx = this.geofences.findIndex(g => g.id === id)
                if (idx !== -1) this.geofences[idx] = updated
                toast.show('Geofence updated', 'success')
                return updated
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to update geofence', 'error')
                throw err
            }
        },

        async deleteGeofence(id: string) {
            const toast = useToastStore()
            try {
                await apiClient.delete(`/attendance/geofences/${id}`)
                this.geofences = this.geofences.filter(g => g.id !== id)
                toast.show('Geofence deleted', 'success')
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to delete geofence', 'error')
                throw err
            }
        },

        // ── Policies ──
        async fetchPolicies() {
            this.isLoading = true
            try {
                const response: any = await apiClient.get('/attendance/policies')
                const data = response.data || response
                this.policies = Array.isArray(data) ? data : data.policies || []
            } catch (err: any) {
                console.error('Failed to fetch policies', err)
            } finally {
                this.isLoading = false
            }
        },

        async createPolicy(data: PolicyCreate) {
            const toast = useToastStore()
            try {
                const response: any = await apiClient.post('/attendance/policies', data)
                const policy: AttendancePolicy = response.data || response
                this.policies.unshift(policy)
                toast.show('Policy created', 'success')
                return policy
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to create policy', 'error')
                throw err
            }
        },

        async updatePolicy(id: string, data: PolicyUpdate) {
            const toast = useToastStore()
            try {
                const response: any = await apiClient.patch(`/attendance/policies/${id}`, data)
                const updated: AttendancePolicy = response.data || response
                const idx = this.policies.findIndex(p => p.id === id)
                if (idx !== -1) this.policies[idx] = updated
                toast.show('Policy updated', 'success')
                return updated
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to update policy', 'error')
                throw err
            }
        },

        async deletePolicy(id: string) {
            const toast = useToastStore()
            try {
                await apiClient.delete(`/attendance/policies/${id}`)
                this.policies = this.policies.filter(p => p.id !== id)
                toast.show('Policy deleted', 'success')
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to delete policy', 'error')
                throw err
            }
        },

        // ── School Mode ──
        async createSchoolModeEntry(data: SchoolModeEntry) {
            const toast = useToastStore()
            try {
                const response: any = await apiClient.post('/attendance/school-mode', data)
                toast.show('School mode entry recorded', 'success')
                return response.data || response
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to record entry', 'error')
                throw err
            }
        },

        async createBulkSchoolMode(data: BulkSchoolModeRequest) {
            const toast = useToastStore()
            try {
                const response: any = await apiClient.post('/attendance/school-mode/bulk', data)
                toast.show('Bulk school mode entries recorded', 'success')
                return response.data || response
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to record bulk entries', 'error')
                throw err
            }
        },

        // ── Reports ──
        async fetchProductivityReport(params: Record<string, any> = {}) {
            this.isLoading = true
            try {
                const response: any = await apiClient.get('/attendance/reports/productivity', { params })
                const data = response.data || response
                this.productivityReport = Array.isArray(data) ? data : data.reports || []
                return this.productivityReport
            } catch (err: any) {
                console.error('Failed to fetch productivity report', err)
                return []
            } finally {
                this.isLoading = false
            }
        },

        // ── Admin Dashboard KPI ──
        async fetchAdminKPI(targetDate?: string) {
            try {
                const params = targetDate ? { target_date: targetDate } : {}
                const response: any = await apiClient.get('/attendance/dashboard/kpi', { params })
                this.adminKPI = response.data || response
                return this.adminKPI
            } catch (err: any) {
                console.error('Failed to fetch admin KPI', err)
                return null
            }
        },

        async fetchAttendanceTrend(days = 7) {
            try {
                const response: any = await apiClient.get('/attendance/dashboard/trend', { params: { days } })
                const data = response.data || response
                this.attendanceTrend = data.items || data || []
                return this.attendanceTrend
            } catch (err: any) {
                console.error('Failed to fetch attendance trend', err)
                return []
            }
        },

        async fetchStatusBreakdown(targetDate?: string) {
            try {
                const params = targetDate ? { target_date: targetDate } : {}
                const response: any = await apiClient.get('/attendance/dashboard/status-breakdown', { params })
                this.statusBreakdown = response.data || response
                return this.statusBreakdown
            } catch (err: any) {
                console.error('Failed to fetch status breakdown', err)
                return null
            }
        },

        async fetchPerformers(year: number, month: number, limit = 5) {
            try {
                const response: any = await apiClient.get('/attendance/dashboard/performers', {
                    params: { year, month, limit }
                })
                this.performers = response.data || response
                return this.performers
            } catch (err: any) {
                console.error('Failed to fetch performers', err)
                return null
            }
        },

        async fetchAlerts() {
            try {
                const response: any = await apiClient.get('/attendance/alerts')
                this.alerts = response.data || response
                return this.alerts
            } catch (err: any) {
                console.error('Failed to fetch alerts', err)
                return null
            }
        },

        async exportCSV(params: Record<string, any> = {}) {
            const toast = useToastStore()
            try {
                const response = await apiClient.get('/attendance/export/csv', {
                    params,
                    responseType: 'blob' as any
                })
                const blob = new Blob([response as any], { type: 'text/csv' })
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'attendance_export.csv'
                a.click()
                window.URL.revokeObjectURL(url)
                toast.show('CSV exported successfully', 'success')
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to export CSV', 'error')
            }
        },

        // ── Task Templates ──
        async fetchTemplates() {
            try {
                const response: any = await apiClient.get('/attendance/templates')
                const data = response.data || response
                this.templates = Array.isArray(data) ? data : data.templates || []
                return this.templates
            } catch (err: any) {
                console.error('Failed to fetch templates', err)
                return []
            }
        },

        async createTemplate(data: TaskTemplateCreate) {
            const toast = useToastStore()
            try {
                const response: any = await apiClient.post('/attendance/templates', data)
                const template: TaskTemplate = response.data || response
                this.templates.unshift(template)
                toast.show('Template created', 'success')
                return template
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to create template', 'error')
                throw err
            }
        },

        async deleteTemplate(id: string) {
            const toast = useToastStore()
            try {
                await apiClient.delete(`/attendance/templates/${id}`)
                this.templates = this.templates.filter(t => t.id !== id)
                toast.show('Template deleted', 'success')
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to delete template', 'error')
                throw err
            }
        },
    }
})

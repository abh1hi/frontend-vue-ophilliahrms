import { defineStore } from 'pinia'
import apiClient from '@/utils/api-client'
import type { NotificationLog, AuditLog, AuditLogListResponse } from '@/types/api.types'

export const useSystemStore = defineStore('system', {
    state: () => ({
        notificationLogs: [] as NotificationLog[],
        totalNotificationLogs: 0,
        auditLogs: [] as AuditLog[],
        totalAuditLogs: 0,
        isLoading: false,
    }),

    actions: {
        async fetchNotificationLogs(params: any = {}) {
            this.isLoading = true
            try {
                const response: any = await apiClient.get('/notifications/logs', {
                    params: {
                        skip: params.skip || 0,
                        limit: params.limit || 50,
                        ...params
                    }
                })
                const data = response.data || response
                // Handle both array and paginated response formats
                if (Array.isArray(data)) {
                    this.notificationLogs = data
                    this.totalNotificationLogs = data.length
                } else if (data.items) {
                    this.notificationLogs = data.items
                    this.totalNotificationLogs = data.total || data.items.length
                }
            } catch (err) {
                console.error('Failed to fetch notification logs', err)
            } finally {
                this.isLoading = false
            }
        },

        async fetchAuditLogs(params: any = {}) {
            this.isLoading = true
            try {
                // Adjusting to match the audit service prefix /audit/logs
                const response: any = await apiClient.get('/audit/logs', {
                    params: {
                        skip: params.skip || 0,
                        limit: params.limit || 50,
                        ...params
                    }
                })
                const data: AuditLogListResponse = response.data || response
                this.auditLogs = data.items
                this.totalAuditLogs = data.total
            } catch (err) {
                console.error('Failed to fetch audit logs', err)
            } finally {
                this.isLoading = false
            }
        }
    }
})

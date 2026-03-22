import { defineStore } from 'pinia'
import apiClient from '@/utils/api-client'
import type { NotificationPreference, PreferenceUpdate } from '@/types/preference.types'
import { useToastStore } from './toast.store'

export const useNotificationStore = defineStore('notification', {
    state: () => ({
        preferences: null as NotificationPreference | null,
        isLoading: false,
    }),

    actions: {
        async fetchPreferences() {
            this.isLoading = true
            try {
                const response: any = await apiClient.get('/notifications/preferences')
                this.preferences = response.data || response
            } catch (err) {
                console.error('Failed to fetch notification preferences', err)
            } finally {
                this.isLoading = false
            }
        },

        async updatePreferences(data: PreferenceUpdate) {
            const toast = useToastStore()
            this.isLoading = true
            try {
                const response: any = await apiClient.put('/notifications/preferences', data)
                this.preferences = response.data || response
                toast.show('Notification preferences updated', 'success')
            } catch (err: any) {
                toast.show(err.error?.message || 'Failed to update preferences', 'error')
                throw err
            } finally {
                this.isLoading = false
            }
        },
    },
})

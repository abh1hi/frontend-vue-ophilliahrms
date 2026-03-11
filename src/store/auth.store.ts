import { defineStore } from 'pinia'
import apiClient from '@/utils/api-client'
import type { ApiResponse } from '@/types/api.types'

// Mocking the specific Auth API Response according to the contract
interface AuthResponseData {
    access_token: string
    refresh_token: string
    user: {
        id: string
        name: string
        email: string
        role: string
    }
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as AuthResponseData['user'] | null,
        accessToken: localStorage.getItem('access_token') || null,
        refreshToken: localStorage.getItem('refresh_token') || null,
        isLoading: false,
        error: null as string | null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.accessToken,
        userRole: (state) => state.user?.role || null,
    },

    actions: {
        async login(credentials: { email: string; password: string }) {
            this.isLoading = true
            this.error = null

            try {
                // The gateway backend currently returns a bare token object, not the standard envelope.
                const response: any = await apiClient.post('/auth/login', credentials)

                if (response.access_token) {
                    this.accessToken = response.access_token
                    this.refreshToken = response.refresh_token

                    // Persist tokens immediately so subsequent requests (like /auth/me) can use it
                    localStorage.setItem('access_token', this.accessToken || '')
                    localStorage.setItem('refresh_token', this.refreshToken || '')

                    // Fetch user details
                    await this.fetchUser()
                } else if (response.success && response.data) {
                    // Fallback to contract envelope if backend is updated
                    this.accessToken = response.data.access_token
                    this.refreshToken = response.data.refresh_token
                    this.user = response.data.user
                    localStorage.setItem('access_token', this.accessToken || '')
                    localStorage.setItem('refresh_token', this.refreshToken || '')
                } else {
                    this.error = "Invalid login response format."
                }
            } catch (err: any) {
                // The api-client interceptor normalizes error to { error: { code, message } }
                this.error = err.error?.message || 'Login failed'
                throw err
            } finally {
                this.isLoading = false
            }
        },

        async fetchUser() {
            try {
                const userResponse: any = await apiClient.get('/auth/me');
                // Backend might return envelope or bare user response
                const userData = userResponse.data || userResponse;

                if (userData && userData.id) {
                    this.user = {
                        id: userData.id,
                        name: userData.name || userData.email, // Backend doesn't have name right now, fallback to email
                        email: userData.email,
                        role: userData.role
                    }
                }
            } catch (err) {
                console.error("Failed to fetch user after login", err)
            }
        },

        logout() {
            this.user = null
            this.accessToken = null
            this.refreshToken = null
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
        },
    },
})

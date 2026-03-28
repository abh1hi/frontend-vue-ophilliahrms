import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '@/types/api.types'

// Instantiate centralized client
const apiClient: AxiosInstance = axios.create({
    baseURL: '/api/v1', // Defined by Universal API Contract Standard
    timeout: 10000,     // Temporarily increased for local development to avoid proxy timeouts
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request Interceptor: Attach Auth Token & Correlation ID
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // In a real app, you would retrieve this from Pinia or localStorage
        const token = localStorage.getItem('access_token')
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // Add default Correlation ID for distributed tracing
        // crypto.randomUUID() requires a secure context (HTTPS) in Safari/Firefox.
        // Fall back to a simple random ID when unavailable (e.g. HTTP on mobile).
        if (config.headers && !config.headers['X-Correlation-ID']) {
            const uuid = typeof crypto?.randomUUID === 'function'
                ? crypto.randomUUID()
                : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
            config.headers['X-Correlation-ID'] = uuid
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Token refresh state — prevents concurrent refresh calls
let isRefreshing = false
let failedQueue: Array<{
    resolve: (token: string) => void
    reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((pending) => {
        if (token) {
            pending.resolve(token)
        } else {
            pending.reject(error)
        }
    })
    failedQueue = []
}

// Response Interceptor: Normalize, Refresh Token on 401, Handle Global Errors
apiClient.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
        // Return straight away if successful; the caller wants the generic response envelope
        return response.data as any
    },
    async (error: any) => {
        const originalRequest = error.config

        // Attempt token refresh on 401 (skip for login/refresh endpoints)
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            window.location.pathname !== '/login' &&
            !originalRequest.url?.includes('/auth/refresh') &&
            !originalRequest.url?.includes('/auth/login')
        ) {
            if (isRefreshing) {
                // Queue this request until the refresh completes
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return apiClient(originalRequest)
                })
            }

            originalRequest._retry = true
            isRefreshing = true

            const refreshToken = localStorage.getItem('refresh_token')
            if (!refreshToken) {
                isRefreshing = false
                processQueue(error, null)
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                window.location.href = '/login'
                return Promise.reject(error)
            }

            try {
                const response = await axios.post('/api/v1/auth/refresh', {
                    refresh_token: refreshToken,
                })
                const data = response.data?.data || response.data
                const newAccessToken = data.access_token
                const newRefreshToken = data.refresh_token

                if (newAccessToken) {
                    localStorage.setItem('access_token', newAccessToken)
                    if (newRefreshToken) {
                        localStorage.setItem('refresh_token', newRefreshToken)
                    }
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
                    processQueue(null, newAccessToken)
                    return apiClient(originalRequest)
                } else {
                    throw new Error('No access token in refresh response')
                }
            } catch (refreshError) {
                processQueue(refreshError, null)
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                window.location.href = '/login'
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        // Normalize error according to schema
        const standardizedError = {
            success: false,
            data: null,
            meta: null,
            error: {
                code: 'UNKNOWN_ERROR',
                message: 'An unexpected error occurred.',
            },
        }

        if (error.response) {
            // If the backend sent a standardized error, use it
            if (error.response.data && error.response.data.error) {
                standardizedError.error = error.response.data.error
            } else {
                standardizedError.error.code = `HTTP_${error.response.status}`
                standardizedError.error.message = error.message
            }
        } else if (error.request) {
            // Network error or timeout (e.g., circuit breaker needs to trip)
            standardizedError.error.code = 'NETWORK_ERROR'
            standardizedError.error.message = 'Service unavailable or timeout reached.'
        }

        // Always return a rejected Promise with the standardized error format
        return Promise.reject(standardizedError)
    }
)

export default apiClient

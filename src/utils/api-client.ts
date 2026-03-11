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
        if (config.headers && !config.headers['X-Correlation-ID']) {
            config.headers['X-Correlation-ID'] = crypto.randomUUID()
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response Interceptor: Normalize and Handle Global Errors
apiClient.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
        // Return straight away if successful; the caller wants the generic response envelope
        return response.data as any
    },
    (error: any) => {
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
            if (error.response.status === 401) {
                // Token expired or invalid
                // TODO: Trigger logout or token refresh flow
                console.warn("401 Unauthorized - Need to refresh token or re-login")
            }

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

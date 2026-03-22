import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

export interface ServiceStatus {
    name: string
    url: string
    status: 'healthy' | 'unhealthy' | 'checking'
    latencyMs?: number
}

const SERVICE_ENDPOINTS: { name: string; url: string }[] = [
    { name: 'Auth', url: '/api/v1/auth/health' },
    { name: 'Employee', url: '/api/v1/employees/health' },
    { name: 'Attendance', url: '/api/v1/attendance/health' },
    { name: 'Leave', url: '/api/v1/leave/health' },
    { name: 'Payroll', url: '/api/v1/payroll/health' },
    { name: 'Notification', url: '/api/v1/notifications/health' },
    { name: 'Students', url: '/api/v1/students/health' },
    { name: 'Audit', url: '/api/v1/audit/health' },
]

export function useServiceHealth(pollIntervalMs = 60_000) {
    const services = ref<ServiceStatus[]>(
        SERVICE_ENDPOINTS.map(s => ({ ...s, status: 'checking' as const }))
    )
    const isChecking = ref(false)
    let intervalId: ReturnType<typeof setInterval> | null = null

    const checkAll = async () => {
        isChecking.value = true
        const results = await Promise.allSettled(
            SERVICE_ENDPOINTS.map(async (svc, idx) => {
                const start = Date.now()
                try {
                    await axios.get(svc.url, { timeout: 5000 })
                    services.value[idx] = {
                        ...svc,
                        status: 'healthy',
                        latencyMs: Date.now() - start,
                    }
                } catch {
                    services.value[idx] = {
                        ...svc,
                        status: 'unhealthy',
                        latencyMs: Date.now() - start,
                    }
                }
            })
        )
        isChecking.value = false
    }

    const healthyCount = () => services.value.filter(s => s.status === 'healthy').length
    const unhealthyCount = () => services.value.filter(s => s.status === 'unhealthy').length

    onMounted(() => {
        checkAll()
        intervalId = setInterval(checkAll, pollIntervalMs)
    })

    onUnmounted(() => {
        if (intervalId) clearInterval(intervalId)
    })

    return {
        services,
        isChecking,
        checkAll,
        healthyCount,
        unhealthyCount,
    }
}

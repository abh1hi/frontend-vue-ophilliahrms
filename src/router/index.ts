import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'

// Layouts
import LayoutDashboard from '@/layouts/DashboardLayout.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('@/pages/Login.vue'),
            meta: { requiresAuth: false },
        },
        {
            path: '/',
            component: LayoutDashboard,
            meta: { requiresAuth: true },
            children: [
                {
                    path: '',
                    name: 'dashboard',
                    component: () => import('@/pages/Dashboard.vue'),
                },
                {
                    path: 'employees',
                    name: 'employees',
                    component: () => import('@/pages/Employees.vue'),
                },
                {
                    path: 'departments',
                    name: 'departments',
                    component: () => import('@/pages/Departments.vue'),
                },
                {
                    path: 'attendance',
                    name: 'attendance',
                    component: () => import('@/pages/Attendance.vue'),
                },
                {
                    path: 'leave',
                    name: 'leave',
                    component: () => import('@/pages/LeaveManagement.vue'),
                },
                {
                    path: 'payroll',
                    name: 'payroll',
                    component: () => import('@/pages/Payroll.vue'),
                },
                {
                    path: 'notifications',
                    name: 'notifications',
                    component: () => import('@/pages/Notifications.vue'),
                },
                {
                    path: 'audit-logs',
                    name: 'audit-logs',
                    component: () => import('@/pages/AuditLogs.vue'),
                },
                {
                    path: 'students',
                    name: 'students',
                    component: () => import('@/pages/Students.vue'),
                },
                {
                    path: 'classes',
                    name: 'classes',
                    component: () => import('@/pages/Classes.vue'),
                },
                {
                    path: 'companies',
                    name: 'companies',
                    component: () => import('@/pages/Companies.vue'),
                    meta: { requiresRole: 'super_admin' },
                },
                // Other modules would be nested here
            ],
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: () => import('@/pages/NotFound.vue')
        }
    ],
})

// Global Navigation Guard
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    // Protect routes requiring authentication
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next({ name: 'login', query: { redirect: to.fullPath } })
    } else if (to.name === 'login' && authStore.isAuthenticated) {
        // Prevent logged-in users from seeing the login page
        next({ name: 'dashboard' })
    } else if (to.meta.requiresRole && authStore.userRole !== to.meta.requiresRole) {
        // Role gate: redirect to dashboard if user lacks the required role
        next({ name: 'dashboard' })
    } else {
        next()
    }
})

export default router

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
            path: '/forgot-password',
            name: 'forgot-password',
            component: () => import('@/pages/ForgotPassword.vue'),
            meta: { requiresAuth: false },
        },
        {
            path: '/reset-password',
            name: 'reset-password',
            component: () => import('@/pages/ResetPassword.vue'),
            meta: { requiresAuth: false },
        },
        {
            path: '/verify-magic',
            name: 'verify-magic',
            component: () => import('@/pages/VerifyMagicLink.vue'),
            meta: { requiresAuth: false },
        },
        {
            path: '/create-company',
            name: 'create-company',
            component: () => import('@/pages/CreateCompany.vue'),
            meta: { requiresAuth: true, onboardingRoute: true },
        },
        {
            path: '/select-company',
            name: 'select-company',
            component: () => import('@/pages/SelectCompany.vue'),
            meta: { requiresAuth: true, onboardingRoute: true },
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
                    meta: { title: 'Dashboard', allowedRoles: ['super_admin', 'admin', 'hr'] },
                },
                {
                    path: 'employees',
                    name: 'employees',
                    component: () => import('@/pages/Employees.vue'),
                    meta: { title: 'Employees', allowedRoles: ['super_admin', 'admin', 'hr'] },
                },
                {
                    path: 'departments',
                    name: 'departments',
                    component: () => import('@/pages/Departments.vue'),
                    meta: { title: 'Departments', allowedRoles: ['super_admin', 'admin', 'hr'] },
                },
                {
                    path: 'attendance',
                    name: 'attendance',
                    component: () => import('@/pages/Attendance.vue'),
                    meta: { title: 'Attendance', allowedRoles: ['super_admin', 'admin', 'hr'] },
                },
                {
                    path: 'attendance/geofences',
                    name: 'geofences',
                    component: () => import('@/pages/GeofenceManagement.vue'),
                    meta: { title: 'Geofence Management', allowedRoles: ['super_admin', 'admin', 'hr'] },
                },
                {
                    path: 'attendance/policies',
                    name: 'attendance-policies',
                    component: () => import('@/pages/AttendancePolicies.vue'),
                    meta: { title: 'Attendance Policies', allowedRoles: ['super_admin', 'admin', 'hr'] },
                },
                {
                    path: 'reports/productivity',
                    name: 'productivity-reports',
                    component: () => import('@/pages/ProductivityReports.vue'),
                    meta: { title: 'Productivity Reports', allowedRoles: ['super_admin', 'admin', 'hr'] },
                },
                {
                    path: 'leave',
                    name: 'leave',
                    component: () => import('@/pages/LeaveManagement.vue'),
                    meta: { title: 'Leave Management', allowedRoles: ['super_admin', 'admin', 'hr'] },
                },
                {
                    path: 'holidays',
                    name: 'holidays',
                    component: () => import('@/pages/Holidays.vue'),
                    meta: { title: 'Holidays', allowedRoles: ['super_admin', 'admin', 'hr'] },
                },
                {
                    path: 'payroll',
                    name: 'payroll',
                    component: () => import('@/pages/Payroll.vue'),
                    meta: { title: 'Payroll', allowedRoles: ['super_admin', 'admin', 'hr'] },
                },
                {
                    path: 'notifications',
                    name: 'notifications',
                    component: () => import('@/pages/Notifications.vue'),
                    meta: { title: 'Notifications', allowedRoles: ['super_admin', 'admin'] },
                },
                {
                    path: 'audit-logs',
                    name: 'audit-logs',
                    component: () => import('@/pages/AuditLogs.vue'),
                    meta: { title: 'Audit Logs', allowedRoles: ['super_admin', 'admin'] },
                },
                {
                    path: 'students',
                    name: 'students',
                    component: () => import('@/pages/Students.vue'),
                    meta: { title: 'Students', allowedRoles: ['super_admin', 'admin', 'hr'] },
                },
                {
                    path: 'classes',
                    name: 'classes',
                    component: () => import('@/pages/Classes.vue'),
                    meta: { title: 'Classes', allowedRoles: ['super_admin', 'admin', 'hr'] },
                },
                {
                    path: 'profile',
                    name: 'profile',
                    component: () => import('@/pages/MyProfile.vue'),
                    meta: { title: 'My Profile' },
                },
                {
                    path: 'users',
                    name: 'users',
                    component: () => import('@/pages/UserManagement.vue'),
                    meta: { title: 'User Management', allowedRoles: ['super_admin'] },
                },
                {
                    path: 'notification-preferences',
                    name: 'notification-preferences',
                    component: () => import('@/pages/NotificationPreferences.vue'),
                    meta: { title: 'Notification Preferences' },
                },
                {
                    path: 'companies',
                    name: 'companies',
                    component: () => import('@/pages/Companies.vue'),
                    meta: { title: 'Companies', allowedRoles: ['super_admin'] },
                },
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
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()

    // Protect routes requiring authentication
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return next({ name: 'login', query: { redirect: to.fullPath } })
    }

    if (to.name === 'login' && authStore.isAuthenticated) {
        return next({ name: 'dashboard' })
    }

    // Guard onboarding routes: only allow if backend says so
    if (to.meta.onboardingRoute && authStore.isAuthenticated) {
        try {
            const context = authStore.postLoginContext ?? await authStore.fetchPostLoginContext()
            if (to.name === 'create-company' && context.next_action !== 'CREATE_COMPANY') {
                return next({ name: 'dashboard' })
            }
            if (to.name === 'select-company' && context.next_action !== 'SELECT_COMPANY') {
                return next({ name: 'dashboard' })
            }
        } catch {
            return next({ name: 'dashboard' })
        }
    }

    // Role-based access control
    const allowedRoles = to.meta.allowedRoles as string[] | undefined
    if (allowedRoles && authStore.userRole && !allowedRoles.includes(authStore.userRole)) {
        return next({ name: 'dashboard' })
    }

    next()
})

export default router

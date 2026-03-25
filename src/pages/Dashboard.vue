<template>
  <div class="w-100">
    <!-- Page Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Dashboard</h1>
        <p class="text-body-2 text-medium-emphasis mt-1">Welcome back, {{ authStore.user?.name || 'Admin' }}. Here's your overview.</p>
      </div>
      <div class="d-flex ga-2">
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-download" rounded="lg" class="text-none">
          Export Report
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-plus" rounded="lg" class="text-none" to="/employees">
          Add Employee
        </v-btn>
      </div>
    </div>

    <!-- Onboarding Checklist -->
    <OnboardingChecklist />

    <!-- KPI Cards -->
    <v-row>
      <v-col cols="12" sm="6" lg="3">
        <v-card class="kpi-card" to="/employees">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold tracking-wide">Total Employees</div>
                <div class="text-h4 font-weight-black mt-2">{{ employeeStore.totalEmployees }}</div>
                <div class="text-caption text-success mt-1">
                  <v-icon size="12" color="success">mdi-trending-up</v-icon>
                  Active workforce
                </div>
              </div>
              <v-avatar color="primary" variant="tonal" size="52" rounded="lg">
                <v-icon size="28">mdi-account-group-outline</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card class="kpi-card" to="/departments">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold tracking-wide">Departments</div>
                <div class="text-h4 font-weight-black mt-2">{{ departmentStore.totalDepartments }}</div>
                <div class="text-caption text-info mt-1">
                  <v-icon size="12" color="info">mdi-office-building</v-icon>
                  Organizational units
                </div>
              </div>
              <v-avatar color="info" variant="tonal" size="52" rounded="lg">
                <v-icon size="28">mdi-office-building-outline</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card class="kpi-card" to="/leave">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold tracking-wide">On Leave Today</div>
                <div class="text-h4 font-weight-black mt-2">{{ approvedLeaves }}</div>
                <div class="text-caption text-warning mt-1">
                  <v-icon size="12" color="warning">mdi-calendar-clock</v-icon>
                  {{ pendingLeaves }} pending requests
                </div>
              </div>
              <v-avatar color="warning" variant="tonal" size="52" rounded="lg">
                <v-icon size="28">mdi-calendar-remove-outline</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="3">
        <v-card class="kpi-card" to="/students">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold tracking-wide">Total Students</div>
                <div class="text-h4 font-weight-black mt-2">{{ studentStore.totalStudents }}</div>
                <div class="text-caption text-secondary mt-1">
                  <v-icon size="12" color="secondary">mdi-school</v-icon>
                  Enrolled students
                </div>
              </div>
              <v-avatar color="secondary" variant="tonal" size="52" rounded="lg">
                <v-icon size="28">mdi-school-outline</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Content Area -->
    <v-row class="mt-2">
      <!-- Quick Actions -->
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="d-flex align-center pa-5 pb-3">
            <v-icon start color="primary" size="20">mdi-lightning-bolt</v-icon>
            <span class="text-subtitle-1 font-weight-bold">Quick Actions</span>
          </v-card-title>
          <v-card-text class="pa-5 pt-0">
            <v-row>
              <v-col cols="6" sm="4" md="3" v-for="action in visibleQuickActions" :key="action.title">
                <v-card
                  variant="tonal"
                  :color="action.color"
                  class="text-center pa-4 quick-action-card"
                  :to="action.to"
                  rounded="lg"
                >
                  <v-icon :color="action.color" size="28" class="mb-2">{{ action.icon }}</v-icon>
                  <div class="text-caption font-weight-medium">{{ action.title }}</div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- System Status (Admin/SuperAdmin) -->
      <v-col cols="12" md="4">
        <v-card class="h-100">
          <v-card-title class="d-flex align-center pa-5 pb-3">
            <v-icon start color="primary" size="20">mdi-information-outline</v-icon>
            <span class="text-subtitle-1 font-weight-bold">System Status</span>
            <v-spacer />
            <v-btn icon="mdi-refresh" variant="text" size="x-small" :loading="healthCheck.isChecking.value" @click="healthCheck.checkAll" />
          </v-card-title>
          <v-card-text class="pa-5 pt-0">
            <v-list density="compact" class="pa-0">
              <!-- Service health summary -->
              <v-list-item class="px-0">
                <template #prepend>
                  <v-avatar :color="healthCheck.unhealthyCount() === 0 ? 'success' : 'error'" variant="tonal" size="32" rounded="lg" class="mr-3">
                    <v-icon size="18">{{ healthCheck.unhealthyCount() === 0 ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="text-body-2">
                  {{ healthCheck.unhealthyCount() === 0 ? 'All services operational' : `${healthCheck.unhealthyCount()} service(s) down` }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ healthCheck.healthyCount() }}/{{ healthCheck.services.value.length }} healthy
                </v-list-item-subtitle>
              </v-list-item>

              <!-- Per-service indicators -->
              <div class="d-flex flex-wrap ga-1 mt-2 mb-3">
                <v-tooltip v-for="svc in healthCheck.services.value" :key="svc.name" :text="`${svc.name}: ${svc.status}${svc.latencyMs ? ' (' + svc.latencyMs + 'ms)' : ''}`" location="top">
                  <template #activator="{ props }">
                    <v-chip
                      v-bind="props"
                      :color="svc.status === 'healthy' ? 'success' : svc.status === 'checking' ? 'grey' : 'error'"
                      size="x-small"
                      variant="tonal"
                      label
                    >
                      {{ svc.name }}
                    </v-chip>
                  </template>
                </v-tooltip>
              </div>

              <v-list-item class="px-0">
                <template #prepend>
                  <v-avatar :color="failedNotifications > 0 ? 'error' : 'success'" variant="tonal" size="32" rounded="lg" class="mr-3">
                    <v-icon size="18">{{ failedNotifications > 0 ? 'mdi-alert-circle' : 'mdi-check-circle' }}</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="text-body-2">Notifications</v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{ failedNotifications }} failed deliveries</v-list-item-subtitle>
              </v-list-item>

              <v-list-item class="px-0">
                <template #prepend>
                  <v-avatar color="info" variant="tonal" size="32" rounded="lg" class="mr-3">
                    <v-icon size="18">mdi-clock-outline</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="text-body-2">Last audit entry</v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{ lastAuditTime }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Activity -->
    <v-row class="mt-2">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between pa-5 pb-3">
            <div class="d-flex align-center">
              <v-icon start color="primary" size="20">mdi-clipboard-text-clock-outline</v-icon>
              <span class="text-subtitle-1 font-weight-bold">Recent Audit Activity</span>
            </div>
            <v-btn variant="text" size="small" color="primary" to="/audit-logs" class="text-none" v-if="isAdminOrAbove">
              View All
            </v-btn>
          </v-card-title>
          <v-card-text class="pa-5 pt-0">
            <v-list density="compact" class="pa-0">
              <v-list-item
                v-for="log in systemStore.auditLogs.slice(0, 5)"
                :key="log.id"
                class="px-0"
                rounded="lg"
              >
                <template #prepend>
                  <v-avatar color="primary" variant="tonal" size="32" rounded="lg" class="mr-3">
                    <v-icon size="16">mdi-circle-medium</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="text-body-2">{{ log.event_type }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{ log.service_source }} &mdash; {{ new Date(log.timestamp).toLocaleString() }}</v-list-item-subtitle>
              </v-list-item>
              <v-alert v-if="systemStore.auditLogs.length === 0" type="info" variant="tonal" density="compact">
                No recent activity found.
              </v-alert>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Pending Leave Requests (HR view) -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between pa-5 pb-3">
            <div class="d-flex align-center">
              <v-icon start color="warning" size="20">mdi-calendar-clock</v-icon>
              <span class="text-subtitle-1 font-weight-bold">Pending Leave Requests</span>
            </div>
            <v-btn variant="text" size="small" color="primary" to="/leave" class="text-none">
              View All
            </v-btn>
          </v-card-title>
          <v-card-text class="pa-5 pt-0">
            <v-list density="compact" class="pa-0">
              <v-list-item
                v-for="req in pendingLeaveRequests.slice(0, 5)"
                :key="req.id"
                class="px-0"
                rounded="lg"
              >
                <template #prepend>
                  <v-avatar color="warning" variant="tonal" size="32" rounded="lg" class="mr-3">
                    <v-icon size="16">mdi-account-clock</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="text-body-2">{{ req.leave_type?.name || 'Leave Request' }}</v-list-item-title>
                <v-list-item-subtitle class="text-caption">{{ req.start_date }} to {{ req.end_date }} ({{ req.total_days }} days)</v-list-item-subtitle>
                <template #append>
                  <v-chip size="x-small" color="warning" variant="tonal">Pending</v-chip>
                </template>
              </v-list-item>
              <v-alert v-if="pendingLeaveRequests.length === 0" type="info" variant="tonal" density="compact">
                No pending leave requests.
              </v-alert>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAuthStore } from '@/store/auth.store'
import { useEmployeeStore } from '@/store/employee.store'
import { useDepartmentStore } from '@/store/department.store'
import { useLeaveStore } from '@/store/leave.store'
import { useSystemStore } from '@/store/system.store'
import { useStudentStore } from '@/store/student.store'
import { useServiceHealth } from '@/composables/useServiceHealth'
import OnboardingChecklist from '@/components/common/OnboardingChecklist.vue'

const authStore = useAuthStore()
const employeeStore = useEmployeeStore()
const departmentStore = useDepartmentStore()
const leaveStore = useLeaveStore()
const systemStore = useSystemStore()
const studentStore = useStudentStore()
const healthCheck = useServiceHealth()

const isAdminOrAbove = computed(() =>
  ['super_admin', 'admin'].includes(authStore.userRole || '')
)

const approvedLeaves = computed(() =>
  leaveStore.leaveRequests.filter(r => r.status === 'APPROVED').length
)

const pendingLeaves = computed(() =>
  leaveStore.leaveRequests.filter(r => r.status === 'PENDING').length
)

const pendingLeaveRequests = computed(() =>
  leaveStore.leaveRequests.filter(r => r.status === 'PENDING')
)

const failedNotifications = computed(() =>
  systemStore.notificationLogs.filter(l => l.status === 'FAILED').length
)

const lastAuditTime = computed(() => {
  if (systemStore.auditLogs.length === 0) return 'No data'
  return new Date(systemStore.auditLogs[0].timestamp).toLocaleString()
})

interface QuickAction {
  title: string
  icon: string
  color: string
  to: string
  roles: string[] | null
}

const allQuickActions: QuickAction[] = [
  { title: 'Employees', icon: 'mdi-account-group-outline', color: 'primary', to: '/employees', roles: null },
  { title: 'Departments', icon: 'mdi-office-building-outline', color: 'info', to: '/departments', roles: null },
  { title: 'Attendance', icon: 'mdi-clock-check-outline', color: 'success', to: '/attendance', roles: null },
  { title: 'Leave', icon: 'mdi-calendar-remove-outline', color: 'warning', to: '/leave', roles: null },
  { title: 'Payroll', icon: 'mdi-cash-multiple', color: 'secondary', to: '/payroll', roles: null },
  { title: 'Students', icon: 'mdi-school-outline', color: 'accent', to: '/students', roles: null },
  { title: 'Audit Logs', icon: 'mdi-clipboard-text-clock', color: 'error', to: '/audit-logs', roles: ['super_admin', 'admin'] },
  { title: 'Companies', icon: 'mdi-domain', color: 'primary', to: '/companies', roles: ['super_admin'] },
]

const visibleQuickActions = computed(() =>
  allQuickActions.filter(a =>
    a.roles === null || (authStore.userRole && a.roles.includes(authStore.userRole))
  )
)

onMounted(() => {
  employeeStore.fetchEmployees({ pageSize: 1 })
  departmentStore.fetchDepartments()
  leaveStore.fetchLeaveRequests()
  systemStore.fetchAuditLogs({ limit: 5 })
  systemStore.fetchNotificationLogs()
  studentStore.fetchStudents({ pageSize: 1 })
  studentStore.fetchClasses()
})
</script>

<style scoped>
.kpi-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08) !important;
}

.quick-action-card {
  cursor: pointer;
  transition: transform 0.15s ease;
}

.quick-action-card:hover {
  transform: scale(1.03);
}

.tracking-wide {
  letter-spacing: 0.05em;
}
</style>

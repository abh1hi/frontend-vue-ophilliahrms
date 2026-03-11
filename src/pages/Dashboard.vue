<template>
  <div class="w-100">
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4 font-weight-bold text-grey-darken-3">HR Dashboard Overview</h1>
      <div class="d-flex ga-2">
        <v-btn color="primary" prepend-icon="mdi-account-group" to="/employees">
          Manage Employees
        </v-btn>
        <v-btn color="secondary" prepend-icon="mdi-office-building" to="/departments">
          Manage Departments
        </v-btn>
        <v-btn color="teal" prepend-icon="mdi-school" to="/students">
          Manage Students
        </v-btn>
      </div>
    </div>

    <!-- Overview Cards -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card class="elevation-2" rounded="lg" to="/employees">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey text-uppercase font-weight-bold mb-1">Total Employees</div>
                <div class="text-h4 font-weight-black">{{ employeeStore.totalEmployees }}</div>
              </div>
              <v-avatar color="primary-lighten-4" size="48">
                <v-icon color="primary" size="28">mdi-account-group</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="elevation-2" rounded="lg" to="/departments">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey text-uppercase font-weight-bold mb-1">Departments</div>
                <div class="text-h4 font-weight-black text-secondary">{{ departmentStore.totalDepartments }}</div>
              </div>
              <v-avatar color="secondary-lighten-4" size="48">
                <v-icon color="secondary" size="28">mdi-office-building</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="elevation-2" rounded="lg">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey text-uppercase font-weight-bold mb-1">On Leave Today</div>
                <div class="text-h4 font-weight-black text-warning">{{ leaveStore.leaveRequests.filter(r => r.status === 'APPROVED').length }}</div>
              </div>
              <v-avatar color="warning-lighten-4" size="48">
                <v-icon color="warning" size="28">mdi-calendar-remove</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="elevation-2" rounded="lg" to="/notifications">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey text-uppercase font-weight-bold mb-1">System Alerts</div>
                <div class="text-h4 font-weight-black text-info">{{ systemStore.notificationLogs.filter(l => l.status === 'FAILED').length }}</div>
              </div>
              <v-avatar color="info-lighten-4" size="48">
                <v-icon color="info" size="28">mdi-bell-alert-outline</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row class="mt-4">
      <v-col cols="12" sm="6" md="3">
         <v-card class="elevation-2" rounded="lg" to="/students">
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-grey text-uppercase font-weight-bold mb-1">Total Students</div>
                <div class="text-h4 font-weight-black text-teal">{{ studentStore.totalStudents }}</div>
              </div>
              <v-avatar color="teal-lighten-4" size="48">
                <v-icon color="teal" size="28">mdi-school</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card class="elevation-2" rounded="lg">
          <v-card-title>Recent Audit Activity</v-card-title>
          <v-card-text>
            <v-list density="compact">
                <v-list-item 
                    v-for="log in systemStore.auditLogs.slice(0, 5)" 
                    :key="log.id"
                    :title="log.event_type"
                    :subtitle="`${log.service_source} - ${new Date(log.timestamp).toLocaleString()}`"
                >
                    <template #prepend>
                        <v-icon size="small" color="primary">mdi-circle-medium</v-icon>
                    </template>
                </v-list-item>
                <v-list-item v-if="systemStore.auditLogs.length === 0">
                    <v-alert type="info" variant="tonal">No recent activity found.</v-alert>
                </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useEmployeeStore } from '@/store/employee.store'
import { useDepartmentStore } from '@/store/department.store'
import { useLeaveStore } from '@/store/leave.store'
import { useSystemStore } from '@/store/system.store'
import { useStudentStore } from '@/store/student.store'

const employeeStore = useEmployeeStore()
const departmentStore = useDepartmentStore()
const leaveStore = useLeaveStore()
const systemStore = useSystemStore()
const studentStore = useStudentStore()

onMounted(() => {
  employeeStore.fetchEmployees({ pageSize: 1 }) // Just to get total count
  departmentStore.fetchDepartments()
  leaveStore.fetchLeaveRequests()
  systemStore.fetchAuditLogs({ limit: 5 })
  systemStore.fetchNotificationLogs()
  studentStore.fetchStudents({ pageSize: 1 })
  studentStore.fetchClasses()
})
</script>

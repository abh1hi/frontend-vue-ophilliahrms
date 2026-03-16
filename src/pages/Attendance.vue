<template>
  <v-container fluid class="pa-6">

    <!-- ── Alerts banner ── -->
    <v-row v-if="alerts" class="mb-4">
      <v-col cols="12" md="4">
        <v-card rounded="lg" color="warning-lighten-4" border="warning md" elevation="0">
          <v-card-text class="d-flex align-center gap-3 pa-4">
            <v-icon color="warning" size="32">mdi-clock-alert-outline</v-icon>
            <div>
              <p class="text-h5 font-weight-black text-warning">{{ alerts.late_count }}</p>
              <p class="text-caption text-medium-emphasis">Late punch-ins today</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card rounded="lg" color="error-lighten-4" border="error md" elevation="0">
          <v-card-text class="d-flex align-center gap-3 pa-4">
            <v-icon color="error" size="32">mdi-logout-variant</v-icon>
            <div>
              <p class="text-h5 font-weight-black text-error">{{ alerts.missed_punch_out_count }}</p>
              <p class="text-caption text-medium-emphasis">Missed punch-outs today</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card rounded="lg" color="success-lighten-4" border="success md" elevation="0">
          <v-card-text class="d-flex align-center gap-3 pa-4">
            <v-icon color="success" size="32">mdi-account-check-outline</v-icon>
            <div>
              <p class="text-h5 font-weight-black text-success">{{ presentToday }}</p>
              <p class="text-caption text-medium-emphasis">Present today</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ── Missed punch-out detail (collapsible) ── -->
    <v-expand-transition>
      <v-card v-if="alerts?.missed_punch_outs?.length" class="mb-4" rounded="lg" border="error sm" elevation="0">
        <v-card-title class="text-subtitle-2 pa-4 pb-2 d-flex align-center">
          <v-icon color="error" class="mr-2">mdi-alert-circle-outline</v-icon>
          Employees who haven't punched out
          <v-spacer />
          <v-btn variant="text" size="small" :icon="showMissed ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            @click="showMissed = !showMissed" />
        </v-card-title>
        <v-expand-transition>
          <v-list v-if="showMissed" density="compact" class="pt-0">
            <v-list-item v-for="m in alerts.missed_punch_outs" :key="m.record_id"
              :subtitle="formatTime(m.clock_in) + (m.clock_in_location_name ? ' · ' + m.clock_in_location_name : '')">
              <template #prepend>
                <v-avatar color="error" variant="tonal" size="32">
                  <v-icon size="18">mdi-account-clock-outline</v-icon>
                </v-avatar>
              </template>
              <template #title>
                {{ getEmployeeName(m.employee_id) }}
              </template>
            </v-list-item>
          </v-list>
        </v-expand-transition>
      </v-card>
    </v-expand-transition>

    <v-row class="mb-6">
      <!-- ── Daily punch card ── -->
      <v-col cols="12" md="4">
        <v-card rounded="lg" class="elevation-2 fill-height">
          <v-card-text class="pa-6 d-flex flex-column align-center justify-center text-center">
            <h2 class="text-h5 font-weight-bold mb-2">Daily Attendance</h2>
            <p class="text-body-2 text-grey mb-6">{{ formatCurrentDate() }}</p>

            <div v-if="attendanceStore.todayRecord" class="w-100">
              <v-chip color="success" size="large" label class="mb-2 d-block">
                Clocked In: {{ formatTime(attendanceStore.todayRecord.clock_in) }}
              </v-chip>
              <p v-if="attendanceStore.todayRecord.clock_in_location_name" class="text-caption text-medium-emphasis mb-2">
                📍 {{ attendanceStore.todayRecord.clock_in_location_name }}
              </p>
              <div v-if="attendanceStore.todayRecord.clock_out">
                <v-chip color="info" size="large" label class="mb-2 d-block">
                  Clocked Out: {{ formatTime(attendanceStore.todayRecord.clock_out) }}
                </v-chip>
                <p v-if="attendanceStore.todayRecord.clock_out_location_name" class="text-caption text-medium-emphasis mb-2">
                  🏁 {{ attendanceStore.todayRecord.clock_out_location_name }}
                </p>
                <p class="text-subtitle-1 font-weight-bold">
                  Work Duration: {{ attendanceStore.todayRecord.work_hours?.toFixed(2) }} hrs
                </p>
                <div v-if="attendanceStore.todayRecord.day_rating" class="mt-2">
                  <span class="text-warning">{{ '⭐'.repeat(attendanceStore.todayRecord.day_rating) }}</span>
                  <span class="text-caption text-medium-emphasis ml-1">{{ ratingLabel(attendanceStore.todayRecord.day_rating) }}</span>
                </div>
              </div>
              <v-btn
                v-else
                color="error"
                size="x-large"
                block
                prepend-icon="mdi-clock-out"
                class="mt-4"
                :loading="attendanceStore.isLoading"
                @click="onClockOut"
              >
                Clock Out
              </v-btn>
            </div>

            <div v-else>
              <v-btn
                color="primary"
                size="x-large"
                block
                prepend-icon="mdi-clock-in"
                :loading="attendanceStore.isLoading"
                @click="onClockIn"
              >
                Clock In Now
              </v-btn>
              <p class="text-caption text-grey mt-4">Remember to clock in before starting work.</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- ── Attendance table ── -->
      <v-col cols="12" md="8">
        <DataTable
          title="Attendance History"
          :headers="headers"
          :items="attendanceStore.records"
          :total-items="attendanceStore.totalRecords"
          :loading="attendanceStore.isLoading"
          @update:options="onOptionsUpdate"
        >
          <template #item.employee_id="{ item }">
            {{ getEmployeeName(item.employee_id) }}
          </template>

          <template #item.clock_in="{ item }">
            <div>
              <span>{{ formatDateTime(item.clock_in) }}</span>
              <div v-if="item.clock_in_location_name" class="text-caption text-medium-emphasis">📍 {{ item.clock_in_location_name }}</div>
            </div>
          </template>

          <template #item.clock_out="{ item }">
            <div v-if="item.clock_out">
              <span>{{ formatDateTime(item.clock_out) }}</span>
              <div v-if="item.clock_out_location_name" class="text-caption text-medium-emphasis">🏁 {{ item.clock_out_location_name }}</div>
            </div>
            <v-chip v-else color="error" size="x-small" variant="tonal">Not out</v-chip>
          </template>

          <template #item.status="{ item }">
            <v-chip :color="getStatusColor(item.status)" size="small" label class="text-uppercase font-weight-bold">
              {{ item.status }}
            </v-chip>
          </template>

          <template #item.day_rating="{ item }">
            <span v-if="item.day_rating" class="text-warning">{{ '⭐'.repeat(item.day_rating) }}</span>
            <span v-else class="text-medium-emphasis">–</span>
          </template>

          <template #item.tasks="{ item }">
            <v-btn
              v-if="item.tasks?.length"
              variant="tonal"
              color="primary"
              size="x-small"
              rounded="xl"
              @click="openTaskDetail(item)"
            >
              {{ item.tasks.length }} task{{ item.tasks.length > 1 ? 's' : '' }}
            </v-btn>
            <span v-else class="text-medium-emphasis text-caption">–</span>
          </template>
        </DataTable>
      </v-col>
    </v-row>

    <!-- ── Task detail dialog ── -->
    <v-dialog v-model="taskDialog" max-width="560">
      <v-card rounded="lg">
        <v-card-title class="pa-4 d-flex align-center">
          <v-icon class="mr-2" color="primary">mdi-format-list-checks</v-icon>
          Tasks — {{ getEmployeeName(selectedRecord?.employee_id) }}
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" @click="taskDialog = false" />
        </v-card-title>
        <v-divider />
        <v-list density="compact" class="pa-2">
          <v-list-item v-for="t in selectedRecord?.tasks" :key="t.id" class="mb-1 rounded-lg" border>
            <template #prepend>
              <v-icon :color="taskStatusColor(t.status)" size="18" class="mr-2">{{ taskStatusIcon(t.status) }}</v-icon>
            </template>
            <v-list-item-title class="text-body-2 font-weight-medium">{{ t.title }}</v-list-item-title>
            <v-list-item-subtitle class="text-caption">
              <span v-if="t.estimated_finish_time">⏰ {{ t.estimated_finish_time }}</span>
              <span v-if="t.completion_notes" class="ml-2">📝 {{ t.completion_notes }}</span>
            </v-list-item-subtitle>
            <template #append>
              <div class="text-right">
                <v-chip :color="taskStatusColor(t.status)" size="x-small" variant="tonal" class="mb-1 d-block">{{ taskStatusLabel(t.status) }}</v-chip>
                <span v-if="t.actual_expenses" class="text-caption text-success">₹{{ t.actual_expenses }}</span>
              </div>
            </template>
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import { useAttendanceStore } from '@/store/attendance.store'
import { useEmployeeStore } from '@/store/employee.store'

const attendanceStore = useAttendanceStore()
const employeeStore = useEmployeeStore()

// Alerts
const alerts = ref<any>(null)
const showMissed = ref(false)

// Task dialog
const taskDialog = ref(false)
const selectedRecord = ref<any>(null)

const headers = [
  { title: 'Date', key: 'date', align: 'start' },
  { title: 'Employee', key: 'employee_id' },
  { title: 'Clock In', key: 'clock_in' },
  { title: 'Clock Out', key: 'clock_out' },
  { title: 'Status', key: 'status' },
  { title: 'Work Hrs', key: 'work_hours' },
  { title: 'Rating', key: 'day_rating' },
  { title: 'Tasks', key: 'tasks', sortable: false },
]

const presentToday = computed(() =>
  attendanceStore.records.filter((r: any) =>
    r.date === new Date().toISOString().slice(0, 10) &&
    ['present', 'late'].includes(r.status)
  ).length
)

onMounted(async () => {
  attendanceStore.fetchTodayRecord()
  attendanceStore.fetchAttendance()
  if (employeeStore.employees.length === 0) {
    employeeStore.fetchEmployees({ pageSize: 100 })
  }
  try {
    const token = localStorage.getItem('access_token') ?? ''
    const apiBase = (import.meta.env.VITE_API_URL ?? '') + '/api/v1'
    const res = await fetch(`${apiBase}/attendance/alerts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const body = await res.json()
      alerts.value = body?.data ?? body
    }
  } catch { /* alerts optional */ }
})

const onOptionsUpdate = (options: any) => {
  attendanceStore.fetchAttendance({ page: options.page, pageSize: options.itemsPerPage })
}

const onClockIn = async () => {
  await attendanceStore.clockIn({ notes: 'Web clock-in' })
}

const onClockOut = async () => {
  await attendanceStore.clockOut({ notes: 'Web clock-out' })
}

const getEmployeeName = (id: string) => {
  const emp = employeeStore.employees.find((e: any) => e.id === id)
  return emp ? `${emp.first_name} ${emp.last_name}` : id
}

function openTaskDetail(item: any) {
  selectedRecord.value = item
  taskDialog.value = true
}

const formatCurrentDate = () =>
  new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())

const formatTime = (dt: string) =>
  new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date(dt))

const formatDateTime = (dt: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dt))

const getStatusColor = (status: string) => {
  switch (status) {
    case 'present': return 'success'
    case 'late': return 'warning'
    case 'half_day': return 'info'
    case 'absent': return 'error'
    default: return 'grey'
  }
}

const ratingLabel = (n: number) =>
  ['', 'Very Poor', 'Poor', 'Average', 'Good', 'Excellent'][n] ?? ''

const taskStatusColor = (s: string) =>
  ({ pending: 'warning', completed: 'success', partially_completed: 'primary', not_completed: 'error' }[s] ?? 'default')

const taskStatusIcon = (s: string) =>
  ({ pending: 'mdi-circle-outline', completed: 'mdi-check-circle', partially_completed: 'mdi-circle-half-full', not_completed: 'mdi-close-circle' }[s] ?? 'mdi-circle')

const taskStatusLabel = (s: string) =>
  ({ pending: 'Pending', completed: 'Done', partially_completed: 'Partial', not_completed: 'Not Done' }[s] ?? s)
</script>

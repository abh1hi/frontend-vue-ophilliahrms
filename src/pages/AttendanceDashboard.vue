<template>
  <v-container fluid class="pa-4 pa-md-6">
    <PageHeader title="Attendance Dashboard" subtitle="Real-time KPIs, analytics, alerts, and employee drill-down">
      <template #actions>
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-download" class="text-none" @click="handleExport">
          Export CSV
        </v-btn>
      </template>
    </PageHeader>

    <!-- ═══════ KPI CARDS ROW ═══════ -->
    <v-row dense class="mb-5">
      <v-col cols="6" md="2" v-for="kpi in kpiCards" :key="kpi.label">
        <StatCard :title="kpi.label" :value="kpi.value" :subtitle="kpi.subtitle" :icon="kpi.icon" :icon-color="kpi.color" />
      </v-col>
    </v-row>

    <!-- ═══════ ALERTS PANEL ═══════ -->
    <v-expand-transition>
      <v-card v-if="hasAlerts" class="mb-5" rounded="lg" border elevation="0">
        <v-card-title class="text-subtitle-2 pa-4 pb-2 d-flex align-center">
          <v-icon color="warning" class="mr-2">mdi-alert-circle-outline</v-icon>
          Attention Required
          <v-spacer />
          <v-btn variant="text" size="small" :icon="showAlertDetails ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="showAlertDetails = !showAlertDetails" />
        </v-card-title>
        <v-expand-transition>
          <div v-if="showAlertDetails" class="px-4 pb-4">
            <v-row dense>
              <v-col v-if="store.alerts?.late_count > 0" cols="12" md="6">
                <v-chip color="warning" variant="flat" size="small" class="mr-2">
                  {{ store.alerts.late_count }} Late Arrivals Today
                </v-chip>
              </v-col>
              <v-col v-if="store.alerts?.missed_punch_out_count > 0" cols="12" md="6">
                <v-chip color="error" variant="flat" size="small" class="mr-2">
                  {{ store.alerts.missed_punch_out_count }} Missed Punch-outs
                </v-chip>
                <v-list density="compact" class="mt-2 pa-0">
                  <v-list-item v-for="m in store.alerts.missed_punch_outs" :key="m.record_id" :subtitle="formatTime(m.clock_in)">
                    <template #prepend>
                      <v-avatar color="error" variant="tonal" size="28"><v-icon size="16">mdi-account-clock</v-icon></v-avatar>
                    </template>
                    <template #title>{{ getEmployeeName(m.employee_id) }}</template>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </div>
        </v-expand-transition>
      </v-card>
    </v-expand-transition>

    <!-- ═══════ CHARTS SECTION ═══════ -->
    <v-row class="mb-5">
      <!-- Attendance Trend -->
      <v-col cols="12" md="7">
        <v-card rounded="lg" border elevation="0">
          <v-card-title class="text-subtitle-2 pa-4 pb-2 d-flex align-center">
            <v-icon color="primary" class="mr-2" size="20">mdi-chart-line</v-icon>
            Attendance Trend
            <v-spacer />
            <v-btn-toggle v-model="trendDays" density="compact" color="primary" mandatory variant="outlined">
              <v-btn :value="7" size="x-small">7d</v-btn>
              <v-btn :value="14" size="x-small">14d</v-btn>
              <v-btn :value="30" size="x-small">30d</v-btn>
            </v-btn-toggle>
          </v-card-title>
          <v-card-text>
            <div v-if="store.attendanceTrend.length" class="trend-container">
              <div v-for="item in store.attendanceTrend" :key="item.date" class="trend-row">
                <span class="trend-date text-caption">{{ formatShortDate(item.date) }}</span>
                <div class="trend-bars">
                  <div class="bar bg-success" :style="{ width: barWidth(item.present) }" :title="`Present: ${item.present}`"></div>
                  <div class="bar bg-warning" :style="{ width: barWidth(item.late) }" :title="`Late: ${item.late}`"></div>
                  <div class="bar bg-info" :style="{ width: barWidth(item.half_day) }" :title="`Half Day: ${item.half_day}`"></div>
                  <div class="bar bg-error" :style="{ width: barWidth(item.absent) }" :title="`Absent: ${item.absent}`"></div>
                </div>
                <span class="trend-hours text-caption text-medium-emphasis">{{ item.avg_hours ? item.avg_hours + 'h' : '-' }}</span>
              </div>
            </div>
            <EmptyState v-else icon="mdi-chart-line" message="No trend data available" />
            <div class="d-flex ga-4 mt-3 flex-wrap">
              <div v-for="l in trendLegend" :key="l.label" class="d-flex align-center">
                <div :class="'legend-dot bg-' + l.vuetifyColor"></div>
                <span class="text-caption ml-1">{{ l.label }}</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right column: Status breakdown + Performers -->
      <v-col cols="12" md="5">
        <!-- Status Breakdown -->
        <v-card rounded="lg" border elevation="0" class="mb-4">
          <v-card-title class="text-subtitle-2 pa-4 pb-2 d-flex align-center">
            <v-icon color="primary" class="mr-2" size="20">mdi-chart-pie</v-icon>
            Today's Status
          </v-card-title>
          <v-card-text>
            <div v-if="store.statusBreakdown" class="status-grid">
              <div v-for="s in statusItems" :key="s.label" class="text-center">
                <div class="status-circle" :style="{ borderColor: s.hex, color: s.hex }">{{ s.value }}</div>
                <div class="text-caption mt-1">{{ s.label }}</div>
              </div>
            </div>
            <EmptyState v-else icon="mdi-chart-pie" message="Loading..." />
          </v-card-text>
        </v-card>

        <!-- Top / Low Performers -->
        <v-card rounded="lg" border elevation="0">
          <v-card-title class="text-subtitle-2 pa-4 pb-2 d-flex align-center">
            <v-icon color="primary" class="mr-2" size="20">mdi-trophy</v-icon>
            Performers This Month
          </v-card-title>
          <v-card-text v-if="store.performers">
            <div class="text-subtitle-2 text-success mb-1">Top Performers</div>
            <v-list density="compact" class="pa-0">
              <v-list-item v-for="p in store.performers.top_performers" :key="p.employee_id" class="px-0">
                <template #prepend><v-icon color="success" size="16">mdi-arrow-up-bold</v-icon></template>
                <v-list-item-title class="text-body-2">{{ getEmployeeName(p.employee_id) }}</v-list-item-title>
                <template #append>
                  <v-chip size="x-small" color="success" variant="tonal">{{ p.productivity_score?.toFixed(0) ?? '-' }}</v-chip>
                </template>
              </v-list-item>
            </v-list>
            <div class="text-subtitle-2 text-error mt-3 mb-1">Needs Improvement</div>
            <v-list density="compact" class="pa-0">
              <v-list-item v-for="p in store.performers.low_performers" :key="p.employee_id" class="px-0">
                <template #prepend><v-icon color="error" size="16">mdi-arrow-down-bold</v-icon></template>
                <v-list-item-title class="text-body-2">{{ getEmployeeName(p.employee_id) }}</v-list-item-title>
                <template #append>
                  <v-chip size="x-small" color="error" variant="tonal">{{ p.productivity_score?.toFixed(0) ?? '-' }}</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- ═══════ FILTERS + TABLE ═══════ -->
    <v-card rounded="lg" border elevation="0">
      <v-card-title class="text-subtitle-2 pa-4 pb-2 d-flex align-center">
        <v-icon color="primary" class="mr-2" size="20">mdi-table</v-icon>
        Attendance Records
      </v-card-title>
      <v-card-text>
        <!-- Filters -->
        <div class="d-flex align-center flex-wrap ga-2 mb-4">
          <v-text-field v-model="filters.dateFrom" type="date" label="From" density="compact" variant="outlined" hide-details style="max-width:160px" />
          <v-text-field v-model="filters.dateTo" type="date" label="To" density="compact" variant="outlined" hide-details style="max-width:160px" />
          <v-select v-model="filters.status" :items="statusFilterOptions" label="Status" density="compact" variant="outlined" hide-details clearable style="max-width:150px" />
          <v-select v-model="filters.employeeId" :items="employeeSelectOptions" label="Employee" density="compact" variant="outlined" hide-details clearable style="max-width:220px" />
          <v-btn color="primary" variant="flat" size="small" class="text-none" @click="applyFilters">Apply</v-btn>
          <v-btn variant="text" size="small" class="text-none" @click="resetFilters">Reset</v-btn>
        </div>

        <DataTable
          title="Attendance Records"
          :headers="tableHeaders"
          :items="store.records"
          :total-items="store.totalRecords"
          :loading="store.isLoading"
          @update:options="onTableOptions"
        >
          <template #item.employee_id="{ item }">{{ getEmployeeName(item.employee_id) }}</template>
          <template #item.clock_in="{ item }">{{ formatDateTime(item.clock_in) }}</template>
          <template #item.clock_out="{ item }">
            <span v-if="item.clock_out">{{ formatDateTime(item.clock_out) }}</span>
            <v-chip v-else color="error" size="x-small" variant="tonal">Not out</v-chip>
          </template>
          <template #item.status="{ item }">
            <StatusChip :status="item.status" size="small" />
          </template>
          <template #item.day_rating="{ item }">
            <span v-if="item.day_rating">
              <v-icon v-for="i in item.day_rating" :key="i" size="14" color="amber">mdi-star</v-icon>
            </span>
            <span v-else class="text-disabled">-</span>
          </template>
          <template #item.productivity_score="{ item }">
            <v-chip v-if="item.productivity_score != null" size="x-small"
              :color="item.productivity_score >= 70 ? 'success' : item.productivity_score >= 40 ? 'warning' : 'error'"
              variant="tonal">
              {{ item.productivity_score }}
            </v-chip>
            <span v-else class="text-disabled">-</span>
          </template>
          <template #item.tasks="{ item }">{{ item.tasks?.length ?? 0 }}</template>
          <template #item.actions="{ item }">
            <v-btn icon size="small" variant="text" color="primary" @click="openDetail(item)">
              <v-icon size="18">mdi-eye-outline</v-icon>
              <v-tooltip activator="parent" location="top">View Details</v-tooltip>
            </v-btn>
          </template>
        </DataTable>
      </v-card-text>
    </v-card>

    <!-- ═══════ EMPLOYEE DETAIL DRAWER ═══════ -->
    <v-navigation-drawer v-model="detailOpen" location="right" temporary width="440">
      <template v-if="selectedRecord">
        <div class="pa-4">
          <div class="d-flex align-center mb-4">
            <v-icon color="primary" class="mr-2">mdi-account-details</v-icon>
            <span class="text-h6 font-weight-bold">{{ getEmployeeName(selectedRecord.employee_id) }}</span>
            <v-spacer />
            <v-btn icon="mdi-close" variant="text" size="small" @click="detailOpen = false" />
          </div>

          <!-- Timeline -->
          <v-timeline density="compact" side="end" class="mb-4">
            <v-timeline-item dot-color="success" size="small">
              <div class="text-body-2 font-weight-bold">Punch In</div>
              <div class="text-caption">{{ formatDateTime(selectedRecord.clock_in) }}</div>
              <div class="text-caption" v-if="selectedRecord.clock_in_location_name">{{ selectedRecord.clock_in_location_name }}</div>
            </v-timeline-item>
            <v-timeline-item v-for="task in (selectedRecord.tasks || [])" :key="task.id"
              :dot-color="taskDotColor(task.status)" size="x-small">
              <div class="text-body-2">{{ task.title }}</div>
              <div class="text-caption text-medium-emphasis">{{ task.status }}{{ task.completion_notes ? ' — ' + task.completion_notes : '' }}</div>
            </v-timeline-item>
            <v-timeline-item v-if="selectedRecord.clock_out" dot-color="error" size="small">
              <div class="text-body-2 font-weight-bold">Punch Out</div>
              <div class="text-caption">{{ formatDateTime(selectedRecord.clock_out) }}</div>
              <div class="text-caption" v-if="selectedRecord.clock_out_location_name">{{ selectedRecord.clock_out_location_name }}</div>
            </v-timeline-item>
            <v-timeline-item v-else dot-color="grey" size="small">
              <div class="text-body-2 text-disabled">Not yet punched out</div>
            </v-timeline-item>
          </v-timeline>

          <v-divider class="mb-3" />

          <!-- Status Chips -->
          <div class="d-flex flex-wrap ga-2 mb-3">
            <StatusChip :status="selectedRecord.status" size="small" />
            <v-chip size="small" variant="tonal" color="primary">State: {{ selectedRecord.state || 'N/A' }}</v-chip>
            <v-chip v-if="selectedRecord.shift_number && selectedRecord.shift_number > 1" size="small" variant="tonal">Shift #{{ selectedRecord.shift_number }}</v-chip>
          </div>

          <!-- Details List -->
          <v-list density="compact" class="pa-0">
            <v-list-item><v-list-item-title class="text-caption">Work Hours</v-list-item-title><template #append>{{ selectedRecord.work_hours?.toFixed(1) ?? '-' }}h</template></v-list-item>
            <v-list-item><v-list-item-title class="text-caption">Overtime</v-list-item-title><template #append>{{ selectedRecord.overtime_hours ?? 0 }}h</template></v-list-item>
            <v-list-item>
              <v-list-item-title class="text-caption">Day Rating</v-list-item-title>
              <template #append>
                <span v-if="selectedRecord.day_rating"><v-icon v-for="i in selectedRecord.day_rating" :key="i" size="14" color="amber">mdi-star</v-icon></span>
                <span v-else>-</span>
              </template>
            </v-list-item>
            <v-list-item v-if="selectedRecord.rating_comment">
              <v-list-item-title class="text-caption">Rating Comment</v-list-item-title>
              <v-list-item-subtitle>{{ selectedRecord.rating_comment }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title class="text-caption">Productivity Score</v-list-item-title>
              <template #append>
                <v-chip v-if="selectedRecord.productivity_score != null" size="x-small"
                  :color="selectedRecord.productivity_score >= 70 ? 'success' : selectedRecord.productivity_score >= 40 ? 'warning' : 'error'"
                  variant="tonal">{{ selectedRecord.productivity_score }}</v-chip>
                <span v-else>-</span>
              </template>
            </v-list-item>
            <v-list-item v-if="selectedRecord.device_info">
              <v-list-item-title class="text-caption">Device</v-list-item-title>
              <v-list-item-subtitle class="text-truncate">{{ selectedRecord.device_info }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <!-- Tasks -->
          <v-divider class="my-3" />
          <div class="font-weight-bold text-body-2 mb-2">Tasks ({{ selectedRecord.tasks?.length ?? 0 }})</div>
          <v-card v-for="task in (selectedRecord.tasks || [])" :key="task.id" variant="outlined" rounded="lg" class="pa-3 mb-2">
            <div class="d-flex align-center">
              <span class="text-body-2 font-weight-medium">{{ task.title }}</span>
              <v-spacer />
              <v-chip :color="taskDotColor(task.status)" size="x-small" variant="flat">{{ task.status }}</v-chip>
            </div>
            <div v-if="task.description" class="text-caption text-medium-emphasis mt-1">{{ task.description }}</div>
            <div v-if="task.actual_expenses != null" class="text-caption mt-1">Expenses: {{ task.actual_expenses }}</div>
          </v-card>
        </div>
      </template>
    </v-navigation-drawer>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import DataTable from '@/components/common/DataTable.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useAttendanceStore } from '@/store/attendance.store'
import { useEmployeeStore } from '@/store/employee.store'
import type { Attendance } from '@/types/attendance.types'

const store = useAttendanceStore()
const employeeStore = useEmployeeStore()

const trendDays = ref(7)
const showAlertDetails = ref(true)
const detailOpen = ref(false)
const selectedRecord = ref<Attendance | null>(null)

const filters = ref({
  dateFrom: '',
  dateTo: '',
  status: null as string | null,
  employeeId: null as string | null,
})

const statusFilterOptions = [
  { title: 'Present', value: 'present' },
  { title: 'Late', value: 'late' },
  { title: 'Half Day', value: 'half_day' },
  { title: 'Absent', value: 'absent' },
  { title: 'Auto-Closed', value: 'auto_closed' },
]

const employeeSelectOptions = computed(() =>
  employeeStore.employees.map((e: any) => ({
    title: `${e.first_name} ${e.last_name}`,
    value: e.id,
  }))
)

// ─── KPI Cards ───

const kpiCards = computed(() => {
  const k = store.adminKPI
  if (!k) return []
  return [
    { label: 'Present', value: String(k.total_employees_present), subtitle: 'Today', icon: 'mdi-account-check-outline', color: 'success' },
    { label: 'Late', value: String(k.late_checkins), subtitle: 'Today', icon: 'mdi-clock-alert-outline', color: 'warning' },
    { label: 'Absent', value: String(k.absent_employees), subtitle: 'Today', icon: 'mdi-account-remove-outline', color: 'error' },
    { label: 'Missed Punch', value: String(k.missed_punchouts), subtitle: 'Today', icon: 'mdi-logout-variant', color: 'red-darken-2' },
    { label: 'Avg Hours', value: k.avg_working_hours?.toFixed(1) ?? '-', subtitle: 'Today', icon: 'mdi-timer-outline', color: 'info' },
    { label: 'Task Rate', value: k.task_completion_rate ? k.task_completion_rate + '%' : '-', subtitle: 'Completion', icon: 'mdi-check-circle-outline', color: 'primary' },
  ]
})

const hasAlerts = computed(() =>
  store.alerts && (store.alerts.late_count > 0 || store.alerts.missed_punch_out_count > 0)
)

const statusItems = computed(() => {
  const s = store.statusBreakdown
  if (!s) return []
  return [
    { label: 'Present', value: s.present, hex: '#4CAF50' },
    { label: 'Late', value: s.late, hex: '#FF9800' },
    { label: 'Half Day', value: s.half_day, hex: '#2196F3' },
    { label: 'Absent', value: s.absent, hex: '#F44336' },
    { label: 'Auto-Closed', value: s.auto_closed, hex: '#9E9E9E' },
  ]
})

const trendLegend = [
  { label: 'Present', vuetifyColor: 'success' },
  { label: 'Late', vuetifyColor: 'warning' },
  { label: 'Half Day', vuetifyColor: 'info' },
  { label: 'Absent', vuetifyColor: 'error' },
]

// ─── Table ───

const tableHeaders = [
  { title: 'Employee', key: 'employee_id' },
  { title: 'Date', key: 'date', align: 'start' as const },
  { title: 'Clock In', key: 'clock_in' },
  { title: 'Clock Out', key: 'clock_out' },
  { title: 'Status', key: 'status' },
  { title: 'Rating', key: 'day_rating', sortable: false },
  { title: 'Score', key: 'productivity_score', sortable: false },
  { title: 'Tasks', key: 'tasks', sortable: false },
  { title: '', key: 'actions', sortable: false, align: 'center' as const },
]

// ─── Helpers ───

function getEmployeeName(id: string): string {
  const emp = employeeStore.employees.find((e: any) => e.id === id)
  return emp ? `${emp.first_name} ${emp.last_name}` : id?.slice(0, 8) + '...'
}

function formatTime(dt: string): string {
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date(dt))
}

function formatDateTime(dt: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dt))
}

function formatShortDate(d: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(d))
}

function barWidth(val: number): string {
  const max = Math.max(...store.attendanceTrend.map(t => t.present + t.late + t.absent + t.half_day), 1)
  return Math.max((val / max) * 100, 0) + '%'
}

function taskDotColor(status: string): string {
  const map: Record<string, string> = { completed: 'success', partially_completed: 'warning', not_completed: 'error', pending: 'grey' }
  return map[status] ?? 'grey'
}

function openDetail(record: Attendance) {
  selectedRecord.value = record
  detailOpen.value = true
}

// ─── Data Loading ───

async function loadDashboard() {
  const now = new Date()
  await Promise.allSettled([
    store.fetchAdminKPI(),
    store.fetchAttendanceTrend(trendDays.value),
    store.fetchStatusBreakdown(),
    store.fetchAlerts(),
    store.fetchPerformers(now.getFullYear(), now.getMonth() + 1),
  ])
  applyFilters()
}

function applyFilters() {
  const params: any = {}
  if (filters.value.dateFrom) params.date_from = filters.value.dateFrom
  if (filters.value.dateTo) params.date_to = filters.value.dateTo
  if (filters.value.status) params.status = filters.value.status
  if (filters.value.employeeId) params.employee_id = filters.value.employeeId
  store.fetchAttendance(params)
}

function resetFilters() {
  filters.value = { dateFrom: '', dateTo: '', status: null, employeeId: null }
  store.fetchAttendance()
}

function onTableOptions(options: any) {
  store.fetchAttendance({ page: options.page, pageSize: options.itemsPerPage })
}

async function handleExport() {
  await store.exportCSV({
    date_from: filters.value.dateFrom || undefined,
    date_to: filters.value.dateTo || undefined,
    employee_id: filters.value.employeeId || undefined,
    status: filters.value.status || undefined,
  })
}

watch(trendDays, (days) => { store.fetchAttendanceTrend(days) })

onMounted(async () => {
  if (employeeStore.employees.length === 0) {
    employeeStore.fetchEmployees({ pageSize: 200 })
  }
  await loadDashboard()
})
</script>

<style scoped>
.trend-container { display: flex; flex-direction: column; gap: 4px; }
.trend-row { display: flex; align-items: center; gap: 8px; }
.trend-date { width: 50px; text-align: right; flex-shrink: 0; }
.trend-bars { display: flex; flex: 1; height: 18px; border-radius: 4px; overflow: hidden; background: rgba(0,0,0,0.04); }
.bar { height: 100%; transition: width 0.3s; }
.trend-hours { width: 40px; text-align: right; flex-shrink: 0; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; }
.status-grid { display: flex; justify-content: space-around; flex-wrap: wrap; gap: 12px; }
.status-circle {
  width: 52px; height: 52px; border-radius: 50%; border: 3px solid;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; font-weight: bold; margin: 0 auto;
}
</style>

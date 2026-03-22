<template>
  <v-container fluid class="pa-4 pa-md-6">
    <PageHeader title="Productivity Reports" subtitle="Employee attendance and performance analytics" />

    <FilterBar
      :filters="filters"
      v-model="filterValues"
      @apply="loadReport"
      @reset="loadReport"
    />

    <!-- KPI Cards -->
    <v-row v-if="attendanceStore.productivityReport.length > 0" class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <StatCard
          title="Avg Completion Rate"
          :value="avgCompletionRate + '%'"
          icon="mdi-check-decagram"
          icon-color="success"
          :trend="avgCompletionRate >= 80 ? 'up' : avgCompletionRate >= 50 ? 'flat' : 'down'"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          title="Total Present Days"
          :value="totalPresentDays"
          icon="mdi-account-check"
          icon-color="primary"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          title="Total Late Days"
          :value="totalLateDays"
          icon="mdi-clock-alert"
          icon-color="warning"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <StatCard
          title="Avg Work Hours"
          :value="avgWorkHours + 'h'"
          icon="mdi-timer"
          icon-color="info"
        />
      </v-col>
    </v-row>

    <DataTable
      title="Employee Productivity"
      :headers="headers"
      :items="attendanceStore.productivityReport"
      :total-items="attendanceStore.productivityReport.length"
      :loading="attendanceStore.isLoading"
    >
      <template #item.task_completion_rate="{ item }">
        <v-chip :color="item.task_completion_rate >= 80 ? 'success' : item.task_completion_rate >= 50 ? 'warning' : 'error'" size="small">
          {{ item.task_completion_rate?.toFixed(1) }}%
        </v-chip>
      </template>

      <template #item.avg_day_rating="{ item }">
        <span v-if="item.avg_day_rating">{{ item.avg_day_rating.toFixed(1) }} / 5</span>
        <span v-else class="text-medium-emphasis">—</span>
      </template>

      <template #item.total_work_hours="{ item }">
        {{ item.total_work_hours?.toFixed(1) }}h
      </template>

      <template #item.avg_work_hours="{ item }">
        {{ item.avg_work_hours?.toFixed(1) }}h
      </template>
    </DataTable>

    <EmptyState
      v-if="attendanceStore.productivityReport.length === 0 && !attendanceStore.isLoading"
      icon="mdi-chart-bar"
      title="No report data"
      subtitle="Apply filters to generate productivity reports"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useAttendanceStore } from '@/store/attendance.store'
import type { FilterConfig } from '@/components/common/FilterBar.vue'

const attendanceStore = useAttendanceStore()

const currentMonth = new Date().getMonth() + 1
const currentYear = new Date().getFullYear()

const filters: FilterConfig[] = [
  {
    key: 'month',
    label: 'Month',
    type: 'select',
    options: Array.from({ length: 12 }, (_, i) => ({
      title: new Date(2000, i).toLocaleString('en', { month: 'long' }),
      value: i + 1,
    })),
  },
  {
    key: 'year',
    label: 'Year',
    type: 'select',
    options: Array.from({ length: 5 }, (_, i) => ({
      title: String(currentYear - i),
      value: currentYear - i,
    })),
  },
]

const filterValues = ref<Record<string, any>>({
  month: currentMonth,
  year: currentYear,
})

const headers = [
  { title: 'Employee', key: 'employee_name', align: 'start' as const },
  { title: 'Present', key: 'total_present_days' },
  { title: 'Absent', key: 'total_absent_days' },
  { title: 'Late', key: 'total_late_days' },
  { title: 'Half Days', key: 'total_half_days' },
  { title: 'Total Hours', key: 'total_work_hours' },
  { title: 'Avg Hours', key: 'avg_work_hours' },
  { title: 'Task Rate', key: 'task_completion_rate' },
  { title: 'Avg Rating', key: 'avg_day_rating' },
]

const avgCompletionRate = computed(() => {
  const reports = attendanceStore.productivityReport
  if (!reports.length) return 0
  return Math.round(reports.reduce((s, r) => s + (r.task_completion_rate || 0), 0) / reports.length)
})

const totalPresentDays = computed(() =>
  attendanceStore.productivityReport.reduce((s, r) => s + (r.total_present_days || 0), 0)
)

const totalLateDays = computed(() =>
  attendanceStore.productivityReport.reduce((s, r) => s + (r.total_late_days || 0), 0)
)

const avgWorkHours = computed(() => {
  const reports = attendanceStore.productivityReport
  if (!reports.length) return '0'
  return (reports.reduce((s, r) => s + (r.avg_work_hours || 0), 0) / reports.length).toFixed(1)
})

const loadReport = () => {
  const params: Record<string, any> = {}
  if (filterValues.value.month) params.month = filterValues.value.month
  if (filterValues.value.year) params.year = filterValues.value.year
  attendanceStore.fetchProductivityReport(params)
}

onMounted(() => {
  loadReport()
})
</script>

<template>
  <v-container fluid class="pa-6">
    <PageHeader title="System Audit Logs" subtitle="Track all system events and user actions">
      <template #actions>
        <v-btn
          color="primary"
          variant="tonal"
          prepend-icon="mdi-download"
          class="text-none"
          :disabled="systemStore.auditLogs.length === 0"
          @click="exportCSV"
        >
          Export CSV
        </v-btn>
      </template>
    </PageHeader>

    <!-- Filters -->
    <FilterBar
      v-model="filterValues"
      :filters="filterConfig"
      @apply="applyFilters"
      @reset="resetFilters"
    />

    <DataTable
      title="Audit Logs"
      :headers="headers"
      :items="systemStore.auditLogs"
      :total-items="systemStore.totalAuditLogs"
      :loading="systemStore.isLoading"
      @update:options="onOptionsUpdate"
    >
      <template #item.timestamp="{ item }">
        {{ formatDateTime(item.timestamp) }}
      </template>

      <template #item.event_type="{ item }">
        <StatusChip :status="item.event_type" :color-map="eventColorMap" size="x-small" />
      </template>

      <template #item.service_source="{ item }">
        <span class="text-caption text-medium-emphasis">{{ item.service_source }}</span>
      </template>

      <template #item.user_id="{ item }">
        <div v-if="item.user_id" class="d-flex align-center ga-2">
          <v-avatar size="20" color="primary" variant="tonal">
            <v-icon size="12">mdi-account</v-icon>
          </v-avatar>
          <span class="text-caption">{{ getEmployeeName(item.user_id) }}</span>
        </div>
        <span v-else class="text-caption text-medium-emphasis">System</span>
      </template>

      <template #item.actions="{ item }">
        <v-btn icon="mdi-code-json" variant="text" color="primary" size="small" @click="viewPayload(item)" />
      </template>
    </DataTable>

    <!-- Payload Viewer -->
    <v-dialog v-model="payloadModel.show" max-width="800px">
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="d-flex justify-space-between align-center">
          <span>Event Raw Payload</span>
          <StatusChip :status="payloadModel.data?.event_type || ''" size="small" />
        </v-card-title>
        <v-card-text>
          <div class="bg-grey-darken-4 pa-4 rounded-lg overflow-auto" style="max-height: 500px">
            <pre class="text-green-accent-3 text-caption">{{ JSON.stringify(payloadModel.data?.payload, null, 2) }}</pre>
          </div>

          <v-list class="mt-4" density="compact">
            <v-list-item title="Correlation ID" :subtitle="payloadModel.data?.correlation_id" />
            <v-list-item title="IP Address" :subtitle="payloadModel.data?.ip_address" />
            <v-list-item title="User Agent" :subtitle="payloadModel.data?.user_agent" />
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="payloadModel.show = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import FilterBar from '@/components/common/FilterBar.vue'
import type { FilterConfig } from '@/components/common/FilterBar.vue'
import { useSystemStore } from '@/store/system.store'
import { useEmployeeStore } from '@/store/employee.store'

const systemStore = useSystemStore()
const employeeStore = useEmployeeStore()

const headers = [
  { title: 'Timestamp', key: 'timestamp', align: 'start' as const },
  { title: 'Event', key: 'event_type' },
  { title: 'Service', key: 'service_source' },
  { title: 'Actor', key: 'user_id' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
]

const eventColorMap: Record<string, string> = {
  login: 'primary',
  logout: 'info',
  create: 'success',
  update: 'warning',
  delete: 'error',
}

const filterConfig: FilterConfig[] = [
  {
    key: 'event_type',
    label: 'Event Type',
    type: 'select',
    options: [
      { title: 'Login', value: 'LOGIN' },
      { title: 'Logout', value: 'LOGOUT' },
      { title: 'Create', value: 'CREATE' },
      { title: 'Update', value: 'UPDATE' },
      { title: 'Delete', value: 'DELETE' },
    ],
  },
  {
    key: 'service_source',
    label: 'Service',
    type: 'select',
    options: [
      { title: 'Auth', value: 'auth-service' },
      { title: 'Employee', value: 'employee-service' },
      { title: 'Attendance', value: 'attendance-service' },
      { title: 'Leave', value: 'leave-service' },
      { title: 'Payroll', value: 'payroll-service' },
      { title: 'Notification', value: 'notification-service' },
      { title: 'Students', value: 'students-service' },
    ],
  },
  { key: 'date', label: 'Date', type: 'daterange' },
]

const filterValues = ref<Record<string, any>>({})
const currentPage = ref(1)
const currentPageSize = ref(50)

const payloadModel = reactive({
  show: false,
  data: null as any,
})

onMounted(() => {
  systemStore.fetchAuditLogs()
  if (employeeStore.employees.length === 0) {
    employeeStore.fetchEmployees({ pageSize: 100 })
  }
})

const onOptionsUpdate = (options: any) => {
  currentPage.value = options.page
  currentPageSize.value = options.itemsPerPage
  fetchWithFilters(options.page, options.itemsPerPage)
}

const applyFilters = () => {
  currentPage.value = 1
  fetchWithFilters(1, currentPageSize.value)
}

const resetFilters = () => {
  filterValues.value = {}
  currentPage.value = 1
  systemStore.fetchAuditLogs({ skip: 0, limit: currentPageSize.value })
}

const fetchWithFilters = (page: number, pageSize: number) => {
  const params: any = {
    skip: (page - 1) * pageSize,
    limit: pageSize,
  }
  const f = filterValues.value
  if (f.event_type) params.event_type = f.event_type
  if (f.service_source) params.service_source = f.service_source
  if (f.date_from) params.start_date = f.date_from
  if (f.date_to) params.end_date = f.date_to
  systemStore.fetchAuditLogs(params)
}

const viewPayload = (item: any) => {
  payloadModel.data = item
  payloadModel.show = true
}

const getEmployeeName = (id: string) => {
  const emp = employeeStore.employees.find((e: any) => e.id === id)
  return emp ? `${emp.first_name} ${emp.last_name}` : id.split('-')[0] + '...'
}

const formatDateTime = (dtStr: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(dtStr))
}

const exportCSV = () => {
  const rows = systemStore.auditLogs.map((log: any) => ({
    timestamp: log.timestamp,
    event_type: log.event_type,
    service_source: log.service_source,
    user_id: log.user_id || 'System',
    correlation_id: log.correlation_id || '',
    ip_address: log.ip_address || '',
  }))

  const csvHeaders = Object.keys(rows[0] || {})
  const csvContent = [
    csvHeaders.join(','),
    ...rows.map(r => csvHeaders.map(h => `"${(r as any)[h] ?? ''}"`.replace(/"/g, '""')).join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

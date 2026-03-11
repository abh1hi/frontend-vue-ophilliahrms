<template>
  <v-container fluid class="pa-6">
    <DataTable
      title="System Audit Logs"
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
        <v-chip size="x-small" color="primary" label class="text-uppercase font-weight-black">
          {{ item.event_type }}
        </v-chip>
      </template>

      <template #item.service_source="{ item }">
        <span class="text-caption text-grey-darken-1">{{ item.service_source }}</span>
      </template>

      <template #item.user_id="{ item }">
         <div v-if="item.user_id" class="d-flex align-center ga-2">
            <v-avatar size="20" color="grey-lighten-4">
                <v-icon size="12">mdi-account</v-icon>
            </v-avatar>
            <span class="text-caption">{{ getEmployeeName(item.user_id) }}</span>
         </div>
         <span v-else class="text-caption text-grey">System</span>
      </template>

      <template #item.actions="{ item }">
        <v-btn icon="mdi-code-json" variant="text" color="primary" size="small" @click="viewPayload(item)"></v-btn>
      </template>
    </DataTable>

    <!-- Payload Viewer -->
    <v-dialog v-model="payloadModel.show" max-width="800px">
        <v-card rounded="lg" class="pa-4">
            <v-card-title class="d-flex justify-space-between align-center">
                <span>Event Raw Payload</span>
                <v-chip size="small" color="primary">{{ payloadModel.data?.event_type }}</v-chip>
            </v-card-title>
            <v-card-text>
                <div class="bg-grey-darken-4 pa-4 rounded-lg overflow-auto" style="max-height: 500px">
                    <pre class="text-green-accent-3 text-caption">{{ JSON.stringify(payloadModel.data?.payload, null, 2) }}</pre>
                </div>
                
                <v-list class="mt-4" density="compact">
                    <v-list-item title="Correlation ID" :subtitle="payloadModel.data?.correlation_id"></v-list-item>
                    <v-list-item title="IP Address" :subtitle="payloadModel.data?.ip_address"></v-list-item>
                    <v-list-item title="User Agent" :subtitle="payloadModel.data?.user_agent"></v-list-item>
                </v-list>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="payloadModel.show = false">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import { useSystemStore } from '@/store/system.store'
import { useEmployeeStore } from '@/store/employee.store'

const systemStore = useSystemStore()
const employeeStore = useEmployeeStore()

const headers = [
  { title: 'Timestamp', key: 'timestamp', align: 'start' },
  { title: 'Event', key: 'event_type' },
  { title: 'Service', key: 'service_source' },
  { title: 'Actor', key: 'user_id' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

const payloadModel = reactive({
    show: false,
    data: null as any
})

onMounted(() => {
    systemStore.fetchAuditLogs()
    if (employeeStore.employees.length === 0) {
        employeeStore.fetchEmployees({ pageSize: 100 })
    }
})

const onOptionsUpdate = (options: any) => {
  systemStore.fetchAuditLogs({
    skip: (options.page - 1) * options.itemsPerPage,
    limit: options.itemsPerPage
  })
}

const viewPayload = (item: any) => {
    payloadModel.data = item
    payloadModel.show = true
}

const getEmployeeName = (id: string) => {
  const emp = employeeStore.employees.find(e => e.id === id)
  return emp ? `${emp.first_name} ${emp.last_name}` : id.split('-')[0] + '...'
}

const formatDateTime = (dtStr: string) => {
    return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date(dtStr))
}
</script>

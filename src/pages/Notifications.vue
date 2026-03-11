<template>
  <v-container fluid class="pa-6">
    <DataTable
      title="Notification Logs"
      :headers="headers"
      :items="systemStore.notificationLogs"
      :loading="systemStore.isLoading"
      searchable
    >
      <template #item.type="{ item }">
        <v-chip size="small" variant="tonal" class="text-uppercase font-weight-bold">
          {{ item.type }}
        </v-chip>
      </template>

      <template #item.status="{ item }">
        <v-chip
          :color="getStatusColor(item.status)"
          size="small"
          label
          class="text-uppercase font-weight-bold"
        >
          {{ item.status }}
        </v-chip>
      </template>

      <template #item.created_at="{ item }">
        {{ formatDateTime(item.created_at) }}
      </template>

      <template #item.actions="{ item }">
        <v-btn icon="mdi-eye-outline" variant="text" color="primary" size="small" @click="viewDetail(item)"></v-btn>
      </template>
    </DataTable>

    <v-dialog v-model="detailModel.show" max-width="600px">
        <v-card rounded="lg">
            <v-card-title>Notification Detail</v-card-title>
            <v-card-text>
                <div class="mb-4">
                    <div class="text-caption text-grey">Subject</div>
                    <div class="text-body-1 font-weight-bold">{{ detailModel.data?.subject || 'No Subject' }}</div>
                </div>
                <div>
                    <div class="text-caption text-grey">Message</div>
                    <v-alert color="grey-lighten-4" class="mt-1">
                        {{ detailModel.data?.message }}
                    </v-alert>
                </div>
                <div v-if="detailModel.data?.error_message" class="mt-4">
                    <div class="text-caption text-error">Error Message</div>
                    <div class="text-body-2 text-error">{{ detailModel.data.error_message }}</div>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="detailModel.show = false">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import { useSystemStore } from '@/store/system.store'

const systemStore = useSystemStore()

const headers = [
  { title: 'Type', key: 'type', align: 'start' },
  { title: 'Subject', key: 'subject' },
  { title: 'Date', key: 'created_at' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

const detailModel = reactive({
    show: false,
    data: null as any
})

onMounted(() => {
  systemStore.fetchNotificationLogs()
})

const viewDetail = (item: any) => {
    detailModel.data = item
    detailModel.show = true
}

const formatDateTime = (dtStr: string) => {
    return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    }).format(new Date(dtStr))
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'sent':
    case 'delivered': return 'success'
    case 'pending': return 'warning'
    case 'failed': return 'error'
    default: return 'grey'
  }
}
</script>

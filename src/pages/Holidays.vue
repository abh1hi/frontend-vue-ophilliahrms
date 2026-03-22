<template>
  <v-container fluid class="pa-4 pa-md-6">
    <PageHeader title="Holidays" subtitle="Manage company holidays and recurring events">
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate" class="text-none">
          Add Holiday
        </v-btn>
      </template>
    </PageHeader>

    <DataTable
      title="Holidays"
      :headers="headers"
      :items="leaveStore.holidays"
      :total-items="leaveStore.holidays.length"
      :loading="leaveStore.isLoading"
    >
      <template #item.date="{ item }">
        {{ formatDate(item.date) }}
      </template>

      <template #item.is_recurring="{ item }">
        <v-icon :color="item.is_recurring ? 'primary' : 'grey'" size="20">
          {{ item.is_recurring ? 'mdi-refresh' : 'mdi-minus' }}
        </v-icon>
      </template>

      <template #item.is_active="{ item }">
        <StatusChip :status="item.is_active ? 'active' : 'inactive'" size="small" />
      </template>

      <template #item.actions="{ item }">
        <v-btn icon size="small" variant="text" color="error" @click="openDeleteDialog(item)">
          <v-icon size="18">mdi-delete-outline</v-icon>
          <v-tooltip activator="parent" location="top">Delete</v-tooltip>
        </v-btn>
      </template>
    </DataTable>

    <FormModal
      v-model="createModal.show"
      title="Add Holiday"
      submit-text="Create"
      :loading="leaveStore.isLoading"
      :initial-data="createModal.data"
      @submit="handleCreate"
    >
      <template #default="{ formData }">
        <v-text-field v-model="formData.name" label="Holiday Name" :rules="[v => !!v || 'Required']" />
        <v-text-field v-model="formData.date" label="Date" type="date" :rules="[v => !!v || 'Required']" />
        <v-textarea v-model="formData.description" label="Description" rows="2" />
        <v-switch v-model="formData.is_recurring" label="Recurring annually" color="primary" hide-details />
      </template>
    </FormModal>

    <ConfirmDialog
      v-model="deleteDialog.show"
      title="Delete Holiday"
      :message="`Delete holiday '${deleteDialog.item?.name}'?`"
      confirm-text="Delete"
      confirm-color="error"
      icon="mdi-calendar-remove"
      @confirm="handleDelete"
    />
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import FormModal from '@/components/common/FormModal.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useLeaveStore } from '@/store/leave.store'
import type { Holiday } from '@/types/leave.types'

const leaveStore = useLeaveStore()

const headers = [
  { title: 'Name', key: 'name', align: 'start' as const },
  { title: 'Date', key: 'date' },
  { title: 'Description', key: 'description' },
  { title: 'Recurring', key: 'is_recurring' },
  { title: 'Status', key: 'is_active' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const },
]

const createModal = reactive({ show: false, data: {} as any })
const deleteDialog = reactive({ show: false, item: null as Holiday | null })

const openCreate = () => {
  createModal.data = { name: '', date: '', description: '', is_recurring: false }
  createModal.show = true
}

const handleCreate = async (formData: any) => {
  await leaveStore.createHoliday(formData)
  createModal.show = false
}

const openDeleteDialog = (holiday: Holiday) => {
  deleteDialog.item = holiday
  deleteDialog.show = true
}

const handleDelete = async () => {
  if (!deleteDialog.item) return
  await leaveStore.deleteHoliday(deleteDialog.item.id)
  deleteDialog.show = false
}

const formatDate = (dateStr: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(dateStr))
  } catch { return dateStr }
}

onMounted(() => {
  leaveStore.fetchHolidays()
})
</script>

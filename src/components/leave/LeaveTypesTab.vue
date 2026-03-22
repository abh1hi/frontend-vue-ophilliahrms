<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h3 class="text-h6 font-weight-bold">Leave Types</h3>
      <v-btn color="primary" variant="tonal" size="small" prepend-icon="mdi-plus" @click="openCreate" class="text-none">
        Add Type
      </v-btn>
    </div>

    <DataTable
      title=""
      :headers="headers"
      :items="leaveStore.leaveTypes"
      :total-items="leaveStore.leaveTypes.length"
      :loading="leaveStore.isLoading"
    >
      <template #item.requires_approval="{ item }">
        <v-icon :color="item.requires_approval ? 'success' : 'grey'" size="20">
          {{ item.requires_approval ? 'mdi-check-circle' : 'mdi-close-circle' }}
        </v-icon>
      </template>

      <template #item.actions="{ item }">
        <v-btn icon size="small" variant="text" color="primary" @click="openEdit(item)">
          <v-icon size="18">mdi-pencil-outline</v-icon>
        </v-btn>
        <v-btn icon size="small" variant="text" color="error" @click="handleDelete(item.id)">
          <v-icon size="18">mdi-delete-outline</v-icon>
        </v-btn>
      </template>
    </DataTable>

    <FormModal
      v-model="modal.show"
      :title="modal.isEdit ? 'Edit Leave Type' : 'Add Leave Type'"
      :submit-text="modal.isEdit ? 'Save' : 'Create'"
      :loading="leaveStore.isLoading"
      :initial-data="modal.data"
      @submit="handleSubmit"
    >
      <template #default="{ formData }">
        <v-text-field v-model="formData.name" label="Name" :rules="[v => !!v || 'Required']" />
        <v-textarea v-model="formData.description" label="Description" rows="2" />
        <v-text-field v-model.number="formData.days_allowed" label="Days Allowed" type="number" :rules="[v => v > 0 || 'Must be > 0']" />
        <v-switch v-model="formData.requires_approval" label="Requires Approval" color="primary" hide-details />
      </template>
    </FormModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import FormModal from '@/components/common/FormModal.vue'
import { useLeaveStore } from '@/store/leave.store'
import type { LeaveType } from '@/types/leave.types'

const leaveStore = useLeaveStore()

const headers = [
  { title: 'Name', key: 'name', align: 'start' as const },
  { title: 'Description', key: 'description' },
  { title: 'Days Allowed', key: 'days_allowed' },
  { title: 'Approval', key: 'requires_approval' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const },
]

const modal = reactive({ show: false, isEdit: false, editId: '', data: {} as any })

const openCreate = () => {
  modal.isEdit = false
  modal.data = { name: '', description: '', days_allowed: 12, requires_approval: true }
  modal.show = true
}

const openEdit = (lt: LeaveType) => {
  modal.isEdit = true
  modal.editId = lt.id
  modal.data = { name: lt.name, description: lt.description || '', days_allowed: lt.days_allowed, requires_approval: lt.requires_approval }
  modal.show = true
}

const handleSubmit = async (formData: any) => {
  if (modal.isEdit) {
    await leaveStore.updateLeaveType(modal.editId, formData)
  } else {
    await leaveStore.createLeaveType(formData)
  }
  modal.show = false
}

const handleDelete = async (id: string) => {
  await leaveStore.deleteLeaveType(id)
}

onMounted(() => {
  if (leaveStore.leaveTypes.length === 0) leaveStore.fetchLeaveTypes()
})
</script>

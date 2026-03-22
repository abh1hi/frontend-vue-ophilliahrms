<template>
  <v-container fluid class="pa-4 pa-md-6">
    <PageHeader title="Geofence Management" subtitle="Configure location boundaries for attendance tracking">
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate" class="text-none">
          Add Geofence
        </v-btn>
      </template>
    </PageHeader>

    <DataTable
      title="Geofences"
      :headers="headers"
      :items="attendanceStore.geofences"
      :total-items="attendanceStore.geofences.length"
      :loading="attendanceStore.isLoading"
    >
      <template #item.radius_meters="{ item }">
        {{ item.radius_meters }}m
      </template>

      <template #item.coordinates="{ item }">
        <span class="text-caption">{{ item.latitude?.toFixed(6) }}, {{ item.longitude?.toFixed(6) }}</span>
      </template>

      <template #item.actions="{ item }">
        <v-btn icon size="small" variant="text" color="primary" @click="openEdit(item)">
          <v-icon size="18">mdi-pencil-outline</v-icon>
          <v-tooltip activator="parent" location="top">Edit</v-tooltip>
        </v-btn>
        <v-btn icon size="small" variant="text" color="error" @click="openDeleteDialog(item)">
          <v-icon size="18">mdi-delete-outline</v-icon>
          <v-tooltip activator="parent" location="top">Delete</v-tooltip>
        </v-btn>
      </template>
    </DataTable>

    <FormModal
      v-model="modal.show"
      :title="modal.isEdit ? 'Edit Geofence' : 'Add Geofence'"
      :submit-text="modal.isEdit ? 'Save' : 'Create'"
      :loading="attendanceStore.isLoading"
      :initial-data="modal.data"
      @submit="handleSubmit"
    >
      <template #default="{ formData }">
        <v-text-field v-model="formData.name" label="Name" :rules="[v => !!v || 'Required']" />
        <v-row dense>
          <v-col cols="6">
            <v-text-field v-model.number="formData.latitude" label="Latitude" type="number" step="0.000001" :rules="[v => v !== '' || 'Required']" />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model.number="formData.longitude" label="Longitude" type="number" step="0.000001" :rules="[v => v !== '' || 'Required']" />
          </v-col>
        </v-row>
        <v-text-field v-model.number="formData.radius_meters" label="Radius (meters)" type="number" :rules="[v => v > 0 || 'Must be > 0']" />
      </template>
    </FormModal>

    <ConfirmDialog
      v-model="deleteDialog.show"
      title="Delete Geofence"
      :message="`Delete geofence '${deleteDialog.item?.name}'? This cannot be undone.`"
      confirm-text="Delete"
      confirm-color="error"
      icon="mdi-map-marker-remove"
      @confirm="handleDelete"
    />
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import FormModal from '@/components/common/FormModal.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useAttendanceStore } from '@/store/attendance.store'
import type { Geofence } from '@/types/attendance.types'

const attendanceStore = useAttendanceStore()

const headers = [
  { title: 'Name', key: 'name', align: 'start' as const },
  { title: 'Coordinates', key: 'coordinates' },
  { title: 'Radius', key: 'radius_meters' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const },
]

const modal = reactive({ show: false, isEdit: false, editId: '', data: {} as any })
const deleteDialog = reactive({ show: false, item: null as Geofence | null })

const openCreate = () => {
  modal.isEdit = false
  modal.editId = ''
  modal.data = { name: '', latitude: '', longitude: '', radius_meters: 100 }
  modal.show = true
}

const openEdit = (gf: Geofence) => {
  modal.isEdit = true
  modal.editId = gf.id
  modal.data = { name: gf.name, latitude: gf.latitude, longitude: gf.longitude, radius_meters: gf.radius_meters }
  modal.show = true
}

const handleSubmit = async (formData: any) => {
  if (modal.isEdit) {
    await attendanceStore.updateGeofence(modal.editId, formData)
  } else {
    await attendanceStore.createGeofence(formData)
  }
  modal.show = false
}

const openDeleteDialog = (gf: Geofence) => {
  deleteDialog.item = gf
  deleteDialog.show = true
}

const handleDelete = async () => {
  if (!deleteDialog.item) return
  await attendanceStore.deleteGeofence(deleteDialog.item.id)
  deleteDialog.show = false
}

onMounted(() => {
  attendanceStore.fetchGeofences()
})
</script>

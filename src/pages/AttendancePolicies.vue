<template>
  <v-container fluid class="pa-4 pa-md-6">
    <PageHeader title="Attendance Policies" subtitle="Configure attendance methods and work schedules">
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate" class="text-none">
          Add Policy
        </v-btn>
      </template>
    </PageHeader>

    <DataTable
      title="Policies"
      :headers="headers"
      :items="attendanceStore.policies"
      :total-items="attendanceStore.policies.length"
      :loading="attendanceStore.isLoading"
    >
      <template #item.method="{ item }">
        <StatusChip :status="item.method" size="small" :color-map="methodColors" />
      </template>

      <template #item.department_id="{ item }">
        {{ getDepartmentName(item.department_id) }}
      </template>

      <template #item.employee_id="{ item }">
        {{ getEmployeeName(item.employee_id) }}
      </template>

      <template #item.work_start_time="{ item }">
        {{ item.work_start_time || '—' }}
      </template>

      <template #item.work_hours_per_day="{ item }">
        {{ item.work_hours_per_day }}h
      </template>

      <template #item.actions="{ item }">
        <v-btn icon size="small" variant="text" color="primary" @click="openEdit(item)">
          <v-icon size="18">mdi-pencil-outline</v-icon>
        </v-btn>
        <v-btn icon size="small" variant="text" color="error" @click="openDeleteDialog(item)">
          <v-icon size="18">mdi-delete-outline</v-icon>
        </v-btn>
      </template>
    </DataTable>

    <FormModal
      v-model="modal.show"
      :title="modal.isEdit ? 'Edit Policy' : 'Add Policy'"
      :submit-text="modal.isEdit ? 'Save' : 'Create'"
      :loading="attendanceStore.isLoading"
      :initial-data="modal.data"
      @submit="handleSubmit"
    >
      <template #default="{ formData }">
        <v-select v-model="formData.method" label="Attendance Method" :items="methodOptions" :rules="[v => !!v || 'Required']" />
        <v-select v-model="formData.department_id" label="Department" :items="departmentOptions" clearable />
        <v-select v-model="formData.employee_id" label="Specific Employee (optional)" :items="employeeOptions" clearable />
        <v-select v-model="formData.geofence_id" label="Geofence (optional)" :items="geofenceOptions" clearable />
        <v-text-field v-model="formData.work_start_time" label="Work Start Time" type="time" />
        <v-text-field v-model.number="formData.work_hours_per_day" label="Work Hours Per Day" type="number" :rules="[v => v > 0 || 'Must be > 0']" />
      </template>
    </FormModal>

    <ConfirmDialog
      v-model="deleteDialog.show"
      title="Delete Policy"
      message="Are you sure you want to delete this attendance policy?"
      confirm-text="Delete"
      confirm-color="error"
      @confirm="handleDelete"
    />
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive, computed } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import FormModal from '@/components/common/FormModal.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useAttendanceStore } from '@/store/attendance.store'
import { useEmployeeStore } from '@/store/employee.store'
import { useDepartmentStore } from '@/store/department.store'
import type { AttendancePolicy } from '@/types/attendance.types'

const attendanceStore = useAttendanceStore()
const employeeStore = useEmployeeStore()
const departmentStore = useDepartmentStore()

const headers = [
  { title: 'Method', key: 'method', align: 'start' as const },
  { title: 'Department', key: 'department_id' },
  { title: 'Employee', key: 'employee_id' },
  { title: 'Start Time', key: 'work_start_time' },
  { title: 'Hours/Day', key: 'work_hours_per_day' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const },
]

const methodColors: Record<string, string> = {
  gps: 'blue',
  geofence: 'teal',
  manual: 'orange',
  biometric: 'purple',
  wifi: 'indigo',
}

const methodOptions = [
  { title: 'GPS', value: 'gps' },
  { title: 'Geofence', value: 'geofence' },
  { title: 'Manual', value: 'manual' },
  { title: 'Biometric', value: 'biometric' },
  { title: 'WiFi', value: 'wifi' },
]

const departmentOptions = computed(() =>
  departmentStore.departments.map((d: any) => ({ title: d.name, value: d.id }))
)

const employeeOptions = computed(() =>
  employeeStore.employees.map((e: any) => ({ title: `${e.first_name} ${e.last_name}`, value: e.id }))
)

const geofenceOptions = computed(() =>
  attendanceStore.geofences.map(g => ({ title: g.name, value: g.id }))
)

const getDepartmentName = (id: string | undefined) => {
  if (!id) return '—'
  const dept = departmentStore.departments.find((d: any) => d.id === id)
  return dept ? dept.name : id
}

const getEmployeeName = (id: string | undefined) => {
  if (!id) return '(All)'
  const emp = employeeStore.employees.find((e: any) => e.id === id)
  return emp ? `${emp.first_name} ${emp.last_name}` : id
}

const modal = reactive({ show: false, isEdit: false, editId: '', data: {} as any })
const deleteDialog = reactive({ show: false, item: null as AttendancePolicy | null })

const openCreate = () => {
  modal.isEdit = false
  modal.data = { method: 'gps', department_id: null, employee_id: null, geofence_id: null, work_start_time: '09:00', work_hours_per_day: 8 }
  modal.show = true
}

const openEdit = (policy: AttendancePolicy) => {
  modal.isEdit = true
  modal.editId = policy.id
  modal.data = {
    method: policy.method,
    department_id: policy.department_id || null,
    employee_id: policy.employee_id || null,
    geofence_id: policy.geofence_id || null,
    work_start_time: policy.work_start_time || '',
    work_hours_per_day: policy.work_hours_per_day,
  }
  modal.show = true
}

const handleSubmit = async (formData: any) => {
  const payload = { ...formData }
  // Clean nulls
  if (!payload.department_id) delete payload.department_id
  if (!payload.employee_id) delete payload.employee_id
  if (!payload.geofence_id) delete payload.geofence_id

  if (modal.isEdit) {
    await attendanceStore.updatePolicy(modal.editId, payload)
  } else {
    await attendanceStore.createPolicy(payload)
  }
  modal.show = false
}

const openDeleteDialog = (policy: AttendancePolicy) => {
  deleteDialog.item = policy
  deleteDialog.show = true
}

const handleDelete = async () => {
  if (!deleteDialog.item) return
  await attendanceStore.deletePolicy(deleteDialog.item.id)
  deleteDialog.show = false
}

onMounted(() => {
  attendanceStore.fetchPolicies()
  attendanceStore.fetchGeofences()
  if (employeeStore.employees.length === 0) employeeStore.fetchEmployees({ pageSize: 100 })
  if (departmentStore.departments.length === 0) departmentStore.fetchDepartments()
})
</script>

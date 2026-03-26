<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h3 class="text-h6 font-weight-bold">Leave Balances</h3>
      <div class="d-flex ga-2">
        <v-btn color="primary" variant="tonal" size="small" prepend-icon="mdi-plus" @click="openAllocate" class="text-none">
          Allocate
        </v-btn>
        <v-btn color="secondary" variant="tonal" size="small" prepend-icon="mdi-upload" @click="openBulk" class="text-none">
          Bulk Allocate
        </v-btn>
      </div>
    </div>

    <DataTable
      title=""
      :headers="headers"
      :items="leaveStore.leaveBalances"
      :total-items="leaveStore.leaveBalances.length"
      :loading="leaveStore.isLoading"
    >
      <template #item.employee_id="{ item }">
        {{ getEmployeeName(item.employee_id) }}
      </template>
      <template #item.leave_type="{ item }">
        {{ item.leave_type?.name || item.leave_type_id }}
      </template>
      <template #item.remaining="{ item }">
        <v-chip :color="(item.total_days - item.used_days) <= 2 ? 'error' : 'success'" size="small">
          {{ item.total_days - item.used_days }} days
        </v-chip>
      </template>
    </DataTable>

    <!-- Allocate Modal -->
    <FormModal
      v-model="allocateModal.show"
      title="Allocate Leave Balance"
      submit-text="Allocate"
      :loading="leaveStore.isLoading"
      :initial-data="allocateModal.data"
      @submit="handleAllocate"
    >
      <template #default="{ formData }">
        <v-select v-model="formData.employee_id" label="Employee" :items="employeeOptions" :rules="[v => !!v || 'Required']" />
        <v-select v-model="formData.leave_type_id" label="Leave Type" :items="leaveTypeOptions" :rules="[v => !!v || 'Required']" />
        <v-text-field v-model.number="formData.total_days" label="Total Days" type="number" :rules="[v => v > 0 || 'Must be > 0']" />
        <v-text-field v-model.number="formData.year" label="Year" type="number" />
      </template>
    </FormModal>

    <!-- Bulk Allocate Modal -->
    <v-dialog v-model="bulkModal.show" max-width="560" persistent>
      <v-card rounded="lg">
        <v-card-title class="pa-4">
          <v-icon color="primary" class="mr-2">mdi-upload</v-icon>
          Bulk Allocate Leave Balances
        </v-card-title>
        <v-card-text class="px-4">
          <p class="text-body-2 text-medium-emphasis mb-4">
            Allocate the same leave type and days to multiple employees at once.
          </p>
          <v-select v-model="bulkModal.leaveTypeId" label="Leave Type" :items="leaveTypeOptions" :rules="[v => !!v || 'Required']" />
          <v-text-field v-model.number="bulkModal.totalDays" label="Days to Allocate" type="number" />
          <v-text-field v-model.number="bulkModal.year" label="Year" type="number" />
          <v-select
            v-model="bulkModal.employeeIds"
            label="Employees"
            :items="employeeOptions"
            multiple
            chips
            closable-chips
          />
        </v-card-text>
        <v-card-actions class="pa-4 bg-surface-variant">
          <v-spacer />
          <v-btn variant="text" @click="bulkModal.show = false" class="text-none">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="leaveStore.isLoading"
            :disabled="!bulkModal.leaveTypeId || bulkModal.employeeIds.length === 0"
            @click="handleBulkAllocate"
            class="text-none"
          >
            Allocate ({{ bulkModal.employeeIds.length }})
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, computed } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import FormModal from '@/components/common/FormModal.vue'
import { useLeaveStore } from '@/store/leave.store'
import { useEmployeeStore } from '@/store/employee.store'

const leaveStore = useLeaveStore()
const employeeStore = useEmployeeStore()

const currentYear = new Date().getFullYear()

const headers = [
  { title: 'Employee', key: 'employee_id', align: 'start' as const },
  { title: 'Leave Type', key: 'leave_type' },
  { title: 'Total', key: 'total_days' },
  { title: 'Used', key: 'used_days' },
  { title: 'Pending', key: 'pending_days' },
  { title: 'Remaining', key: 'remaining' },
  { title: 'Year', key: 'year' },
]

// Leave service uses user_id (JWT sub) as employee_id, not the employee profile id
const employeeOptions = computed(() =>
  employeeStore.employees.map((e: any) => ({ title: `${e.first_name} ${e.last_name}`, value: e.user_id }))
)

const leaveTypeOptions = computed(() =>
  leaveStore.leaveTypes.map(lt => ({ title: lt.name, value: lt.id }))
)

const getEmployeeName = (id: string) => {
  const emp = employeeStore.employees.find((e: any) => e.user_id === id || e.id === id)
  return emp ? `${emp.first_name} ${emp.last_name}` : id
}

const allocateModal = reactive({ show: false, data: {} as any })
const bulkModal = reactive({
  show: false,
  leaveTypeId: '',
  totalDays: 12,
  year: currentYear,
  employeeIds: [] as string[],
})

const openAllocate = () => {
  allocateModal.data = { employee_id: '', leave_type_id: '', total_days: 12, year: currentYear }
  allocateModal.show = true
}

const openBulk = () => {
  bulkModal.leaveTypeId = ''
  bulkModal.totalDays = 12
  bulkModal.year = currentYear
  bulkModal.employeeIds = []
  bulkModal.show = true
}

const handleAllocate = async (formData: any) => {
  await leaveStore.createLeaveBalance(formData)
  allocateModal.show = false
}

const handleBulkAllocate = async () => {
  await leaveStore.bulkCreateLeaveBalances({
    leave_type_id: bulkModal.leaveTypeId,
    year: bulkModal.year,
    items: bulkModal.employeeIds.map(eid => ({
      employee_id: eid,
      total_days: bulkModal.totalDays,
    })),
  })
  bulkModal.show = false
}

onMounted(() => {
  if (leaveStore.leaveBalances.length === 0) leaveStore.fetchLeaveBalances()
  if (leaveStore.leaveTypes.length === 0) leaveStore.fetchLeaveTypes()
  if (employeeStore.employees.length === 0) employeeStore.fetchEmployees({ pageSize: 200 })
})
</script>

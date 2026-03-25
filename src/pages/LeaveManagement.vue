<template>
  <v-container fluid class="pa-4 pa-md-6">
    <PageHeader title="Leave Management" subtitle="Manage leave requests, types, balances, and calendar">
      <template #actions>
        <v-btn
          v-if="activeTab === 'requests'"
          color="primary"
          prepend-icon="mdi-calendar-plus"
          @click="openRequestModal"
          class="text-none"
        >
          Request Leave
        </v-btn>
      </template>
    </PageHeader>

    <TabLayout v-model="activeTab" :tabs="tabs">
      <!-- Requests Tab -->
      <template #requests>
        <!-- Balances Overview -->
        <v-row class="mb-4">
          <v-col v-for="balance in leaveStore.leaveBalances" :key="balance.id" cols="12" sm="6" md="3">
            <StatCard
              :title="balance.leave_type?.name || 'Leave'"
              :value="balance.total_days - balance.used_days"
              :subtitle="`${balance.used_days} used of ${balance.total_days}`"
              icon="mdi-calendar-check"
              :icon-color="(balance.total_days - balance.used_days) <= 2 ? 'error' : 'primary'"
            />
          </v-col>
        </v-row>

        <DataTable
          title="Leave Requests"
          :headers="headers"
          :items="leaveStore.leaveRequests"
          :total-items="leaveStore.totalRequests"
          :loading="leaveStore.isLoading"
          empty-icon="mdi-calendar-remove-outline"
          empty-title="No leave requests"
          empty-subtitle="Leave requests from your team will appear here."
          @update:options="onOptionsUpdate"
        >
          <template #item.employee_id="{ item }">{{ getEmployeeName(item.employee_id) }}</template>
          <template #item.leave_type_id="{ item }">{{ item.leave_type?.name || '—' }}</template>
          <template #item.dates="{ item }">
            <div class="text-body-2">{{ formatDate(item.start_date) }} - {{ formatDate(item.end_date) }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.total_days }} days</div>
          </template>
          <template #item.status="{ item }">
            <StatusChip :status="item.status" size="small" />
          </template>
          <template #item.actions="{ item }">
            <div v-if="item.status === 'PENDING' || item.status === 'pending'" class="d-flex ga-1">
              <v-btn icon="mdi-check" variant="text" color="success" size="small" @click="handleStatusUpdate(item.id, 'APPROVED')" />
              <v-btn icon="mdi-close" variant="text" color="error" size="small" @click="handleStatusUpdate(item.id, 'REJECTED')" />
            </div>
            <span v-else class="text-caption text-medium-emphasis">—</span>
          </template>
        </DataTable>
      </template>

      <!-- Leave Types Tab -->
      <template #types>
        <LeaveTypesTab />
      </template>

      <!-- Balances Tab -->
      <template #balances>
        <LeaveBalancesTab />
      </template>

      <!-- Calendar Tab -->
      <template #calendar>
        <LeaveCalendarTab />
      </template>
    </TabLayout>

    <!-- Request Leave Modal -->
    <FormModal
      v-model="modal.show"
      title="Request Leave"
      submit-text="Submit Request"
      :loading="leaveStore.isLoading"
      :initial-data="modal.data"
      @submit="handleRequestSubmit"
    >
      <template #default="{ formData }">
        <v-select
          v-model="formData.leave_type_id"
          :items="leaveStore.leaveTypes"
          item-title="name"
          item-value="id"
          label="Leave Type"
          :rules="[v => !!v || 'Required']"
        />
        <v-select v-model="formData.employee_id" label="Employee" :items="employeeOptions" :rules="[v => !!v || 'Required']" />
        <v-row dense>
          <v-col cols="6">
            <v-text-field v-model="formData.start_date" label="Start Date" type="date" :rules="[v => !!v || 'Required']" />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="formData.end_date" label="End Date" type="date" :rules="[v => !!v || 'Required']" />
          </v-col>
        </v-row>
        <v-textarea v-model="formData.reason" label="Reason for Leave" rows="3" />
      </template>
    </FormModal>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import FormModal from '@/components/common/FormModal.vue'
import TabLayout from '@/components/common/TabLayout.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import LeaveTypesTab from '@/components/leave/LeaveTypesTab.vue'
import LeaveBalancesTab from '@/components/leave/LeaveBalancesTab.vue'
import LeaveCalendarTab from '@/components/leave/LeaveCalendarTab.vue'
import { useLeaveStore } from '@/store/leave.store'
import { useEmployeeStore } from '@/store/employee.store'

const leaveStore = useLeaveStore()
const employeeStore = useEmployeeStore()

const activeTab = ref('requests')

const tabs = [
  { value: 'requests', label: 'Requests', icon: 'mdi-file-document-outline' },
  { value: 'types', label: 'Leave Types', icon: 'mdi-tag-outline' },
  { value: 'balances', label: 'Balances', icon: 'mdi-scale-balance' },
  { value: 'calendar', label: 'Calendar', icon: 'mdi-calendar-month' },
]

const headers = [
  { title: 'Employee', key: 'employee_id', align: 'start' as const },
  { title: 'Type', key: 'leave_type_id' },
  { title: 'Period', key: 'dates' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
]

const employeeOptions = computed(() =>
  employeeStore.employees.map((e: any) => ({ title: `${e.first_name} ${e.last_name}`, value: e.id }))
)

const modal = reactive({ show: false, data: {} as any })

onMounted(() => {
  leaveStore.fetchLeaveBalances()
  leaveStore.fetchLeaveTypes()
  leaveStore.fetchLeaveRequests()
  if (employeeStore.employees.length === 0) employeeStore.fetchEmployees({ pageSize: 100 })
})

const onOptionsUpdate = (options: any) => {
  leaveStore.fetchLeaveRequests({ page: options.page, pageSize: options.itemsPerPage })
}

const openRequestModal = () => {
  const today = new Date().toISOString().slice(0, 10)
  modal.data = { leave_type_id: null, employee_id: '', start_date: today, end_date: today, reason: '' }
  modal.show = true
}

const handleRequestSubmit = async (formData: any) => {
  await leaveStore.createLeaveRequest(formData)
  modal.show = false
}

const handleStatusUpdate = async (id: string, status: string) => {
  await leaveStore.updateLeaveStatus(id, status)
}

const getEmployeeName = (id: string) => {
  const emp = employeeStore.employees.find((e: any) => e.id === id)
  return emp ? `${emp.first_name} ${emp.last_name}` : id
}

const formatDate = (dateStr: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr))
  } catch { return dateStr }
}
</script>

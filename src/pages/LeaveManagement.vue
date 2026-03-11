<template>
  <v-container fluid class="pa-6 ga-6 d-flex flex-column">
    <!-- Balances Overview -->
    <v-row>
      <v-col v-for="balance in leaveStore.leaveBalances" :key="balance.id" cols="12" sm="6" md="3">
        <v-card rounded="lg" class="elevation-2 border-left-lg" :style="{ borderLeftColor: getStatusColor('approved') }">
          <v-card-text>
            <div class="text-overline mb-1">{{ balance.leave_type.name }}</div>
            <div class="d-flex align-end justify-space-between">
              <div>
                <span class="text-h4 font-weight-black">{{ balance.total_days - balance.used_days }}</span>
                <span class="text-caption text-grey ml-1">days left</span>
              </div>
              <div class="text-right">
                <div class="text-caption">Used: {{ balance.used_days }}</div>
                <div class="text-caption">Total: {{ balance.total_days }}</div>
              </div>
            </div>
            <v-progress-linear
              :model-value="(balance.used_days / balance.total_days) * 100"
              color="primary"
              height="6"
              rounded
              class="mt-3"
            ></v-progress-linear>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Content -->
    <DataTable
      title="Leave Requests"
      :headers="headers"
      :items="leaveStore.leaveRequests"
      :total-items="leaveStore.totalRequests"
      :loading="leaveStore.isLoading"
      @update:options="onOptionsUpdate"
    >
      <template #actions>
        <v-btn
          color="primary"
          prepend-icon="mdi-calendar-plus"
          @click="openRequestModal"
        >
          Request Leave
        </v-btn>
      </template>

      <template #item.employee_id="{ item }">
        {{ getEmployeeName(item.employee_id) }}
      </template>

      <template #item.leave_type_id="{ item }">
        {{ item.leave_type.name }}
      </template>

      <template #item.dates="{ item }">
        <div class="text-body-2">{{ formatDate(item.start_date) }} - {{ formatDate(item.end_date) }}</div>
        <div class="text-caption text-grey">{{ item.total_days }} days</div>
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

      <template #item.actions="{ item }">
        <div v-if="item.status === 'PENDING'" class="d-flex ga-1">
            <v-btn icon="mdi-check" variant="text" color="success" size="small" @click="handleStatusUpdate(item.id, 'APPROVED')"></v-btn>
            <v-btn icon="mdi-close" variant="text" color="error" size="small" @click="handleStatusUpdate(item.id, 'REJECTED')"></v-btn>
        </div>
        <v-btn v-else icon="mdi-information-outline" variant="text" color="grey" size="small"></v-btn>
      </template>
    </DataTable>

    <!-- Request Modal -->
    <FormModal
      v-model="modal.show"
      title="Request Leave"
      submit-text="Submit Request"
      :loading="leaveStore.isLoading"
      @submit="handleRequestSubmit"
    >
      <template #default="{ formData }">
        <v-select
          v-model="formData.leave_type_id"
          :items="leaveStore.leaveTypes"
          item-title="name"
          item-value="id"
          label="Leave Type"
          required
          :rules="[v => !!v || 'Leave type is required']"
        ></v-select>

        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="formData.start_date"
              label="Start Date"
              type="date"
              required
              :rules="[v => !!v || 'Start date is required']"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="formData.end_date"
              label="End Date"
              type="date"
              required
              :rules="[v => !!v || 'End date is required']"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-textarea
          v-model="formData.reason"
          label="Reason for Leave"
          rows="3"
        ></v-textarea>
        
         <v-text-field
            v-model="formData.employee_id"
            label="Employee ID (Temp)"
            required
            hint="Authenticated user ID"
        ></v-text-field>
      </template>
    </FormModal>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import FormModal from '@/components/common/FormModal.vue'
import { useLeaveStore } from '@/store/leave.store'
import { useEmployeeStore } from '@/store/employee.store'

const leaveStore = useLeaveStore()
const employeeStore = useEmployeeStore()

const headers = [
  { title: 'Employee', key: 'employee_id' },
  { title: 'Type', key: 'leave_type_id' },
  { title: 'Period', key: 'dates' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

const modal = reactive({
  show: false,
  data: {} as any
})

onMounted(() => {
  leaveStore.fetchLeaveBalances()
  leaveStore.fetchLeaveTypes()
  leaveStore.fetchLeaveRequests()
  if (employeeStore.employees.length === 0) {
    employeeStore.fetchEmployees({ pageSize: 100 })
  }
})

const onOptionsUpdate = (options: any) => {
  leaveStore.fetchLeaveRequests({
    page: options.page,
    pageSize: options.itemsPerPage
  })
}

const openRequestModal = () => {
    modal.data = {
        leave_type_id: null,
        start_date: new Date().toISOString().substr(0, 10),
        end_date: new Date().toISOString().substr(0, 10),
        reason: '',
        employee_id: ''
    }
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
  const emp = employeeStore.employees.find(e => e.id === id)
  return emp ? `${emp.first_name} ${emp.last_name}` : id
}

const formatDate = (dateStr: string) => {
    try {
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr))
    } catch {
        return dateStr
    }
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved': return 'success'
    case 'pending': return 'warning'
    case 'rejected': return 'error'
    default: return 'grey'
  }
}
</script>

<style scoped>
.border-left-lg {
  border-left: 6px solid transparent;
}
</style>

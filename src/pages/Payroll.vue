<template>
  <v-container fluid class="pa-4 pa-md-6">
    <PageHeader title="Payroll & Compensation" subtitle="Manage payroll runs, salary structures, and assignments">
      <template #actions>
        <v-btn v-if="activeTab === 'runs'" color="primary" prepend-icon="mdi-cash-plus" @click="openRunModal" class="text-none">
          Initiate Payroll Run
        </v-btn>
      </template>
    </PageHeader>

    <TabLayout v-model="activeTab" :tabs="tabs">
      <!-- Payroll Runs Tab -->
      <template #runs>
        <DataTable
          title="Payroll History"
          :headers="headers"
          :items="payrollStore.payrollRuns"
          :total-items="payrollStore.totalRuns"
          :loading="payrollStore.isLoading"
          @update:options="onOptionsUpdate"
        >
          <template #item.period="{ item }">
            {{ formatDate(item.period_start) }} - {{ formatDate(item.period_end) }}
          </template>
          <template #item.total_net="{ item }">
            <span class="font-weight-bold">{{ formatCurrency(item.total_net) }}</span>
          </template>
          <template #item.status="{ item }">
            <StatusChip :status="item.status" size="small" />
          </template>
          <template #item.actions="{ item }">
            <v-btn icon size="small" variant="text" color="primary" @click="viewPayslips(item.id)">
              <v-icon size="18">mdi-file-document-outline</v-icon>
              <v-tooltip activator="parent" location="top">View Payslips</v-tooltip>
            </v-btn>
          </template>
        </DataTable>
      </template>

      <!-- Salary Structures Tab -->
      <template #structures>
        <SalaryStructuresTab />
      </template>

      <!-- Salary Assignment Tab -->
      <template #assignment>
        <SalaryAssignmentTab />
      </template>
    </TabLayout>

    <!-- Run Modal -->
    <FormModal
      v-model="runModal.show"
      title="Initiate Payroll Run"
      submit-text="Process Payroll"
      :loading="payrollStore.isLoading"
      :initial-data="runModal.data"
      @submit="handleRunSubmit"
    >
      <template #default="{ formData }">
        <v-alert type="info" variant="tonal" class="mb-4 text-caption">
          Processing will calculate gross, net, and statutory deductions for all active employees.
        </v-alert>
        <v-row dense>
          <v-col cols="6">
            <v-text-field v-model="formData.period_start" label="Period Start" type="date" :rules="[v => !!v || 'Required']" />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="formData.period_end" label="Period End" type="date" :rules="[v => !!v || 'Required']" />
          </v-col>
        </v-row>
      </template>
    </FormModal>

    <!-- Payslip Viewer Dialog -->
    <v-dialog v-model="payslipDialog.show" max-width="800" scrollable>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center pa-4">
          <v-icon color="primary" class="mr-2">mdi-file-document-multiple</v-icon>
          Payslips
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" @click="payslipDialog.show = false" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-0">
          <v-table v-if="payrollStore.payslips.length > 0" density="compact" hover>
            <thead>
              <tr>
                <th>Employee</th>
                <th class="text-right">Gross</th>
                <th class="text-right">Deductions</th>
                <th class="text-right">Net</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="slip in payrollStore.payslips" :key="slip.id">
                <td>{{ getEmployeeName(slip.employee_id) }}</td>
                <td class="text-right">{{ formatCurrency(slip.gross) }}</td>
                <td class="text-right text-error">{{ formatCurrency(slip.total_deductions) }}</td>
                <td class="text-right font-weight-bold text-success">{{ formatCurrency(slip.net) }}</td>
              </tr>
            </tbody>
          </v-table>
          <EmptyState v-else icon="mdi-file-document-outline" title="No payslips" subtitle="No payslips generated for this run" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import FormModal from '@/components/common/FormModal.vue'
import TabLayout from '@/components/common/TabLayout.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SalaryStructuresTab from '@/components/payroll/SalaryStructuresTab.vue'
import SalaryAssignmentTab from '@/components/payroll/SalaryAssignmentTab.vue'
import { usePayrollStore } from '@/store/payroll.store'
import { useEmployeeStore } from '@/store/employee.store'

const payrollStore = usePayrollStore()
const employeeStore = useEmployeeStore()

const activeTab = ref('runs')

const tabs = [
  { value: 'runs', label: 'Payroll Runs', icon: 'mdi-cash-register' },
  { value: 'structures', label: 'Salary Structures', icon: 'mdi-file-tree' },
  { value: 'assignment', label: 'Salary Assignment', icon: 'mdi-account-cash' },
]

const headers = [
  { title: 'Period', key: 'period', align: 'start' as const },
  { title: 'Employees', key: 'total_employees' },
  { title: 'Total Net', key: 'total_net' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
]

const runModal = reactive({ show: false, data: {} as any })
const payslipDialog = reactive({ show: false })

onMounted(() => {
  payrollStore.fetchSalaryStructures()
  payrollStore.fetchPayrollRuns()
  if (employeeStore.employees.length === 0) employeeStore.fetchEmployees({ pageSize: 100 })
})

const onOptionsUpdate = (options: any) => {
  payrollStore.fetchPayrollRuns({ page: options.page, pageSize: options.itemsPerPage })
}

const openRunModal = () => {
  const now = new Date()
  runModal.data = {
    period_start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
    period_end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10),
  }
  runModal.show = true
}

const handleRunSubmit = async (formData: any) => {
  await payrollStore.createPayrollRun(formData)
  runModal.show = false
}

const viewPayslips = async (runId: string) => {
  await payrollStore.fetchPayslips(runId)
  payslipDialog.show = true
}

const getEmployeeName = (id: string) => {
  const emp = employeeStore.employees.find((e: any) => e.id === id)
  return emp ? `${emp.first_name} ${emp.last_name}` : id
}

const formatDate = (d: string) => new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(d))
const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0)
</script>

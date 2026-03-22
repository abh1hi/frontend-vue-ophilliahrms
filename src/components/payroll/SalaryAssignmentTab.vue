<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h3 class="text-h6 font-weight-bold">Salary Assignment</h3>
      <v-btn color="primary" variant="tonal" size="small" prepend-icon="mdi-account-cash" @click="openAssign" class="text-none">
        Assign Salary
      </v-btn>
    </div>

    <!-- Employee search + salary view -->
    <v-card rounded="lg" border class="mb-4 pa-4">
      <v-row dense align="center">
        <v-col cols="12" sm="6" md="4">
          <v-select
            v-model="selectedEmployee"
            label="Select Employee"
            :items="employeeOptions"
            clearable
            @update:model-value="loadSalaryInfo"
          />
        </v-col>
      </v-row>

      <div v-if="currentSalary" class="mt-4">
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <StatCard title="CTC" :value="formatCurrency(currentSalary.ctc)" icon="mdi-cash" icon-color="success" />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <StatCard title="Structure" :value="getStructureName(currentSalary.salary_structure_id)" icon="mdi-file-tree" icon-color="primary" />
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <StatCard title="Effective From" :value="formatDate(currentSalary.effective_from)" icon="mdi-calendar-start" icon-color="info" />
          </v-col>
        </v-row>

        <!-- Salary History -->
        <h4 class="text-subtitle-1 font-weight-bold mt-6 mb-3">Salary History</h4>
        <v-table v-if="salaryHistory.length > 0" density="compact" hover>
          <thead>
            <tr>
              <th>Structure</th>
              <th>CTC</th>
              <th>Effective From</th>
              <th>Effective To</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in salaryHistory" :key="record.id">
              <td>{{ getStructureName(record.salary_structure_id) }}</td>
              <td>{{ formatCurrency(record.ctc) }}</td>
              <td>{{ formatDate(record.effective_from) }}</td>
              <td>{{ record.effective_to ? formatDate(record.effective_to) : 'Current' }}</td>
            </tr>
          </tbody>
        </v-table>
        <p v-else class="text-body-2 text-medium-emphasis">No salary history found.</p>
      </div>

      <EmptyState v-if="!selectedEmployee" icon="mdi-account-search" title="Select an employee" subtitle="Choose an employee to view their salary details and history" />
    </v-card>

    <!-- Assign Salary Modal -->
    <FormModal
      v-model="assignModal.show"
      title="Assign Salary"
      submit-text="Assign"
      :loading="payrollStore.isLoading"
      :initial-data="assignModal.data"
      @submit="handleAssign"
    >
      <template #default="{ formData }">
        <v-select v-model="formData.employee_id" label="Employee" :items="employeeOptions" :rules="[v => !!v || 'Required']" />
        <v-select v-model="formData.salary_structure_id" label="Salary Structure" :items="structureOptions" :rules="[v => !!v || 'Required']" />
        <v-text-field v-model.number="formData.ctc" label="CTC (Annual)" type="number" prefix="$" :rules="[v => v > 0 || 'Must be > 0']" />
        <v-text-field v-model="formData.effective_from" label="Effective From" type="date" :rules="[v => !!v || 'Required']" />
      </template>
    </FormModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import FormModal from '@/components/common/FormModal.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { usePayrollStore } from '@/store/payroll.store'
import { useEmployeeStore } from '@/store/employee.store'
import type { EmployeeSalary } from '@/types/payroll.types'

const payrollStore = usePayrollStore()
const employeeStore = useEmployeeStore()

const selectedEmployee = ref<string | null>(null)
const currentSalary = ref<EmployeeSalary | null>(null)
const salaryHistory = ref<EmployeeSalary[]>([])

const employeeOptions = computed(() =>
  employeeStore.employees.map((e: any) => ({ title: `${e.first_name} ${e.last_name}`, value: e.id }))
)

const structureOptions = computed(() =>
  payrollStore.salaryStructures.map(s => ({ title: s.name, value: s.id }))
)

const getStructureName = (id: string) => {
  const s = payrollStore.salaryStructures.find(s => s.id === id)
  return s ? s.name : id
}

const loadSalaryInfo = async (employeeId: string | null) => {
  if (!employeeId) {
    currentSalary.value = null
    salaryHistory.value = []
    return
  }
  currentSalary.value = await payrollStore.fetchEmployeeSalary(employeeId)
  salaryHistory.value = await payrollStore.fetchSalaryHistory(employeeId)
}

const assignModal = reactive({ show: false, data: {} as any })

const openAssign = () => {
  assignModal.data = {
    employee_id: selectedEmployee.value || '',
    salary_structure_id: '',
    ctc: 0,
    effective_from: new Date().toISOString().slice(0, 10),
  }
  assignModal.show = true
}

const handleAssign = async (formData: any) => {
  await payrollStore.assignSalary(formData)
  assignModal.show = false
  if (selectedEmployee.value) loadSalaryInfo(selectedEmployee.value)
}

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
const formatDate = (d: string) => {
  try { return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d)) }
  catch { return d }
}

onMounted(() => {
  if (payrollStore.salaryStructures.length === 0) payrollStore.fetchSalaryStructures()
  if (employeeStore.employees.length === 0) employeeStore.fetchEmployees({ pageSize: 200 })
})
</script>

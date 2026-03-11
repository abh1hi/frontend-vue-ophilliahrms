<template>
  <v-container fluid class="pa-6 ga-6 d-flex flex-column">
    <div class="d-flex justify-space-between align-center">
       <h1 class="text-h4 font-weight-bold text-grey-darken-3">Payroll & Compensation</h1>
       <v-btn color="primary" prepend-icon="mdi-cash-plus" @click="openRunModal">
         Initiate Payroll Run
       </v-btn>
    </div>

    <v-row>
        <v-col cols="12" md="8">
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
                    <v-btn icon="mdi-file-download-outline" variant="text" color="primary" size="small" @click="viewPayslips(item.id)"></v-btn>
                </template>
            </DataTable>
        </v-col>

        <v-col cols="12" md="4">
            <v-card rounded="lg" class="elevation-2">
                <v-card-title>Salary Structures</v-card-title>
                <v-list>
                    <v-list-item v-for="struct in payrollStore.salaryStructures" :key="struct.id" :title="struct.name" :subtitle="`${struct.basic_pct}% Basic`">
                        <template #append>
                            <v-btn icon="mdi-pencil" variant="text" size="small"></v-btn>
                        </template>
                    </v-list-item>
                    <v-list-item v-if="payrollStore.salaryStructures.length === 0" class="text-center text-grey">
                        No active structures
                    </v-list-item>
                </v-list>
            </v-card>
        </v-col>
    </v-row>

    <!-- Run Modal -->
    <FormModal
        v-model="modal.show"
        title="Initiate Payroll Run"
        submit-text="Process Payroll"
        :loading="payrollStore.isLoading"
        @submit="handleRunSubmit"
    >
        <template #default="{ formData }">
            <v-alert type="info" variant="tonal" class="mb-4 text-caption">
                Processing will calculate gross, net, and statutory deductions for all active employees.
            </v-alert>
            <v-row>
                <v-col cols="12" sm="6">
                    <v-text-field
                        v-model="formData.period_start"
                        label="Period Start"
                        type="date"
                        required
                    ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                    <v-text-field
                        v-model="formData.period_end"
                        label="Period End"
                        type="date"
                        required
                    ></v-text-field>
                </v-col>
            </v-row>
        </template>
    </FormModal>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import FormModal from '@/components/common/FormModal.vue'
import { usePayrollStore } from '@/store/payroll.store'

const payrollStore = usePayrollStore()

const headers = [
  { title: 'Period', key: 'period', align: 'start' },
  { title: 'Employees', key: 'total_employees' },
  { title: 'Total Net', key: 'total_net' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

const modal = reactive({
  show: false,
  data: {} as any
})

onMounted(() => {
  payrollStore.fetchSalaryStructures()
  payrollStore.fetchPayrollRuns()
})

const onOptionsUpdate = (options: any) => {
  payrollStore.fetchPayrollRuns({
    page: options.page,
    pageSize: options.itemsPerPage
  })
}

const openRunModal = () => {
    modal.data = {
        period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().substr(0, 10),
        period_end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().substr(0, 10)
    }
    modal.show = true
}

const handleRunSubmit = async (formData: any) => {
    await payrollStore.createPayrollRun(formData)
    modal.show = false
}

const viewPayslips = (runId: string) => {
    console.log('Viewing payslips for run:', runId)
}

const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(dateStr))
}

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed': return 'success'
    case 'processing': return 'warning'
    case 'failed': return 'error'
    default: return 'grey'
  }
}
</script>

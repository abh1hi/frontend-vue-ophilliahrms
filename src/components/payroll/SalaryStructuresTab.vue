<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h3 class="text-h6 font-weight-bold">Salary Structures</h3>
      <v-btn color="primary" variant="tonal" size="small" prepend-icon="mdi-plus" @click="openCreate" class="text-none">
        Add Structure
      </v-btn>
    </div>

    <DataTable
      title=""
      :headers="headers"
      :items="payrollStore.salaryStructures"
      :total-items="payrollStore.salaryStructures.length"
      :loading="payrollStore.isLoading"
    >
      <template #item.basic_pct="{ item }">{{ item.basic_pct }}%</template>
      <template #item.hra_pct="{ item }">{{ item.hra_pct }}%</template>
      <template #item.allowances_pct="{ item }">{{ item.allowances_pct }}%</template>
      <template #item.pf_pct="{ item }">{{ item.pf_pct }}%</template>
      <template #item.esi_pct="{ item }">{{ item.esi_pct }}%</template>
      <template #item.professional_tax="{ item }">{{ formatCurrency(item.professional_tax) }}</template>

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
      :title="modal.isEdit ? 'Edit Structure' : 'Add Structure'"
      :submit-text="modal.isEdit ? 'Save' : 'Create'"
      :loading="payrollStore.isLoading"
      :initial-data="modal.data"
      @submit="handleSubmit"
    >
      <template #default="{ formData }">
        <v-text-field v-model="formData.name" label="Structure Name" :rules="[v => !!v || 'Required']" />
        <v-textarea v-model="formData.description" label="Description" rows="2" />
        <v-row dense>
          <v-col cols="6"><v-text-field v-model.number="formData.basic_pct" label="Basic %" type="number" suffix="%" /></v-col>
          <v-col cols="6"><v-text-field v-model.number="formData.hra_pct" label="HRA %" type="number" suffix="%" /></v-col>
          <v-col cols="6"><v-text-field v-model.number="formData.allowances_pct" label="Allowances %" type="number" suffix="%" /></v-col>
          <v-col cols="6"><v-text-field v-model.number="formData.pf_pct" label="PF %" type="number" suffix="%" /></v-col>
          <v-col cols="6"><v-text-field v-model.number="formData.esi_pct" label="ESI %" type="number" suffix="%" /></v-col>
          <v-col cols="6"><v-text-field v-model.number="formData.professional_tax" label="Prof. Tax" type="number" prefix="$" /></v-col>
        </v-row>
      </template>
    </FormModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import FormModal from '@/components/common/FormModal.vue'
import { usePayrollStore } from '@/store/payroll.store'
import type { SalaryStructure } from '@/types/payroll.types'

const payrollStore = usePayrollStore()

const headers = [
  { title: 'Name', key: 'name', align: 'start' as const },
  { title: 'Basic', key: 'basic_pct' },
  { title: 'HRA', key: 'hra_pct' },
  { title: 'Allowances', key: 'allowances_pct' },
  { title: 'PF', key: 'pf_pct' },
  { title: 'ESI', key: 'esi_pct' },
  { title: 'Prof Tax', key: 'professional_tax' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const },
]

const modal = reactive({ show: false, isEdit: false, editId: '', data: {} as any })

const openCreate = () => {
  modal.isEdit = false
  modal.data = { name: '', description: '', basic_pct: 40, hra_pct: 20, allowances_pct: 20, pf_pct: 12, esi_pct: 1.75, professional_tax: 200 }
  modal.show = true
}

const openEdit = (s: SalaryStructure) => {
  modal.isEdit = true
  modal.editId = s.id
  modal.data = { name: s.name, description: s.description || '', basic_pct: s.basic_pct, hra_pct: s.hra_pct, allowances_pct: s.allowances_pct, pf_pct: s.pf_pct, esi_pct: s.esi_pct, professional_tax: s.professional_tax }
  modal.show = true
}

const handleSubmit = async (formData: any) => {
  if (modal.isEdit) {
    await payrollStore.updateSalaryStructure(modal.editId, formData)
  } else {
    await payrollStore.createSalaryStructure(formData)
  }
  modal.show = false
}

const handleDelete = async (id: string) => {
  await payrollStore.deleteSalaryStructure(id)
}

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val)

onMounted(() => {
  if (payrollStore.salaryStructures.length === 0) payrollStore.fetchSalaryStructures()
})
</script>

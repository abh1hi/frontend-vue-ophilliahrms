<template>
  <v-container fluid class="pa-6">
    <DataTable
      title="Companies"
      :headers="headers"
      :items="companyStore.companies"
      :total-items="companyStore.totalCompanies"
      :loading="companyStore.isLoading"
      searchable
      @search="onSearch"
    >
      <template #actions>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateModal"
          class="mr-4"
        >
          Add Company
        </v-btn>
      </template>

      <template #item.is_active="{ item }">
        <v-chip :color="item.is_active ? 'success' : 'error'" size="small">
          {{ item.is_active ? 'Active' : 'Inactive' }}
        </v-chip>
      </template>
    </DataTable>

    <!-- Create Modal -->
    <FormModal
      v-model="modal.show"
      title="Add Company"
      submit-text="Create"
      :loading="companyStore.isLoading"
      :initial-data="modal.data"
      @submit="handleFormSubmit"
    >
      <template #default="{ formData }">
        <v-text-field
          v-model="formData.name"
          label="Company Name"
          required
          :rules="[v => !!v || 'Name is required']"
        ></v-text-field>
        <v-text-field
          v-model="formData.domain"
          label="Domain (optional)"
          hint="e.g. acme.com"
          persistent-hint
        ></v-text-field>
      </template>
    </FormModal>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import FormModal from '@/components/common/FormModal.vue'
import { useCompanyStore } from '@/store/company.store'

const companyStore = useCompanyStore()

const headers = [
  { title: 'Name', key: 'name', align: 'start' },
  { title: 'Domain', key: 'domain' },
  { title: 'Status', key: 'is_active' },
  { title: 'Created At', key: 'created_at' },
]

const modal = reactive({
  show: false,
  data: {} as any,
})

onMounted(() => {
  companyStore.fetchCompanies()
})

const onSearch = (query: string) => {
  console.log('Searching for:', query)
}

const openCreateModal = () => {
  modal.data = { name: '', domain: '' }
  modal.show = true
}

const handleFormSubmit = async (formData: any) => {
  await companyStore.createCompany(formData)
  modal.show = false
}
</script>

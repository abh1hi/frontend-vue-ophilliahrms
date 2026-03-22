<template>
  <v-container fluid class="pa-4 pa-md-6">
    <PageHeader title="Companies" subtitle="Manage registered companies and tenants">
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateModal" class="text-none">
          Add Company
        </v-btn>
      </template>
    </PageHeader>

    <DataTable
      title="Companies"
      :headers="headers"
      :items="filteredCompanies"
      :total-items="companyStore.totalCompanies"
      :loading="companyStore.isLoading"
      searchable
      @search="onSearch"
    >
      <template #item.is_active="{ item }">
        <StatusChip :status="item.is_active ? 'active' : 'inactive'" size="small" />
      </template>

      <template #item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template #item.actions="{ item }">
        <v-btn icon size="small" variant="text" color="primary" @click="openEditModal(item)">
          <v-icon size="18">mdi-pencil-outline</v-icon>
          <v-tooltip activator="parent" location="top">Edit</v-tooltip>
        </v-btn>
        <v-btn
          v-if="item.is_active"
          icon size="small" variant="text" color="error"
          @click="openDeactivateDialog(item)"
        >
          <v-icon size="18">mdi-close-circle-outline</v-icon>
          <v-tooltip activator="parent" location="top">Deactivate</v-tooltip>
        </v-btn>
      </template>
    </DataTable>

    <!-- Create / Edit Modal -->
    <FormModal
      v-model="modal.show"
      :title="modal.isEdit ? 'Edit Company' : 'Add Company'"
      :submit-text="modal.isEdit ? 'Save Changes' : 'Create'"
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

    <!-- Deactivate Confirmation Dialog -->
    <ConfirmDialog
      v-model="deactivateDialog.show"
      title="Deactivate Company"
      :message="`Are you sure you want to deactivate '${deactivateDialog.company?.name}'? This will disable access for all users in this company.`"
      confirm-text="Deactivate"
      confirm-color="error"
      icon="mdi-alert-circle-outline"
      :loading="companyStore.isLoading"
      @confirm="handleDeactivate"
    />
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import FormModal from '@/components/common/FormModal.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useCompanyStore } from '@/store/company.store'
import type { Company } from '@/types/company.types'

const companyStore = useCompanyStore()
const searchQuery = ref('')

const headers = [
  { title: 'Name', key: 'name', align: 'start' as const },
  { title: 'Domain', key: 'domain' },
  { title: 'Status', key: 'is_active' },
  { title: 'Created At', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const },
]

const filteredCompanies = computed(() => {
  if (!searchQuery.value) return companyStore.companies
  const q = searchQuery.value.toLowerCase()
  return companyStore.companies.filter(c =>
    c.name.toLowerCase().includes(q) || (c.domain && c.domain.toLowerCase().includes(q))
  )
})

const modal = reactive({
  show: false,
  isEdit: false,
  editId: '' as string,
  data: {} as any,
})

const deactivateDialog = reactive({
  show: false,
  company: null as Company | null,
})

onMounted(() => {
  companyStore.fetchCompanies()
})

const onSearch = (query: string) => {
  searchQuery.value = query
}

const openCreateModal = () => {
  modal.isEdit = false
  modal.editId = ''
  modal.data = { name: '', domain: '' }
  modal.show = true
}

const openEditModal = (company: Company) => {
  modal.isEdit = true
  modal.editId = company.id
  modal.data = { name: company.name, domain: company.domain || '' }
  modal.show = true
}

const handleFormSubmit = async (formData: any) => {
  if (modal.isEdit) {
    await companyStore.updateCompany(modal.editId, {
      name: formData.name,
      domain: formData.domain || undefined,
    })
  } else {
    await companyStore.createCompany(formData)
  }
  modal.show = false
}

const openDeactivateDialog = (company: Company) => {
  deactivateDialog.company = company
  deactivateDialog.show = true
}

const handleDeactivate = async () => {
  if (!deactivateDialog.company) return
  await companyStore.deleteCompany(deactivateDialog.company.id)
  deactivateDialog.show = false
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
</script>

<template>
  <div>
    <DataTable
      title="Employees"
      :headers="headers"
      :items="employeeStore.employees"
      :total-items="employeeStore.meta?.total_items || 0"
      :loading="employeeStore.isLoading"
      :searchable="true"
      @update:options="loadItems"
      @search="onSearch"
    >
      <template #actions>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Add Employee
        </v-btn>
      </template>
      
      <!-- Customizing the status column rendering -->
      <template v-slot:item.status="{ item }">
        <v-chip
          :color="getStatusColor(item.status)"
          size="small"
          class="text-uppercase font-weight-bold"
        >
          {{ item.status }}
        </v-chip>
      </template>
      
      <!-- Adding Action Buttons -->
      <template v-slot:item.actions="{ item }">
        <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="editItem(item)"></v-btn>
        <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="deleteItem(item.id)"></v-btn>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import { useEmployeeStore } from '../store/employee.store'
import type { Employee } from '../api/employee.api'

const employeeStore = useEmployeeStore()

const headers = [
  { title: 'First Name', key: 'first_name', align: 'start', sortable: true },
  { title: 'Last Name', key: 'last_name', align: 'start', sortable: true },
  { title: 'Email', key: 'email', align: 'start', sortable: true },
  { title: 'Status', key: 'status', align: 'center', sortable: true },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false },
]

const loadItems = async ({ page, itemsPerPage, sortBy }: any) => {
  // In a real implementation we would respect sortBy fields here
  await employeeStore.fetchEmployees({
    page,
    page_size: itemsPerPage > 0 ? itemsPerPage : undefined
  })
}

const onSearch = async (query: string) => {
  await employeeStore.fetchEmployees({ search: query, page: 1 })
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active': return 'success'
    case 'inactive': return 'warning'
    case 'terminated': return 'error'
    default: return 'grey'
  }
}

// Placeholder actions for CRUD operations
const openCreateDialog = () => {
    console.log("Open create employee dialog")
}

const editItem = (item: Employee) => {
    console.log("Editing", item.id)
}

const deleteItem = async (id: string) => {
   if (window.confirm('Are you sure you want to remove this employee?')) {
     await employeeStore.delete(id)
   }
}

onMounted(() => {
   // Initial load triggered automatically by v-data-table-server update:options
})
</script>

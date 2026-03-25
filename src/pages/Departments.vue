<template>
  <v-container fluid class="pa-6">
    <DataTable
      title="Departments"
      :headers="headers"
      :items="departmentStore.departments"
      :total-items="departmentStore.totalDepartments"
      :loading="departmentStore.isLoading"
      searchable
      empty-icon="mdi-office-building-outline"
      empty-title="No departments yet"
      empty-subtitle="Create departments to organize your team structure."
      @search="onSearch"
    >
      <template #actions>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateModal"
          class="mr-4"
        >
          Add Department
        </v-btn>
      </template>

      <template #item.manager_id="{ item }">
        <div v-if="item.manager_id" class="d-flex align-center">
           <v-avatar color="indigo-lighten-4" size="28" class="mr-2">
            <span class="text-caption font-weight-bold text-indigo">{{ getManagerInitials(item.manager_id) }}</span>
          </v-avatar>
          <span class="text-body-2">{{ getManagerName(item.manager_id) }}</span>
        </div>
        <span v-else class="text-caption text-grey italic">No Manager</span>
      </template>

      <template #item.actions="{ item }">
        <v-btn icon="mdi-pencil" variant="text" color="blue" @click="openEditModal(item)"></v-btn>
        <v-btn icon="mdi-delete" variant="text" color="red" @click="confirmDelete(item)"></v-btn>
      </template>
    </DataTable>

    <!-- Create/Edit Modal -->
    <FormModal
      v-model="modal.show"
      :title="modal.isEdit ? 'Edit Department' : 'Add Department'"
      :submit-text="modal.isEdit ? 'Update' : 'Create'"
      :loading="departmentStore.isLoading"
      :initial-data="modal.data"
      @submit="handleFormSubmit"
    >
      <template #default="{ formData }">
        <v-text-field
          v-model="formData.name"
          label="Department Name"
          required
          :rules="[v => !!v || 'Name is required']"
        ></v-text-field>
        <v-textarea
          v-model="formData.description"
          label="Description"
          rows="3"
        ></v-textarea>
        <v-select
          v-model="formData.manager_id"
          :items="employeeStore.employees"
          item-title="email"
          item-value="id"
          label="Department Manager"
          clearable
          hint="Select an employee to manage this department"
          persistent-hint
        >
          <template #item="{ props, item }">
            <v-list-item v-bind="props" :subtitle="item.raw.email">
              <template #prepend>
                <v-avatar size="24" color="grey-lighten-3" class="mr-2">
                  <span class="text-caption">{{ item.raw.first_name?.[0] }}{{ item.raw.last_name?.[0] }}</span>
                </v-avatar>
              </template>
              <v-list-item-title>{{ item.raw.first_name }} {{ item.raw.last_name }}</v-list-item-title>
            </v-list-item>
          </template>
        </v-select>
      </template>
    </FormModal>

    <!-- Delete Confirmation -->
    <v-dialog v-model="deleteDialog.show" max-width="400px">
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h6 text-center">Confirm Delete</v-card-title>
        <v-card-text class="text-center">
          Are you sure you want to delete <strong>{{ deleteDialog.item?.name }}</strong>?
        </v-card-text>
        <v-card-actions class="justify-center mt-4">
          <v-btn variant="text" @click="deleteDialog.show = false">Cancel</v-btn>
          <v-btn color="error" variant="elevated" @click="handleDeleteRequest">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import FormModal from '@/components/common/FormModal.vue'
import { useDepartmentStore } from '@/store/department.store'
import { useEmployeeStore } from '@/store/employee.store'

const departmentStore = useDepartmentStore()
const employeeStore = useEmployeeStore()

const headers = [
  { title: 'Name', key: 'name', align: 'start' },
  { title: 'Description', key: 'description' },
  { title: 'Manager', key: 'manager_id' },
  { title: 'Created At', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

const modal = reactive({
  show: false,
  isEdit: false,
  data: {} as any
})

const deleteDialog = reactive({
  show: false,
  item: null as any
})

onMounted(() => {
  departmentStore.fetchDepartments()
  employeeStore.fetchEmployees({ pageSize: 100 }) // Fetch employees for manager selection
})

const onSearch = (query: string) => {
  // Simple search filter or re-fetch from backend with search query if supported
  console.log('Searching for:', query)
}

const getManagerName = (managerId: string) => {
  const emp = employeeStore.employees.find(e => e.id === managerId)
  return emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown'
}

const getManagerInitials = (managerId: string) => {
  const emp = employeeStore.employees.find(e => e.id === managerId)
  return emp ? `${emp.first_name?.[0] || ''}${emp.last_name?.[0] || ''}`.toUpperCase() : '??'
}

const openCreateModal = () => {
  modal.isEdit = false
  modal.data = { name: '', description: '', manager_id: null }
  modal.show = true
}

const openEditModal = (item: any) => {
  modal.isEdit = true
  modal.data = { ...item }
  modal.show = true
}

const handleFormSubmit = async (formData: any) => {
  if (modal.isEdit) {
    await departmentStore.updateDepartment(formData.id, formData)
  } else {
    await departmentStore.createDepartment(formData)
  }
  modal.show = false
}

const confirmDelete = (item: any) => {
  deleteDialog.item = item
  deleteDialog.show = true
}

const handleDeleteRequest = async () => {
  if (deleteDialog.item) {
    await departmentStore.deleteDepartment(deleteDialog.item.id)
  }
  deleteDialog.show = false
}
</script>

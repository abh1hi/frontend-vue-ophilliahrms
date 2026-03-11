<template>
  <v-container fluid class="pa-6">
    <DataTable
      title="Employees"
      :headers="headers"
      :items="employeeStore.employees"
      :total-items="employeeStore.totalEmployees"
      :loading="employeeStore.isLoading"
      searchable
      @search="onSearch"
      @update:options="onOptionsUpdate"
    >
      <template #actions>
        <v-btn
          color="primary"
          prepend-icon="mdi-account-plus"
          @click="openCreateModal"
          class="mr-4"
        >
          Add Employee
        </v-btn>
      </template>

      <template #item.full_name="{ item }">
        <div class="d-flex align-center">
          <v-avatar color="grey-lighten-2" size="32" class="mr-3">
            <span class="text-caption font-weight-bold">{{ getInitials(item) }}</span>
          </v-avatar>
          <div>
            <div class="font-weight-medium">{{ item.first_name }} {{ item.last_name }}</div>
            <div class="text-caption text-grey">{{ item.email }}</div>
          </div>
        </div>
      </template>

      <template #item.employment_status="{ item }">
        <v-chip
          :color="getStatusColor(item.employment_status)"
          size="small"
          label
          class="text-uppercase font-weight-bold"
        >
          {{ item.employment_status }}
        </v-chip>
      </template>

      <template #item.actions="{ item }">
        <v-btn icon="mdi-pencil" variant="text" color="blue" @click="openEditModal(item)"></v-btn>
        <v-btn icon="mdi-delete" variant="text" color="red" @click="confirmDelete(item)"></v-btn>
      </template>
    </DataTable>

    <!-- Form Modal -->
    <FormModal
      v-model="modal.show"
      :title="modal.isEdit ? 'Edit Employee' : 'Register New Employee'"
      :submit-text="modal.isEdit ? 'Update' : 'Create'"
      :loading="employeeStore.isLoading"
      :initial-data="modal.data"
      @submit="handleFormSubmit"
    >
      <template #default="{ formData }">
        <v-row>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="formData.first_name"
              label="First Name"
              required
              :rules="[v => !!v || 'First name is required']"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="formData.last_name"
              label="Last Name"
              required
              :rules="[v => !!v || 'Last name is required']"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-text-field
          v-model="formData.email"
          label="Email Address"
          type="email"
          required
          :disabled="modal.isEdit"
          :rules="[v => !!v || 'Email is required']"
        ></v-text-field>

        <v-row>
          <v-col cols="12" sm="6">
            <v-select
              v-model="formData.department_id"
              :items="departmentStore.departments"
              item-title="name"
              item-value="id"
              label="Department"
            ></v-select>
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="formData.designation"
              label="Designation"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" sm="6" v-if="!modal.isEdit">
            <v-text-field
              v-model="formData.user_id"
              label="Auth User ID (Temporary)"
              required
              :rules="[v => !!v || 'User ID is required']"
              hint="In production, this would be auto-linked during user creation."
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" v-if="modal.isEdit">
             <v-select
              v-model="formData.employment_status"
              :items="['active', 'inactive', 'terminated']"
              label="Status"
            ></v-select>
          </v-col>
          <v-col cols="12" :sm="modal.isEdit ? 6 : 12">
            <v-text-field
              v-model="formData.date_joined"
              label="Date Joined"
              type="date"
              required
            ></v-text-field>
          </v-col>
        </v-row>
      </template>
    </FormModal>

    <!-- Delete Dialog -->
    <v-dialog v-model="deleteDialog.show" max-width="450px">
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h6 text-center">Deactivate Employee?</v-card-title>
        <v-card-text class="text-center">
          Are you sure you want to deactivate <strong>{{ deleteDialog.item?.first_name }} {{ deleteDialog.item?.last_name }}</strong>?<br>
          This will update their status to inactive.
        </v-card-text>
        <v-card-actions class="justify-center mt-4">
          <v-btn variant="text" @click="deleteDialog.show = false">Cancel</v-btn>
          <v-btn color="error" variant="elevated" @click="handleDeleteRequest">Deactivate</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import FormModal from '@/components/common/FormModal.vue'
import { useEmployeeStore } from '@/store/employee.store'
import { useDepartmentStore } from '@/store/department.store'

const employeeStore = useEmployeeStore()
const departmentStore = useDepartmentStore()

const headers = [
  { title: 'Employee', key: 'full_name', align: 'start' },
  { title: 'Department', key: 'department_id' },
  { title: 'Designation', key: 'designation' },
  { title: 'Status', key: 'employment_status' },
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
  employeeStore.fetchEmployees()
  departmentStore.fetchDepartments()
})

const onSearch = (query: string) => {
  employeeStore.fetchEmployees({ search: query, page: 1 })
}

const onOptionsUpdate = (options: any) => {
  employeeStore.fetchEmployees({
    page: options.page,
    pageSize: options.itemsPerPage
  })
}

const openCreateModal = () => {
  modal.isEdit = false
  modal.data = {
    first_name: '',
    last_name: '',
    email: '',
    date_joined: new Date().toISOString().substr(0, 10),
    department_id: null,
    designation: '',
    user_id: ''
  }
  modal.show = true
}

const openEditModal = (item: any) => {
  modal.isEdit = true
  modal.data = { ...item }
  modal.show = true
}

const handleFormSubmit = async (formData: any) => {
  if (modal.isEdit) {
    await employeeStore.updateEmployee(formData.id, formData)
  } else {
    await employeeStore.createEmployee(formData)
  }
  modal.show = false
}

const confirmDelete = (item: any) => {
  deleteDialog.item = item
  deleteDialog.show = true
}

const handleDeleteRequest = async () => {
  if (deleteDialog.item) {
    await employeeStore.deleteEmployee(deleteDialog.item.id)
  }
  deleteDialog.show = false
}

const getInitials = (item: any) => {
  return `${item.first_name?.[0] || ''}${item.last_name?.[0] || ''}`.toUpperCase()
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'success'
    case 'inactive': return 'warning'
    case 'terminated': return 'error'
    default: return 'grey'
  }
}
</script>

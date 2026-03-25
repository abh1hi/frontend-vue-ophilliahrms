<template>
  <v-container fluid class="pa-6">
    <DataTable
      title="Employees"
      :headers="headers"
      :items="employeeStore.employees"
      :total-items="employeeStore.totalEmployees"
      :loading="employeeStore.isLoading"
      searchable
      empty-icon="mdi-account-group-outline"
      empty-title="No employees yet"
      empty-subtitle="Add your first employee to get started with workforce management."
      @search="onSearch"
      @update:options="onOptionsUpdate"
    >
      <template #actions>
        <v-btn color="secondary" variant="tonal" prepend-icon="mdi-upload" class="mr-2 text-none" @click="showBulkImport = true">
          Bulk Import
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-account-plus" class="mr-4" @click="openCreateModal">
          Add Employee
        </v-btn>
      </template>

      <!-- Name column -->
      <template #item.full_name="{ item }">
        <div class="d-flex align-center" style="cursor:pointer" @click="openDrawer(item)">
          <v-avatar :color="item.staff_photo_url ? undefined : 'blue-darken-2'" size="36" class="mr-3">
            <v-img v-if="item.staff_photo_url" :src="item.staff_photo_url" />
            <span v-else class="text-caption font-weight-bold text-white">{{ initials(item) }}</span>
          </v-avatar>
          <div>
            <div class="font-weight-medium">{{ item.first_name }} {{ item.last_name }}</div>
            <div class="text-caption text-grey">{{ item.email }}</div>
          </div>
        </div>
      </template>

      <!-- Status chip -->
      <template #item.employment_status="{ item }">
        <v-chip :color="statusColor(item.employment_status)" size="small" label class="text-uppercase font-weight-bold">
          {{ item.employment_status }}
        </v-chip>
      </template>

      <!-- Row actions -->
      <template #item.actions="{ item }">
        <v-tooltip text="View" location="top">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-eye" variant="text" color="teal" @click="openDrawer(item)" />
          </template>
        </v-tooltip>
        <v-tooltip text="Edit" location="top">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-pencil" variant="text" color="blue" @click="openEditModal(item)" />
          </template>
        </v-tooltip>
        <v-tooltip text="Deactivate" location="top">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-account-off" variant="text" color="red" @click="confirmDeactivate(item)" />
          </template>
        </v-tooltip>
      </template>
    </DataTable>

    <!-- ── Create / Edit Form ──────────────────────────────────────────── -->
    <EmployeeForm
      v-model="formModal.show"
      :is-edit="formModal.isEdit"
      :initial-data="formModal.data"
      :loading="employeeStore.isLoading"
      :departments="departmentStore.departments"
      @submit="handleFormSubmit"
    />

    <!-- ── Employee Detail Drawer ──────────────────────────────────────── -->
    <EmployeeDetailDrawer
      v-model="drawerShow"
      :employee="drawerEmployee"
      @edit="onDrawerEdit"
      @deactivate="onDrawerDeactivate"
    />

    <!-- ── Deactivate Confirm Dialog ───────────────────────────────────── -->
    <v-dialog v-model="deactivateDialog.show" max-width="450px">
      <v-card rounded="lg" class="pa-4">
        <v-card-title class="text-h6 text-center">Deactivate Employee?</v-card-title>
        <v-card-text class="text-center">
          Are you sure you want to deactivate
          <strong>{{ deactivateDialog.item?.first_name }} {{ deactivateDialog.item?.last_name }}</strong>?
        </v-card-text>
        <v-card-actions class="justify-center mt-2">
          <v-btn variant="text" @click="deactivateDialog.show = false">Cancel</v-btn>
          <v-btn color="error" variant="elevated" @click="handleDeactivate">Deactivate</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <BulkImportDialog v-model="showBulkImport" />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import DataTable            from '@/components/common/DataTable.vue'
import EmployeeForm         from '@/components/common/EmployeeForm.vue'
import EmployeeDetailDrawer from '@/components/employee/EmployeeDetailDrawer.vue'
import BulkImportDialog     from '@/components/employee/BulkImportDialog.vue'
import { useEmployeeStore }   from '@/store/employee.store'
import { useDepartmentStore } from '@/store/department.store'
import { useAuthStore }       from '@/store/auth.store'
import apiClient              from '@/utils/api-client'
import type { Employee } from '@/types/employee.types'

const showBulkImport  = ref(false)
const employeeStore   = useEmployeeStore()
const departmentStore = useDepartmentStore()
const authStore       = useAuthStore()

// ── Table headers ────────────────────────────────────────────────────────────
const headers = [
  { title: 'Employee',    key: 'full_name',          align: 'start'  as const, sortable: false },
  { title: 'Designation', key: 'designation' },
  { title: 'Department',  key: 'department_id' },
  { title: 'Project',     key: 'project' },
  { title: 'Status',      key: 'employment_status',  align: 'center' as const },
  { title: 'Actions',     key: 'actions',            sortable: false, align: 'end' as const },
]

// ── Form modal state ─────────────────────────────────────────────────────────
const formModal = reactive({
  show: false,
  isEdit: false,
  data: {} as any,
})

// ── Detail drawer state ──────────────────────────────────────────────────────
const drawerShow     = ref(false)
const drawerEmployee = ref<Employee | null>(null)

// ── Deactivate dialog state ──────────────────────────────────────────────────
const deactivateDialog = reactive({
  show: false,
  item: null as Employee | null,
})

// ── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  employeeStore.fetchEmployees()
  departmentStore.fetchDepartments()
})

// ── Event handlers ───────────────────────────────────────────────────────────
const onSearch = (q: string) => employeeStore.fetchEmployees({ search: q, page: 1 })

const onOptionsUpdate = (opts: any) =>
  employeeStore.fetchEmployees({ page: opts.page, pageSize: opts.itemsPerPage })

const openCreateModal = () => {
  formModal.isEdit = false
  formModal.data   = {
    first_name: '', last_name: '', email: '',
    date_joined:  new Date().toISOString().substring(0, 10),
    department_id: null, designation: '', user_id: '',
    _initial_password: '',
  }
  formModal.show = true
}

const openEditModal = (item: Employee) => {
  formModal.isEdit = true
  formModal.data   = { ...item }
  formModal.show   = true
}

const openDrawer = (item: Employee) => {
  drawerEmployee.value = item
  drawerShow.value     = true
}

const onDrawerEdit = (emp: Employee) => {
  drawerShow.value = false
  openEditModal(emp)
}

const onDrawerDeactivate = (emp: Employee) => {
  drawerShow.value = false
  confirmDeactivate(emp)
}

const handleFormSubmit = async (data: any) => {
  if (formModal.isEdit) {
    await employeeStore.updateEmployee(data.id, data)
  } else {
    // Step 1: Create the auth account so we get a valid user UUID
    const { _initial_password, ...empData } = data
    const authUser: any = await apiClient.post('/auth/register', {
      email: empData.email,
      password: _initial_password,
      role: empData.role || 'employee',
      company_id: authStore.user?.company_id || undefined,
    })
    empData.user_id = authUser.id ?? authUser.data?.id

    // Step 2: Create the employee profile linked to the new auth user
    await employeeStore.createEmployee(empData)
  }
  formModal.show = false
}

const confirmDeactivate = (item: Employee) => {
  deactivateDialog.item = item
  deactivateDialog.show = true
}

const handleDeactivate = async () => {
  if (deactivateDialog.item) {
    await employeeStore.deleteEmployee(deactivateDialog.item.id)
  }
  deactivateDialog.show = false
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const initials = (item: any) =>
  `${item.first_name?.[0] || ''}${item.last_name?.[0] || ''}`.toUpperCase()

const statusColor = (status: string) => {
  const map: Record<string, string> = {
    active: 'success', on_leave: 'info', inactive: 'warning', terminated: 'error',
  }
  return map[status] ?? 'grey'
}
</script>

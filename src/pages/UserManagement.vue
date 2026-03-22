<template>
  <v-container fluid class="pa-4 pa-md-6">
    <PageHeader title="User Management" subtitle="Manage system users and their roles">
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-account-plus" @click="openCreateModal" class="text-none">
          Create User
        </v-btn>
      </template>
    </PageHeader>

    <DataTable
      title="Users"
      :headers="headers"
      :items="userStore.users"
      :total-items="userStore.totalUsers"
      :loading="userStore.isLoading"
      searchable
      @search="onSearch"
    >
      <template #item.role="{ item }">
        <StatusChip
          :status="item.role"
          :color-map="roleColorMap"
          :label-map="roleLabelMap"
          size="small"
        />
      </template>

      <template #item.is_active="{ item }">
        <StatusChip :status="item.is_active ? 'active' : 'inactive'" size="small" />
      </template>

      <template #item.created_at="{ item }">
        {{ formatDate(item.created_at) }}
      </template>

      <template #item.actions="{ item }">
        <v-btn
          icon="mdi-account-edit-outline"
          size="small"
          variant="text"
          color="primary"
          @click="openRoleDialog(item)"
        >
          <v-icon size="18">mdi-account-edit-outline</v-icon>
          <v-tooltip activator="parent" location="top">Change Role</v-tooltip>
        </v-btn>
      </template>
    </DataTable>

    <!-- Create User Modal -->
    <FormModal
      v-model="createModal.show"
      title="Create New User"
      submit-text="Create User"
      :loading="userStore.isLoading"
      :initial-data="createModal.data"
      @submit="handleCreateUser"
    >
      <template #default="{ formData }">
        <v-text-field
          v-model="formData.email"
          label="Email Address"
          type="email"
          prepend-inner-icon="mdi-email-outline"
          :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Must be a valid email']"
        ></v-text-field>

        <v-text-field
          v-model="formData.password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
          hint="Min 10 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char"
          persistent-hint
          :rules="[v => !!v || 'Password is required', v => v.length >= 10 || 'Min 10 characters']"
        ></v-text-field>

        <v-select
          v-model="formData.role"
          label="Role"
          :items="roleOptions"
          prepend-inner-icon="mdi-shield-account-outline"
          :rules="[v => !!v || 'Role is required']"
        ></v-select>

        <v-select
          v-if="companies.length > 0"
          v-model="formData.company_id"
          label="Company"
          :items="companyOptions"
          prepend-inner-icon="mdi-domain"
          clearable
        ></v-select>
      </template>
    </FormModal>

    <!-- Role Change Dialog -->
    <v-dialog v-model="roleDialog.show" max-width="420" persistent>
      <v-card rounded="lg">
        <v-card-title class="d-flex align-center pa-4">
          <v-icon color="primary" class="mr-2">mdi-account-edit</v-icon>
          Change User Role
        </v-card-title>
        <v-card-text class="px-4">
          <p class="text-body-2 text-medium-emphasis mb-4">
            Changing role for <strong>{{ roleDialog.user?.email }}</strong>
          </p>
          <v-select
            v-model="roleDialog.newRole"
            label="New Role"
            :items="roleOptions"
            prepend-inner-icon="mdi-shield-account-outline"
          ></v-select>
        </v-card-text>
        <v-card-actions class="pa-4 bg-surface-variant">
          <v-spacer />
          <v-btn variant="text" @click="roleDialog.show = false" class="text-none">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="handleRoleUpdate"
            :loading="userStore.isLoading"
            :disabled="!roleDialog.newRole || roleDialog.newRole === roleDialog.user?.role"
            class="text-none"
          >
            Update Role
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import FormModal from '@/components/common/FormModal.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import { useUserStore } from '@/store/user.store'
import { useCompanyStore } from '@/store/company.store'
import type { User, UserRole } from '@/types/user.types'

const userStore = useUserStore()
const companyStore = useCompanyStore()

const showPassword = ref(false)

const headers = [
  { title: 'Email', key: 'email', align: 'start' as const },
  { title: 'Role', key: 'role' },
  { title: 'Status', key: 'is_active' },
  { title: 'Created', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const },
]

const roleColorMap: Record<string, string> = {
  super_admin: 'deep-purple',
  hr: 'teal',
  manager: 'amber-darken-2',
  employee: 'blue-grey',
}

const roleLabelMap: Record<string, string> = {
  super_admin: 'Super Admin',
  hr: 'HR Manager',
  manager: 'Manager',
  employee: 'Employee',
}

const roleOptions = [
  { title: 'Super Admin', value: 'super_admin' },
  { title: 'HR Manager', value: 'hr' },
  { title: 'Manager', value: 'manager' },
  { title: 'Employee', value: 'employee' },
]

const companies = computed(() => companyStore.companies)
const companyOptions = computed(() =>
  companies.value.map(c => ({ title: c.name, value: c.id }))
)

// Create modal
const createModal = reactive({
  show: false,
  data: {} as any,
})

const openCreateModal = () => {
  createModal.data = { email: '', password: '', role: 'employee', company_id: null }
  showPassword.value = false
  createModal.show = true
}

const handleCreateUser = async (formData: any) => {
  const payload: any = {
    email: formData.email,
    password: formData.password,
    role: formData.role,
  }
  if (formData.company_id) {
    payload.company_id = formData.company_id
  }
  await userStore.createUser(payload)
  createModal.show = false
}

// Role dialog
const roleDialog = reactive({
  show: false,
  user: null as User | null,
  newRole: '' as UserRole | '',
})

const openRoleDialog = (user: User) => {
  roleDialog.user = user
  roleDialog.newRole = user.role
  roleDialog.show = true
}

const handleRoleUpdate = async () => {
  if (!roleDialog.user || !roleDialog.newRole) return
  await userStore.updateUserRole(roleDialog.user.id, roleDialog.newRole as UserRole)
  roleDialog.show = false
}

const onSearch = (query: string) => {
  // Client-side filter — backend doesn't have search param yet
  if (!query) {
    userStore.fetchUsers()
    return
  }
  const q = query.toLowerCase()
  userStore.users = userStore.users.filter(u =>
    u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
  )
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

onMounted(() => {
  userStore.fetchUsers()
  companyStore.fetchCompanies()
})
</script>

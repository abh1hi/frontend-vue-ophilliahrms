<template>
  <v-container fluid class="pa-6">
    <DataTable
      title="Student Enrollment"
      :headers="headers"
      :items="studentStore.students"
      :total-items="studentStore.totalStudents"
      :loading="studentStore.isLoading"
      searchable
      @search="onSearch"
      @update:options="onOptionsUpdate"
    >
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-account-plus" @click="openEnrollModal">
          Enroll Student
        </v-btn>
      </template>

      <!-- Name column -->
      <template #item.name="{ item }">
        <div class="d-flex align-center ga-2">
          <v-avatar color="primary" variant="tonal" size="32">
            <span class="text-caption font-weight-bold text-primary">{{ item.first_name[0] }}{{ item.last_name[0] }}</span>
          </v-avatar>
          <div>
            <div class="font-weight-medium">{{ item.first_name }} {{ item.last_name }}</div>
            <div v-if="item.email" class="text-caption text-medium-emphasis">{{ item.email }}</div>
          </div>
        </div>
      </template>

      <!-- Class column -->
      <template #item.class_id="{ item }">
        <v-chip v-if="item.class_id" size="small" variant="outlined" color="secondary">
          {{ getClassName(item.class_id) }}
        </v-chip>
        <span v-else class="text-caption text-medium-emphasis">Unassigned</span>
      </template>

      <!-- Status column -->
      <template #item.status="{ item }">
        <StatusChip :status="item.status" />
      </template>

      <!-- Actions -->
      <template #item.actions="{ item }">
        <v-tooltip text="Guardians" location="top">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-account-child" variant="text" color="teal" size="small" @click="openGuardians(item)" />
          </template>
        </v-tooltip>
        <v-tooltip text="Edit" location="top">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-pencil" variant="text" color="blue" size="small" @click="openEditModal(item)" />
          </template>
        </v-tooltip>
        <v-menu>
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-swap-horizontal" variant="text" color="orange" size="small" />
          </template>
          <v-list density="compact">
            <v-list-subheader>Change Status</v-list-subheader>
            <v-list-item
              v-for="s in statusOptions.filter(o => o !== item.status)"
              :key="s"
              @click="handleStatusChange(item, s)"
            >
              <template #prepend>
                <StatusChip :status="s" size="x-small" />
              </template>
              <v-list-item-title class="text-capitalize ml-2">{{ s }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-tooltip text="Delete" location="top">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-delete" variant="text" color="red" size="small" @click="confirmDelete(item)" />
          </template>
        </v-tooltip>
      </template>
    </DataTable>

    <!-- Enroll / Edit Modal -->
    <FormModal
      v-model="formModal.show"
      :title="formModal.isEdit ? 'Edit Student' : 'Enroll New Student'"
      :submit-text="formModal.isEdit ? 'Update' : 'Enroll'"
      :loading="studentStore.isLoading"
      :initial-data="formModal.data"
      @submit="handleFormSubmit"
    >
      <template #default="{ formData }">
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field v-model="formData.student_number" label="Student Number" :disabled="formModal.isEdit" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="formData.first_name" label="First Name" :rules="[v => !!v || 'Required']" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="formData.last_name" label="Last Name" :rules="[v => !!v || 'Required']" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="6">
            <v-select
              v-model="formData.class_id"
              :items="studentStore.classes"
              item-title="name"
              item-value="id"
              label="Assign Class"
              clearable
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="formData.gender"
              :items="['male', 'female', 'other']"
              label="Gender"
              :rules="[v => !!v || 'Required']"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="formData.date_of_birth" label="Date of Birth" type="date" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="formData.email" label="Email (Optional)" />
          </v-col>
        </v-row>
        <v-text-field v-model="formData.phone" label="Phone (Optional)" />
        <v-textarea v-model="formData.address" label="Home Address" rows="2" />
      </template>
    </FormModal>

    <!-- Guardian Panel -->
    <GuardianPanel
      v-model="guardianPanel.show"
      :student="guardianPanel.student"
    />

    <!-- Delete Confirm -->
    <ConfirmDialog
      v-model="deleteDialog.show"
      title="Delete Student"
      :message="`Are you sure you want to permanently delete ${deleteDialog.item?.first_name} ${deleteDialog.item?.last_name}? This action cannot be undone.`"
      confirm-text="Delete"
      confirm-color="error"
      @confirm="handleDelete"
    />
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import FormModal from '@/components/common/FormModal.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import GuardianPanel from '@/components/student/GuardianPanel.vue'
import { useStudentStore } from '@/store/student.store'
import type { Student } from '@/types/api.types'

const studentStore = useStudentStore()

const statusOptions = ['active', 'inactive', 'withdrawn', 'graduated']

const headers = [
  { title: 'Student Number', key: 'student_number' },
  { title: 'Name', key: 'name', sortable: false },
  { title: 'Class', key: 'class_id' },
  { title: 'Gender', key: 'gender' },
  { title: 'Status', key: 'status', align: 'center' as const },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
]

// ── Form modal ────────────────────────────────────────────────────────────────
const formModal = reactive({
  show: false,
  isEdit: false,
  data: {} as any,
})

// ── Guardian panel ────────────────────────────────────────────────────────────
const guardianPanel = reactive({
  show: false,
  student: null as Student | null,
})

// ── Delete dialog ─────────────────────────────────────────────────────────────
const deleteDialog = reactive({
  show: false,
  item: null as Student | null,
})

// ── Search ────────────────────────────────────────────────────────────────────
const searchQuery = ref('')
const onSearch = (q: string) => {
  searchQuery.value = q
  studentStore.fetchStudents({ search: q, page: 1 })
}

onMounted(() => {
  studentStore.fetchStudents()
  studentStore.fetchClasses()
})

const onOptionsUpdate = (opts: any) => {
  studentStore.fetchStudents({
    page: opts.page,
    page_size: opts.itemsPerPage,
    search: searchQuery.value || undefined,
  })
}

const openEnrollModal = () => {
  formModal.isEdit = false
  formModal.data = {
    student_number: `ST-${Date.now().toString().slice(-6)}`,
    first_name: '',
    last_name: '',
    gender: 'male',
    date_of_birth: '2015-01-01',
    class_id: null,
    status: 'active',
    email: '',
    phone: '',
    address: '',
  }
  formModal.show = true
}

const openEditModal = (item: Student) => {
  formModal.isEdit = true
  formModal.data = { ...item }
  formModal.show = true
}

const handleFormSubmit = async (data: any) => {
  if (formModal.isEdit) {
    await studentStore.updateStudent(data.id, data)
  } else {
    await studentStore.createStudent(data)
  }
  formModal.show = false
}

const handleStatusChange = async (item: Student, newStatus: string) => {
  await studentStore.changeStudentStatus(item.id, { status: newStatus as any })
}

const openGuardians = (item: Student) => {
  guardianPanel.student = item
  guardianPanel.show = true
}

const confirmDelete = (item: Student) => {
  deleteDialog.item = item
  deleteDialog.show = true
}

const handleDelete = async () => {
  if (deleteDialog.item) {
    await studentStore.deleteStudent(deleteDialog.item.id)
  }
  deleteDialog.show = false
}

const getClassName = (id: string) => {
  const cls = studentStore.classes.find(c => c.id === id)
  return cls ? cls.name : 'Unknown'
}
</script>

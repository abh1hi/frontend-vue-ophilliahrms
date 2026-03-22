<template>
  <v-container fluid class="pa-6">
    <DataTable
      title="Classes & Academic Sections"
      :headers="headers"
      :items="studentStore.classes"
      :total-items="studentStore.totalClasses"
      :loading="studentStore.isLoading"
      searchable
      @search="onSearch"
      @update:options="onOptionsUpdate"
    >
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateModal">
          Create Class
        </v-btn>
      </template>

      <template #item.capacity="{ item }">
        <div class="d-flex align-center ga-2">
          <v-progress-linear
            :model-value="60"
            color="secondary"
            height="8"
            rounded
            style="width: 100px"
          />
          <span class="text-caption">{{ item.capacity }} max</span>
        </div>
      </template>

      <template #item.actions="{ item }">
        <v-tooltip text="Edit" location="top">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-pencil" variant="text" color="blue" size="small" @click="openEditModal(item)" />
          </template>
        </v-tooltip>
        <v-tooltip text="Delete" location="top">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-delete" variant="text" color="red" size="small" @click="confirmDelete(item)" />
          </template>
        </v-tooltip>
      </template>
    </DataTable>

    <!-- Create / Edit Modal -->
    <FormModal
      v-model="formModal.show"
      :title="formModal.isEdit ? 'Edit Class' : 'Create Class'"
      :submit-text="formModal.isEdit ? 'Update' : 'Create'"
      :loading="studentStore.isLoading"
      :initial-data="formModal.data"
      @submit="handleFormSubmit"
    >
      <template #default="{ formData }">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="formData.name" label="Class Name" :rules="[v => !!v || 'Required']" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model.number="formData.grade_level" label="Grade Level" type="number" :rules="[v => v != null || 'Required']" />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field v-model="formData.section" label="Section" :rules="[v => !!v || 'Required']" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="formData.academic_year" label="Academic Year" placeholder="2025-2026" :rules="[v => !!v || 'Required']" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model.number="formData.capacity" label="Max Capacity" type="number" :rules="[v => v > 0 || 'Must be > 0']" />
          </v-col>
        </v-row>
      </template>
    </FormModal>

    <!-- Delete Confirm -->
    <ConfirmDialog
      v-model="deleteDialog.show"
      title="Delete Class"
      :message="`Are you sure you want to delete class '${deleteDialog.item?.name}'? Students in this class will be unassigned.`"
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
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useStudentStore } from '@/store/student.store'
import type { SchoolClass } from '@/types/api.types'

const studentStore = useStudentStore()

const headers = [
  { title: 'Class Name', key: 'name', align: 'start' as const },
  { title: 'Grade', key: 'grade_level' },
  { title: 'Section', key: 'section' },
  { title: 'Academic Year', key: 'academic_year' },
  { title: 'Capacity', key: 'capacity' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
]

const formModal = reactive({
  show: false,
  isEdit: false,
  data: {} as any,
})

const deleteDialog = reactive({
  show: false,
  item: null as SchoolClass | null,
})

const searchQuery = ref('')
const onSearch = (q: string) => {
  searchQuery.value = q
  studentStore.fetchClasses({ search: q })
}

onMounted(() => {
  studentStore.fetchClasses()
})

const onOptionsUpdate = (opts: any) => {
  studentStore.fetchClasses({
    page: opts.page,
    page_size: opts.itemsPerPage,
  })
}

const openCreateModal = () => {
  formModal.isEdit = false
  formModal.data = {
    name: '',
    grade_level: 1,
    section: 'A',
    academic_year: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    capacity: 30,
  }
  formModal.show = true
}

const openEditModal = (item: SchoolClass) => {
  formModal.isEdit = true
  formModal.data = { ...item }
  formModal.show = true
}

const handleFormSubmit = async (data: any) => {
  if (formModal.isEdit) {
    await studentStore.updateClass(data.id, data)
  } else {
    await studentStore.createClass(data)
  }
  formModal.show = false
}

const confirmDelete = (item: SchoolClass) => {
  deleteDialog.item = item
  deleteDialog.show = true
}

const handleDelete = async () => {
  if (deleteDialog.item) {
    await studentStore.deleteClass(deleteDialog.item.id)
  }
  deleteDialog.show = false
}
</script>

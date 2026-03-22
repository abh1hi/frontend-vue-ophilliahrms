<template>
  <v-dialog v-model="dialogModel" max-width="700" persistent>
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon color="teal" class="mr-2">mdi-account-child</v-icon>
        Guardians — {{ student?.first_name }} {{ student?.last_name }}
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="dialogModel = false" />
      </v-card-title>
      <v-divider />

      <v-card-text class="pa-4">
        <!-- Guardian List -->
        <v-list v-if="studentStore.guardians.length > 0" density="compact" class="pa-0">
          <v-list-item
            v-for="g in studentStore.guardians"
            :key="g.id"
            class="px-0 mb-2"
            rounded="lg"
            border
          >
            <template #prepend>
              <v-avatar color="teal" variant="tonal" size="40" class="mr-3">
                <v-icon>{{ relationIcon(g.relationship) }}</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-medium">
              {{ g.first_name }} {{ g.last_name }}
              <v-chip v-if="g.is_primary" size="x-small" color="primary" variant="tonal" class="ml-2">Primary</v-chip>
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ g.relationship }} &mdash; {{ g.phone }}
              <span v-if="g.email"> &mdash; {{ g.email }}</span>
            </v-list-item-subtitle>

            <template #append>
              <v-btn icon="mdi-pencil" variant="text" color="blue" size="small" @click="openEdit(g)" />
              <v-btn icon="mdi-delete" variant="text" color="red" size="small" @click="confirmRemove(g)" />
            </template>
          </v-list-item>
        </v-list>

        <div v-else class="text-center py-8 text-medium-emphasis">
          <v-icon size="48" color="grey" class="mb-2">mdi-account-child-outline</v-icon>
          <div class="text-body-2">No guardians on file</div>
        </div>
      </v-card-text>

      <v-divider />
      <v-card-actions class="pa-4 bg-surface-variant">
        <v-btn variant="text" @click="dialogModel = false" class="text-none">Close</v-btn>
        <v-spacer />
        <v-btn color="teal" variant="flat" prepend-icon="mdi-plus" @click="openAdd" class="text-none">
          Add Guardian
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Add / Edit Guardian -->
  <FormModal
    v-model="formModal.show"
    :title="formModal.isEdit ? 'Edit Guardian' : 'Add Guardian'"
    :submit-text="formModal.isEdit ? 'Update' : 'Add'"
    :initial-data="formModal.data"
    @submit="handleFormSubmit"
  >
    <template #default="{ formData }">
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field v-model="formData.first_name" label="First Name" :rules="[v => !!v || 'Required']" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="formData.last_name" label="Last Name" :rules="[v => !!v || 'Required']" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="4">
          <v-select
            v-model="formData.relationship"
            :items="['father', 'mother', 'other']"
            label="Relationship"
            :rules="[v => !!v || 'Required']"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="formData.phone" label="Phone" :rules="[v => !!v || 'Required']" />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="formData.email" label="Email (Optional)" />
        </v-col>
      </v-row>
      <v-switch v-model="formData.is_primary" label="Primary Guardian" color="primary" density="compact" />
    </template>
  </FormModal>

  <!-- Remove Confirm -->
  <ConfirmDialog
    v-model="removeDialog.show"
    title="Remove Guardian"
    :message="`Remove ${removeDialog.item?.first_name} ${removeDialog.item?.last_name} as guardian?`"
    confirm-text="Remove"
    confirm-color="error"
    @confirm="handleRemove"
  />
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import FormModal from '@/components/common/FormModal.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useStudentStore } from '@/store/student.store'
import type { Student, Guardian } from '@/types/api.types'

const props = defineProps<{
  modelValue: boolean
  student: Student | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const studentStore = useStudentStore()

const dialogModel = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

// Fetch guardians when the dialog opens with a student
watch(() => [props.modelValue, props.student], ([open, stu]) => {
  if (open && stu) {
    studentStore.fetchGuardians((stu as Student).id)
  }
})

const formModal = reactive({
  show: false,
  isEdit: false,
  data: {} as any,
})

const removeDialog = reactive({
  show: false,
  item: null as Guardian | null,
})

const openAdd = () => {
  formModal.isEdit = false
  formModal.data = {
    student_id: props.student?.id,
    first_name: '',
    last_name: '',
    relationship: 'father',
    phone: '',
    email: '',
    is_primary: false,
  }
  formModal.show = true
}

const openEdit = (g: Guardian) => {
  formModal.isEdit = true
  formModal.data = { ...g }
  formModal.show = true
}

const handleFormSubmit = async (data: any) => {
  if (formModal.isEdit) {
    await studentStore.updateGuardian(data.id, data)
  } else {
    await studentStore.createGuardian(data)
  }
  formModal.show = false
}

const confirmRemove = (g: Guardian) => {
  removeDialog.item = g
  removeDialog.show = true
}

const handleRemove = async () => {
  if (removeDialog.item) {
    await studentStore.deleteGuardian(removeDialog.item.id)
  }
  removeDialog.show = false
}

const relationIcon = (rel: string) => {
  const icons: Record<string, string> = {
    father: 'mdi-face-man',
    mother: 'mdi-face-woman',
    other: 'mdi-account',
  }
  return icons[rel] || 'mdi-account'
}
</script>

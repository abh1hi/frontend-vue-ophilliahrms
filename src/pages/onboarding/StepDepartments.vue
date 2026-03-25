<template>
  <div>
    <div class="text-h6 font-weight-bold mb-1">Set Up Departments</div>
    <div class="text-body-2 text-grey mb-4">
      Add the departments for your organization. You can always add more later.
    </div>

    <div v-for="(dept, index) in departments" :key="index" class="d-flex ga-2 mb-2 align-center">
      <v-text-field
        v-model="dept.name"
        label="Department Name"
        variant="outlined"
        density="compact"
        prepend-inner-icon="mdi-office-building-outline"
        class="flex-grow-1"
        :rules="[v => !!v || 'Name is required']"
      />
      <v-text-field
        v-model="dept.description"
        label="Description (optional)"
        variant="outlined"
        density="compact"
        class="flex-grow-1"
      />
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        color="grey"
        @click="removeDept(index)"
        :disabled="departments.length <= 1"
      />
    </div>

    <v-btn
      variant="text"
      color="primary"
      prepend-icon="mdi-plus"
      size="small"
      @click="addDept"
      :disabled="departments.length >= 20"
      class="mb-4"
    >
      Add Department
    </v-btn>

    <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
      {{ error }}
    </v-alert>

    <v-alert v-if="createdCount > 0" type="success" variant="tonal" density="compact" class="mb-4">
      {{ createdCount }} department(s) created successfully.
    </v-alert>

    <div class="d-flex justify-end ga-2">
      <v-btn variant="text" @click="$emit('skip')" :disabled="saving">Skip</v-btn>
      <v-btn color="primary" @click="handleNext" :loading="saving">
        {{ hasDepts ? 'Create & Continue' : 'Continue' }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import apiClient from '@/utils/api-client'

const emit = defineEmits<{
  next: []
  skip: []
}>()

interface Dept {
  name: string
  description: string
}

const departments = ref<Dept[]>([
  { name: '', description: '' },
])

const saving = ref(false)
const error = ref('')
const createdCount = ref(0)

const hasDepts = computed(() => departments.value.some(d => d.name.trim() !== ''))

const addDept = () => {
  departments.value.push({ name: '', description: '' })
}

const removeDept = (index: number) => {
  departments.value.splice(index, 1)
}

const handleNext = async () => {
  const valid = departments.value.filter(d => d.name.trim() !== '')
  if (valid.length === 0) {
    emit('next')
    return
  }

  saving.value = true
  error.value = ''
  createdCount.value = 0

  try {
    for (const dept of valid) {
      await apiClient.post('/departments', {
        name: dept.name.trim(),
        description: dept.description.trim() || undefined,
      })
      createdCount.value++
    }
    emit('next')
  } catch (err: any) {
    const msg = err?.error?.message || err?.message || 'Failed to create departments'
    error.value = `${msg} (${createdCount.value}/${valid.length} created)`
  } finally {
    saving.value = false
  }
}
</script>

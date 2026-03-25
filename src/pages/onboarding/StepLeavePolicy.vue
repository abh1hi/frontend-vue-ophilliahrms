<template>
  <div>
    <div class="text-h6 font-weight-bold mb-1">Leave Policy</div>
    <div class="text-body-2 text-grey mb-4">
      Define the leave types for your organization. Adjust names and days as needed.
    </div>

    <v-table density="compact" class="mb-4">
      <thead>
        <tr>
          <th>Leave Type</th>
          <th style="width: 140px;">Days / Year</th>
          <th style="width: 60px;"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(leave, index) in leaveTypes" :key="index">
          <td>
            <v-text-field
              v-model="leave.name"
              variant="plain"
              density="compact"
              hide-details
              placeholder="Leave type name"
            />
          </td>
          <td>
            <v-text-field
              v-model.number="leave.days_allowed"
              variant="plain"
              density="compact"
              hide-details
              type="number"
              min="1"
              max="365"
            />
          </td>
          <td>
            <v-btn
              icon="mdi-close"
              variant="text"
              size="x-small"
              color="grey"
              @click="removeLeave(index)"
              :disabled="leaveTypes.length <= 1"
            />
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-btn
      variant="text"
      color="primary"
      prepend-icon="mdi-plus"
      size="small"
      @click="addLeave"
      :disabled="leaveTypes.length >= 15"
      class="mb-4"
    >
      Add Leave Type
    </v-btn>

    <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
      {{ error }}
    </v-alert>

    <v-alert v-if="createdCount > 0" type="success" variant="tonal" density="compact" class="mb-4">
      {{ createdCount }} leave type(s) created successfully.
    </v-alert>

    <div class="d-flex justify-end ga-2">
      <v-btn variant="text" @click="$emit('skip')" :disabled="saving">Skip</v-btn>
      <v-btn color="primary" @click="handleNext" :loading="saving">
        {{ hasLeaves ? 'Create & Continue' : 'Continue' }}
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

interface LeaveType {
  name: string
  days_allowed: number
}

const leaveTypes = ref<LeaveType[]>([
  { name: 'Casual Leave', days_allowed: 12 },
  { name: 'Sick Leave', days_allowed: 10 },
  { name: 'Earned Leave', days_allowed: 15 },
])

const saving = ref(false)
const error = ref('')
const createdCount = ref(0)

const hasLeaves = computed(() => leaveTypes.value.some(l => l.name.trim() !== ''))

const addLeave = () => {
  leaveTypes.value.push({ name: '', days_allowed: 10 })
}

const removeLeave = (index: number) => {
  leaveTypes.value.splice(index, 1)
}

const handleNext = async () => {
  const valid = leaveTypes.value.filter(l => l.name.trim() !== '' && l.days_allowed > 0)
  if (valid.length === 0) {
    emit('next')
    return
  }

  saving.value = true
  error.value = ''
  createdCount.value = 0

  try {
    for (const leave of valid) {
      await apiClient.post('/leave-types', {
        name: leave.name.trim(),
        description: leave.name.trim(),
        days_allowed: leave.days_allowed,
        requires_approval: true,
        is_active: true,
      })
      createdCount.value++
    }
    emit('next')
  } catch (err: any) {
    const msg = err?.error?.message || err?.message || 'Failed to create leave types'
    error.value = `${msg} (${createdCount.value}/${valid.length} created)`
  } finally {
    saving.value = false
  }
}
</script>

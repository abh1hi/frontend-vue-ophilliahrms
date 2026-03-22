<template>
  <div>
    <div class="d-flex flex-wrap align-center ga-4 mb-4">
      <v-text-field
        v-model="selectedDate"
        label="Date"
        type="date"
        density="compact"
        hide-details
        style="max-width: 200px;"
      />
      <v-btn
        color="primary"
        variant="flat"
        :loading="submitting"
        :disabled="entries.length === 0"
        prepend-icon="mdi-content-save-all"
        @click="handleBulkSubmit"
        class="text-none"
      >
        Submit All ({{ entries.length }})
      </v-btn>
    </div>

    <v-card v-if="employeeStore.employees.length === 0" rounded="lg" border>
      <EmptyState icon="mdi-account-group-outline" title="No employees loaded" subtitle="Employee data is required for school mode attendance" />
    </v-card>

    <v-card v-else rounded="lg" border>
      <v-table density="compact" hover>
        <thead>
          <tr>
            <th>Employee</th>
            <th class="text-center">Present</th>
            <th class="text-center">Absent</th>
            <th class="text-center">Late</th>
            <th class="text-center">Half Day</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in entries" :key="entry.employee_id">
            <td class="font-weight-medium">{{ entry.name }}</td>
            <td class="text-center">
              <v-radio-group v-model="entry.status" inline hide-details density="compact" class="justify-center">
                <v-radio value="present" color="success" />
              </v-radio-group>
            </td>
            <td class="text-center">
              <v-radio-group v-model="entry.status" inline hide-details density="compact" class="justify-center">
                <v-radio value="absent" color="error" />
              </v-radio-group>
            </td>
            <td class="text-center">
              <v-radio-group v-model="entry.status" inline hide-details density="compact" class="justify-center">
                <v-radio value="late" color="warning" />
              </v-radio-group>
            </td>
            <td class="text-center">
              <v-radio-group v-model="entry.status" inline hide-details density="compact" class="justify-center">
                <v-radio value="half_day" color="info" />
              </v-radio-group>
            </td>
            <td>
              <v-text-field
                v-model="entry.notes"
                density="compact"
                hide-details
                placeholder="Optional"
                variant="plain"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useAttendanceStore } from '@/store/attendance.store'
import { useEmployeeStore } from '@/store/employee.store'

const attendanceStore = useAttendanceStore()
const employeeStore = useEmployeeStore()
const submitting = ref(false)

const selectedDate = ref(new Date().toISOString().slice(0, 10))

interface EntryRow {
  employee_id: string
  name: string
  status: string
  notes: string
}

const entries = ref<EntryRow[]>([])

const buildEntries = () => {
  entries.value = employeeStore.employees.map((e: any) => ({
    employee_id: e.id,
    name: `${e.first_name} ${e.last_name}`,
    status: 'present',
    notes: '',
  }))
}

watch(() => employeeStore.employees, buildEntries, { immediate: true })

const handleBulkSubmit = async () => {
  submitting.value = true
  try {
    await attendanceStore.createBulkSchoolMode({
      entries: entries.value.map(e => ({
        employee_id: e.employee_id,
        date: selectedDate.value,
        status: e.status,
        notes: e.notes || undefined,
      })),
    })
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (employeeStore.employees.length === 0) {
    employeeStore.fetchEmployees({ pageSize: 200 })
  }
})
</script>

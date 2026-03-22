<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h3 class="text-h6 font-weight-bold">Today's Tasks</h3>
      <div class="d-flex ga-2">
        <v-btn color="primary" variant="tonal" size="small" prepend-icon="mdi-plus" @click="openCreate" class="text-none">
          Add Task
        </v-btn>
        <v-btn color="secondary" variant="tonal" size="small" prepend-icon="mdi-account-arrow-right" @click="openAssign" class="text-none">
          Assign Task
        </v-btn>
      </div>
    </div>

    <v-card v-if="attendanceStore.tasks.length === 0 && !attendanceStore.isLoading" rounded="lg" border>
      <EmptyState icon="mdi-clipboard-check-outline" title="No tasks for today" subtitle="Create or assign tasks to track your daily activities" />
    </v-card>

    <v-row v-else>
      <v-col v-for="task in attendanceStore.tasks" :key="task.id" cols="12" sm="6" md="4">
        <v-card rounded="lg" border class="fill-height">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between mb-2">
              <StatusChip :status="task.status" size="small" />
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" size="x-small" variant="text" v-bind="props" />
                </template>
                <v-list density="compact">
                  <v-list-item v-if="task.status !== 'completed'" prepend-icon="mdi-pencil-outline" title="Edit" @click="openEdit(task)" />
                  <v-list-item v-if="task.status !== 'completed'" prepend-icon="mdi-check-circle-outline" title="Complete" @click="openComplete(task)" />
                  <v-list-item prepend-icon="mdi-delete-outline" title="Delete" @click="handleDelete(task.id)" />
                </v-list>
              </v-menu>
            </div>
            <h4 class="text-subtitle-1 font-weight-bold mb-1">{{ task.title }}</h4>
            <p v-if="task.description" class="text-body-2 text-medium-emphasis mb-2">{{ task.description }}</p>
            <div v-if="task.estimated_finish_time" class="text-caption text-medium-emphasis">
              <v-icon size="12" class="mr-1">mdi-clock-outline</v-icon>
              Est: {{ task.estimated_finish_time }}
            </div>
            <div v-if="task.completion_notes" class="text-caption text-success mt-1">
              <v-icon size="12" class="mr-1">mdi-note-check</v-icon>
              {{ task.completion_notes }}
            </div>
            <div v-if="task.actual_expenses" class="text-caption text-primary mt-1">
              <v-icon size="12" class="mr-1">mdi-currency-inr</v-icon>
              {{ task.actual_expenses }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Create Task Dialog -->
    <FormModal
      v-model="createModal.show"
      title="Add Task"
      submit-text="Create"
      :loading="attendanceStore.isLoading"
      :initial-data="createModal.data"
      @submit="handleCreate"
    >
      <template #default="{ formData }">
        <v-text-field v-model="formData.title" label="Task Title" :rules="[v => !!v || 'Required']" />
        <v-textarea v-model="formData.description" label="Description" rows="2" />
        <v-text-field v-model="formData.estimated_finish_time" label="Estimated Finish Time" placeholder="e.g. 2:00 PM" />
      </template>
    </FormModal>

    <!-- Assign Task Dialog -->
    <FormModal
      v-model="assignModal.show"
      title="Assign Task to Employee"
      submit-text="Assign"
      :loading="attendanceStore.isLoading"
      :initial-data="assignModal.data"
      @submit="handleAssign"
    >
      <template #default="{ formData }">
        <v-select
          v-model="formData.employee_id"
          label="Employee"
          :items="employeeOptions"
          :rules="[v => !!v || 'Required']"
        />
        <v-text-field v-model="formData.title" label="Task Title" :rules="[v => !!v || 'Required']" />
        <v-textarea v-model="formData.description" label="Description" rows="2" />
        <v-text-field v-model="formData.estimated_finish_time" label="Estimated Finish Time" placeholder="e.g. 2:00 PM" />
      </template>
    </FormModal>

    <!-- Edit Task Dialog -->
    <FormModal
      v-model="editModal.show"
      title="Edit Task"
      submit-text="Save"
      :loading="attendanceStore.isLoading"
      :initial-data="editModal.data"
      @submit="handleEdit"
    >
      <template #default="{ formData }">
        <v-text-field v-model="formData.title" label="Task Title" :rules="[v => !!v || 'Required']" />
        <v-textarea v-model="formData.description" label="Description" rows="2" />
        <v-text-field v-model="formData.estimated_finish_time" label="Estimated Finish Time" />
      </template>
    </FormModal>

    <!-- Complete Task Dialog -->
    <FormModal
      v-model="completeModal.show"
      title="Complete Task"
      submit-text="Mark Complete"
      :loading="attendanceStore.isLoading"
      :initial-data="completeModal.data"
      @submit="handleComplete"
    >
      <template #default="{ formData }">
        <v-select
          v-model="formData.status"
          label="Completion Status"
          :items="[
            { title: 'Completed', value: 'completed' },
            { title: 'Partially Completed', value: 'partially_completed' },
            { title: 'Not Completed', value: 'not_completed' },
          ]"
        />
        <v-textarea v-model="formData.completion_notes" label="Completion Notes" rows="2" />
        <v-text-field v-model.number="formData.actual_expenses" label="Actual Expenses" type="number" prefix="$" />
      </template>
    </FormModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, computed } from 'vue'
import FormModal from '@/components/common/FormModal.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useAttendanceStore } from '@/store/attendance.store'
import { useEmployeeStore } from '@/store/employee.store'
import type { AttendanceTask } from '@/types/attendance.types'

const attendanceStore = useAttendanceStore()
const employeeStore = useEmployeeStore()

const employeeOptions = computed(() =>
  employeeStore.employees.map((e: any) => ({
    title: `${e.first_name} ${e.last_name}`,
    value: e.id,
  }))
)

const createModal = reactive({ show: false, data: {} as any })
const assignModal = reactive({ show: false, data: {} as any })
const editModal = reactive({ show: false, data: {} as any, taskId: '' })
const completeModal = reactive({ show: false, data: {} as any, taskId: '' })

const openCreate = () => {
  createModal.data = { title: '', description: '', estimated_finish_time: '' }
  createModal.show = true
}

const openAssign = () => {
  assignModal.data = { employee_id: '', title: '', description: '', estimated_finish_time: '' }
  assignModal.show = true
}

const openEdit = (task: AttendanceTask) => {
  editModal.taskId = task.id
  editModal.data = { title: task.title, description: task.description || '', estimated_finish_time: task.estimated_finish_time || '' }
  editModal.show = true
}

const openComplete = (task: AttendanceTask) => {
  completeModal.taskId = task.id
  completeModal.data = { status: 'completed', completion_notes: '', actual_expenses: null }
  completeModal.show = true
}

const handleCreate = async (formData: any) => {
  await attendanceStore.createTask(formData)
  createModal.show = false
}

const handleAssign = async (formData: any) => {
  await attendanceStore.assignTask(formData)
  assignModal.show = false
}

const handleEdit = async (formData: any) => {
  await attendanceStore.updateTask(editModal.taskId, formData)
  editModal.show = false
}

const handleComplete = async (formData: any) => {
  await attendanceStore.completeTask(completeModal.taskId, formData)
  completeModal.show = false
}

const handleDelete = async (taskId: string) => {
  await attendanceStore.deleteTask(taskId)
}

onMounted(() => {
  attendanceStore.fetchTodayTasks()
  if (employeeStore.employees.length === 0) {
    employeeStore.fetchEmployees({ pageSize: 100 })
  }
})
</script>

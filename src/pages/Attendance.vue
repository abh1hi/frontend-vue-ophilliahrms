<template>
  <v-container fluid class="pa-4 pa-md-6">
    <PageHeader title="Attendance" subtitle="Track daily attendance, tasks, and school mode entries">
      <template #actions>
        <v-btn
          v-if="activeTab === 'daily'"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-plus"
          @click="openManualEntry"
          class="text-none"
        >
          Manual Entry
        </v-btn>
      </template>
    </PageHeader>

    <TabLayout v-model="activeTab" :tabs="tabs">
      <!-- Daily View Tab -->
      <template #daily>
        <!-- Alerts banner -->
        <v-row v-if="alerts" class="mb-4">
          <v-col cols="12" md="4">
            <StatCard
              title="Late Punch-Ins"
              :value="alerts.late_count || 0"
              subtitle="Today"
              icon="mdi-clock-alert-outline"
              icon-color="warning"
            />
          </v-col>
          <v-col cols="12" md="4">
            <StatCard
              title="Missed Punch-Outs"
              :value="alerts.missed_punch_out_count || 0"
              subtitle="Today"
              icon="mdi-logout-variant"
              icon-color="error"
            />
          </v-col>
          <v-col cols="12" md="4">
            <StatCard
              title="Present Today"
              :value="presentToday"
              subtitle="Active employees"
              icon="mdi-account-check-outline"
              icon-color="success"
            />
          </v-col>
        </v-row>

        <!-- Missed punch-out detail -->
        <v-expand-transition>
          <v-card v-if="alerts?.missed_punch_outs?.length" class="mb-4" rounded="lg" border elevation="0">
            <v-card-title class="text-subtitle-2 pa-4 pb-2 d-flex align-center">
              <v-icon color="error" class="mr-2">mdi-alert-circle-outline</v-icon>
              Employees who haven't punched out
              <v-spacer />
              <v-btn variant="text" size="small" :icon="showMissed ? 'mdi-chevron-up' : 'mdi-chevron-down'" @click="showMissed = !showMissed" />
            </v-card-title>
            <v-expand-transition>
              <v-list v-if="showMissed" density="compact" class="pt-0">
                <v-list-item v-for="m in alerts.missed_punch_outs" :key="m.record_id" :subtitle="formatTime(m.clock_in)">
                  <template #prepend>
                    <v-avatar color="error" variant="tonal" size="32"><v-icon size="18">mdi-account-clock-outline</v-icon></v-avatar>
                  </template>
                  <template #title>{{ getEmployeeName(m.employee_id) }}</template>
                </v-list-item>
              </v-list>
            </v-expand-transition>
          </v-card>
        </v-expand-transition>

        <v-row class="mb-6">
          <!-- Daily punch card -->
          <v-col cols="12" md="4">
            <v-card rounded="lg" border class="fill-height">
              <v-card-text class="pa-6 d-flex flex-column align-center justify-center text-center">
                <h2 class="text-h5 font-weight-bold mb-2">Daily Attendance</h2>
                <p class="text-body-2 text-medium-emphasis mb-6">{{ formatCurrentDate() }}</p>

                <div v-if="attendanceStore.todayRecord" class="w-100">
                  <v-chip color="success" size="large" label class="mb-2 d-block">
                    Clocked In: {{ formatTime(attendanceStore.todayRecord.clock_in) }}
                  </v-chip>
                  <div v-if="attendanceStore.todayRecord.clock_out">
                    <v-chip color="info" size="large" label class="mb-2 d-block">
                      Clocked Out: {{ formatTime(attendanceStore.todayRecord.clock_out) }}
                    </v-chip>
                    <p class="text-subtitle-1 font-weight-bold">
                      Work Duration: {{ attendanceStore.todayRecord.work_hours?.toFixed(2) }} hrs
                    </p>
                  </div>
                  <v-btn v-else color="error" size="x-large" block prepend-icon="mdi-clock-out" class="mt-4" :loading="attendanceStore.isLoading" @click="onClockOut">
                    Clock Out
                  </v-btn>
                </div>

                <div v-else>
                  <v-btn color="primary" size="x-large" block prepend-icon="mdi-clock-in" :loading="attendanceStore.isLoading" @click="onClockIn">
                    Clock In Now
                  </v-btn>
                  <p class="text-caption text-medium-emphasis mt-4">Remember to clock in before starting work.</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Attendance table -->
          <v-col cols="12" md="8">
            <DataTable
              title="Attendance History"
              :headers="headers"
              :items="attendanceStore.records"
              :total-items="attendanceStore.totalRecords"
              :loading="attendanceStore.isLoading"
              @update:options="onOptionsUpdate"
            >
              <template #item.employee_id="{ item }">{{ getEmployeeName(item.employee_id) }}</template>
              <template #item.clock_in="{ item }">{{ formatDateTime(item.clock_in) }}</template>
              <template #item.clock_out="{ item }">
                <span v-if="item.clock_out">{{ formatDateTime(item.clock_out) }}</span>
                <v-chip v-else color="error" size="x-small" variant="tonal">Not out</v-chip>
              </template>
              <template #item.status="{ item }">
                <StatusChip :status="item.status" size="small" />
              </template>
              <template #item.actions="{ item }">
                <v-btn icon size="small" variant="text" color="primary" @click="openEditRecord(item)">
                  <v-icon size="18">mdi-pencil-outline</v-icon>
                  <v-tooltip activator="parent" location="top">Edit</v-tooltip>
                </v-btn>
              </template>
            </DataTable>
          </v-col>
        </v-row>
      </template>

      <!-- Tasks Tab -->
      <template #tasks>
        <TaskPanel />
      </template>

      <!-- School Mode Tab -->
      <template #school>
        <SchoolModePanel />
      </template>
    </TabLayout>

    <!-- Manual Entry Modal -->
    <FormModal
      v-model="manualModal.show"
      title="Manual Attendance Entry"
      submit-text="Add Entry"
      :loading="attendanceStore.isLoading"
      :initial-data="manualModal.data"
      @submit="handleManualEntry"
    >
      <template #default="{ formData }">
        <v-select v-model="formData.employee_id" label="Employee" :items="employeeOptions" :rules="[v => !!v || 'Required']" />
        <v-text-field v-model="formData.date" label="Date" type="date" :rules="[v => !!v || 'Required']" />
        <v-text-field v-model="formData.clock_in" label="Clock In" type="time" :rules="[v => !!v || 'Required']" />
        <v-text-field v-model="formData.clock_out" label="Clock Out" type="time" />
        <v-select v-model="formData.status" label="Status" :items="statusOptions" :rules="[v => !!v || 'Required']" />
        <v-textarea v-model="formData.notes" label="Notes" rows="2" />
      </template>
    </FormModal>

    <!-- Edit Record Modal -->
    <FormModal
      v-model="editModal.show"
      title="Edit Attendance Record"
      submit-text="Save"
      :loading="attendanceStore.isLoading"
      :initial-data="editModal.data"
      @submit="handleEditRecord"
    >
      <template #default="{ formData }">
        <v-text-field v-model="formData.clock_in" label="Clock In" type="time" />
        <v-text-field v-model="formData.clock_out" label="Clock Out" type="time" />
        <v-select v-model="formData.status" label="Status" :items="statusOptions" />
        <v-textarea v-model="formData.notes" label="Notes" rows="2" />
      </template>
    </FormModal>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import FormModal from '@/components/common/FormModal.vue'
import TabLayout from '@/components/common/TabLayout.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import TaskPanel from '@/components/attendance/TaskPanel.vue'
import SchoolModePanel from '@/components/attendance/SchoolModePanel.vue'
import { useAttendanceStore } from '@/store/attendance.store'
import { useEmployeeStore } from '@/store/employee.store'
import type { Attendance } from '@/types/attendance.types'

const attendanceStore = useAttendanceStore()
const employeeStore = useEmployeeStore()

const activeTab = ref('daily')
const alerts = ref<any>(null)
const showMissed = ref(false)

const tabs = [
  { value: 'daily', label: 'Daily View', icon: 'mdi-calendar-today' },
  { value: 'tasks', label: 'Tasks', icon: 'mdi-format-list-checks' },
  { value: 'school', label: 'School Mode', icon: 'mdi-school-outline' },
]

const headers = [
  { title: 'Date', key: 'date', align: 'start' as const },
  { title: 'Employee', key: 'employee_id' },
  { title: 'Clock In', key: 'clock_in' },
  { title: 'Clock Out', key: 'clock_out' },
  { title: 'Status', key: 'status' },
  { title: 'Work Hrs', key: 'work_hours' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const },
]

const statusOptions = [
  { title: 'Present', value: 'present' },
  { title: 'Absent', value: 'absent' },
  { title: 'Late', value: 'late' },
  { title: 'Half Day', value: 'half_day' },
]

const employeeOptions = computed(() =>
  employeeStore.employees.map((e: any) => ({
    title: `${e.first_name} ${e.last_name}`,
    value: e.id,
  }))
)

const presentToday = computed(() =>
  attendanceStore.records.filter((r: any) =>
    r.date === new Date().toISOString().slice(0, 10) && ['present', 'late'].includes(r.status)
  ).length
)

// Manual entry modal
const manualModal = ref({ show: false, data: {} as any })
const openManualEntry = () => {
  manualModal.value.data = {
    employee_id: '', date: new Date().toISOString().slice(0, 10),
    clock_in: '09:00', clock_out: '', status: 'present', notes: '',
  }
  manualModal.value.show = true
}
const handleManualEntry = async (formData: any) => {
  const payload = {
    employee_id: formData.employee_id,
    date: formData.date,
    clock_in: `${formData.date}T${formData.clock_in}:00`,
    clock_out: formData.clock_out ? `${formData.date}T${formData.clock_out}:00` : undefined,
    status: formData.status,
    notes: formData.notes || undefined,
  }
  await attendanceStore.createManualEntry(payload)
  manualModal.value.show = false
}

// Edit record modal
const editModal = ref({ show: false, data: {} as any, recordId: '' })
const openEditRecord = (record: Attendance) => {
  editModal.value.recordId = record.id
  editModal.value.data = {
    clock_in: record.clock_in ? new Date(record.clock_in).toTimeString().slice(0, 5) : '',
    clock_out: record.clock_out ? new Date(record.clock_out).toTimeString().slice(0, 5) : '',
    status: record.status,
    notes: record.notes || '',
  }
  editModal.value.show = true
}
const handleEditRecord = async (formData: any) => {
  await attendanceStore.updateRecord(editModal.value.recordId, formData)
  editModal.value.show = false
}

const getEmployeeName = (id: string) => {
  const emp = employeeStore.employees.find((e: any) => e.id === id)
  return emp ? `${emp.first_name} ${emp.last_name}` : id
}

const onOptionsUpdate = (options: any) => {
  attendanceStore.fetchAttendance({ page: options.page, pageSize: options.itemsPerPage })
}

const onClockIn = async () => { await attendanceStore.clockIn({ notes: 'Web clock-in' }) }
const onClockOut = async () => { await attendanceStore.clockOut({ notes: 'Web clock-out' }) }

const formatCurrentDate = () =>
  new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())
const formatTime = (dt: string) =>
  new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date(dt))
const formatDateTime = (dt: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dt))

onMounted(async () => {
  attendanceStore.fetchTodayRecord()
  attendanceStore.fetchAttendance()
  if (employeeStore.employees.length === 0) {
    employeeStore.fetchEmployees({ pageSize: 100 })
  }
  try {
    const token = localStorage.getItem('access_token') ?? ''
    const apiBase = (import.meta.env.VITE_API_URL ?? '') + '/api/v1'
    const res = await fetch(`${apiBase}/attendance/alerts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const body = await res.json()
      alerts.value = body?.data ?? body
    }
  } catch { /* alerts optional */ }
})
</script>

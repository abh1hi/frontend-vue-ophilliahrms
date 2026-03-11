<template>
  <v-container fluid class="pa-6">
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card rounded="lg" class="elevation-2 fill-height">
          <v-card-text class="pa-6 d-flex flex-column align-center justify-center text-center">
            <h2 class="text-h5 font-weight-bold mb-2">Daily Attendance</h2>
            <p class="text-body-2 text-grey mb-6">
              {{ formatCurrentDate() }}
            </p>

            <div v-if="attendanceStore.todayRecord" class="w-100">
              <v-chip color="success" size="large" label class="mb-4">
                Clocked In: {{ formatTime(attendanceStore.todayRecord.clock_in) }}
              </v-chip>
              <div v-if="attendanceStore.todayRecord.clock_out">
                 <v-chip color="info" size="large" label class="mb-4 d-block">
                  Clocked Out: {{ formatTime(attendanceStore.todayRecord.clock_out) }}
                </v-chip>
                <p class="text-subtitle-1 font-weight-bold">
                  Work Duration: {{ attendanceStore.todayRecord.work_hours?.toFixed(2) }} hrs
                </p>
              </div>
              <v-btn
                v-else
                color="error"
                size="x-large"
                block
                prepend-icon="mdi-clock-out"
                class="mt-4"
                :loading="attendanceStore.isLoading"
                @click="onClockOut"
              >
                Clock Out
              </v-btn>
            </div>

            <div v-else>
              <v-btn
                color="primary"
                size="x-large"
                block
                prepend-icon="mdi-clock-in"
                :loading="attendanceStore.isLoading"
                @click="onClockIn"
              >
                Clock In Now
              </v-btn>
              <p class="text-caption text-grey mt-4">
                Remember to clock in before starting work.
              </p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <DataTable
          title="Attendance History"
          :headers="headers"
          :items="attendanceStore.records"
          :total-items="attendanceStore.totalRecords"
          :loading="attendanceStore.isLoading"
          @update:options="onOptionsUpdate"
        >
          <template #item.employee_id="{ item }">
            {{ getEmployeeName(item.employee_id) }}
          </template>
          
          <template #item.clock_in="{ item }">
            {{ formatDateTime(item.clock_in) }}
          </template>
          
          <template #item.clock_out="{ item }">
            {{ item.clock_out ? formatDateTime(item.clock_out) : '-' }}
          </template>

          <template #item.status="{ item }">
             <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              label
              class="text-uppercase font-weight-bold"
            >
              {{ item.status }}
            </v-chip>
          </template>
        </DataTable>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import { useAttendanceStore } from '@/store/attendance.store'
import { useEmployeeStore } from '@/store/employee.store'

const attendanceStore = useAttendanceStore()
const employeeStore = useEmployeeStore()

const headers = [
  { title: 'Date', key: 'date', align: 'start' },
  { title: 'Employee', key: 'employee_id' },
  { title: 'Clock In', key: 'clock_in' },
  { title: 'Clock Out', key: 'clock_out' },
  { title: 'Status', key: 'status' },
  { title: 'Work Hrs', key: 'work_hours' },
]

onMounted(() => {
  attendanceStore.fetchTodayRecord()
  attendanceStore.fetchAttendance()
  if (employeeStore.employees.length === 0) {
    employeeStore.fetchEmployees({ pageSize: 100 })
  }
})

const onOptionsUpdate = (options: any) => {
  attendanceStore.fetchAttendance({
    page: options.page,
    pageSize: options.itemsPerPage
  })
}

const onClockIn = async () => {
    // Permission for geolocation could be requested here
    await attendanceStore.clockIn({ notes: 'Web clock-in' })
}

const onClockOut = async () => {
    await attendanceStore.clockOut({ notes: 'Web clock-out' })
}

const getEmployeeName = (id: string) => {
  const emp = employeeStore.employees.find(e => e.id === id)
  return emp ? `${emp.first_name} ${emp.last_name}` : id
}

const formatCurrentDate = () => {
    return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date())
}

const formatTime = (dt: string) => {
    return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date(dt))
}

const formatDateTime = (dt: string) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dt))
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'present': return 'success'
    case 'late': return 'warning'
    case 'half_day': return 'info'
    case 'absent': return 'error'
    default: return 'grey'
  }
}
</script>

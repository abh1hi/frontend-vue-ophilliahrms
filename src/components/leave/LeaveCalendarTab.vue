<template>
  <div>
    <div class="d-flex flex-wrap align-center ga-4 mb-4">
      <v-btn icon="mdi-chevron-left" variant="text" size="small" @click="prevMonth" />
      <h3 class="text-h6 font-weight-bold">{{ monthLabel }}</h3>
      <v-btn icon="mdi-chevron-right" variant="text" size="small" @click="nextMonth" />
    </div>

    <v-card rounded="lg" border>
      <div class="calendar-grid">
        <div v-for="day in weekDays" :key="day" class="calendar-header text-caption font-weight-bold text-medium-emphasis text-center pa-2">
          {{ day }}
        </div>
        <div
          v-for="(cell, idx) in calendarCells"
          :key="idx"
          class="calendar-cell pa-2"
          :class="{
            'bg-surface-variant': cell.isToday,
            'text-medium-emphasis': !cell.isCurrentMonth,
          }"
        >
          <div class="text-caption font-weight-medium">{{ cell.day }}</div>
          <div v-if="cell.count > 0" class="mt-1">
            <v-chip size="x-small" :color="cell.count >= 3 ? 'error' : cell.count >= 2 ? 'warning' : 'info'" variant="tonal">
              {{ cell.count }} on leave
            </v-chip>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useLeaveStore } from '@/store/leave.store'

const leaveStore = useLeaveStore()

const currentDate = ref(new Date())
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const monthLabel = computed(() =>
  currentDate.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
)

const prevMonth = () => {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() - 1)
  currentDate.value = d
}

const nextMonth = () => {
  const d = new Date(currentDate.value)
  d.setMonth(d.getMonth() + 1)
  currentDate.value = d
}

interface CalendarCell {
  day: number
  date: string
  isCurrentMonth: boolean
  isToday: boolean
  count: number
}

const calendarCells = computed<CalendarCell[]>(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date().toISOString().slice(0, 10)

  const leaveMap = new Map<string, number>()
  for (const entry of leaveStore.calendarDates) {
    leaveMap.set(entry.date, entry.count)
  }

  const cells: CalendarCell[] = []

  // Prev month padding
  const prevMonthDays = new Date(year, month, 0).getDate()
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    const d = new Date(year, month - 1, day)
    const dateStr = d.toISOString().slice(0, 10)
    cells.push({ day, date: dateStr, isCurrentMonth: false, isToday: false, count: leaveMap.get(dateStr) || 0 })
  }

  // Current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    cells.push({ day, date: dateStr, isCurrentMonth: true, isToday: dateStr === today, count: leaveMap.get(dateStr) || 0 })
  }

  // Next month padding
  const remaining = 42 - cells.length
  for (let day = 1; day <= remaining; day++) {
    const d = new Date(year, month + 1, day)
    const dateStr = d.toISOString().slice(0, 10)
    cells.push({ day, date: dateStr, isCurrentMonth: false, isToday: false, count: leaveMap.get(dateStr) || 0 })
  }

  return cells
})

const loadCalendar = () => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const start = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const end = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`
  leaveStore.fetchLeaveCalendar(start, end)
}

watch(currentDate, loadCalendar)
onMounted(loadCalendar)
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-header {
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
}

.calendar-cell {
  min-height: 72px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.1);
  border-right: 1px solid rgba(128, 128, 128, 0.1);
}

.calendar-cell:nth-child(7n) {
  border-right: none;
}
</style>

<template>
  <v-container fluid class="pa-6">
    <DataTable
      title="Classes & Academic Sections"
      :headers="headers"
      :items="studentStore.classes"
      :total-items="studentStore.totalClasses"
      :loading="studentStore.isLoading"
      searchable
    >
       <template #actions>
        <v-btn
          color="secondary"
          prepend-icon="mdi-school-outline"
          class="mr-4"
        >
          Manage Academic Years
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
            ></v-progress-linear>
            <span class="text-caption">{{ item.capacity }} max</span>
        </div>
      </template>

      <template #item.actions="{ item }">
        <v-btn icon="mdi-pencil" variant="text" color="blue" size="small"></v-btn>
        <v-btn icon="mdi-account-group" variant="text" color="secondary" size="small"></v-btn>
      </template>
    </DataTable>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import { useStudentStore } from '@/store/student.store'

const studentStore = useStudentStore()

const headers = [
  { title: 'Class Name', key: 'name', align: 'start' },
  { title: 'Grade', key: 'grade_level' },
  { title: 'Section', key: 'section' },
  { title: 'Academic Year', key: 'academic_year' },
  { title: 'Capacity', key: 'capacity' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

onMounted(() => {
  studentStore.fetchClasses()
})
</script>

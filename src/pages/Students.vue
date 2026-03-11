<template>
  <v-container fluid class="pa-6">
    <DataTable
      title="Student Enrollment"
      :headers="headers"
      :items="studentStore.students"
      :total-items="studentStore.totalStudents"
      :loading="studentStore.isLoading"
      @update:options="onOptionsUpdate"
      searchable
    >
      <template #actions>
        <v-btn
          color="primary"
          prepend-icon="mdi-account-plus"
          @click="openEnrollModal"
        >
          Enroll Student
        </v-btn>
      </template>

      <template #item.name="{ item }">
        <div class="d-flex align-center ga-2">
            <v-avatar color="primary-lighten-4" size="32">
                <span class="text-caption font-weight-bold text-primary">{{ item.first_name[0] }}{{ item.last_name[0] }}</span>
            </v-avatar>
            <span>{{ item.first_name }} {{ item.last_name }}</span>
        </div>
      </template>

      <template #item.class_id="{ item }">
         <v-chip v-if="item.class_id" size="small" variant="outlined" color="secondary">
            {{ getClassName(item.class_id) }}
         </v-chip>
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

    <!-- Enrollment Modal -->
    <FormModal
      v-model="modal.show"
      title="Enroll New Student"
      submit-text="Enroll"
      :loading="studentStore.isLoading"
      @submit="handleEnrollSubmit"
    >
      <template #default="{ formData }">
        <v-row>
            <v-col cols="12" md="4">
                <v-text-field v-model="formData.student_number" label="Student Number" required></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
                <v-text-field v-model="formData.first_name" label="First Name" required></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
                <v-text-field v-model="formData.last_name" label="Last Name" required></v-text-field>
            </v-col>
        </v-row>
        
        <v-row>
             <v-col cols="12" md="6">
                <v-select
                    v-model="formData.class_id"
                    :items="studentStore.classes"
                    item-title="name"
                    item-value="id"
                    label="Assign Class"
                    clearable
                ></v-select>
            </v-col>
            <v-col cols="12" md="6">
                <v-select
                    v-model="formData.gender"
                    :items="['male', 'female', 'other']"
                    label="Gender"
                    required
                ></v-select>
            </v-col>
        </v-row>

        <v-text-field
          v-model="formData.date_of_birth"
          label="Date of Birth"
          type="date"
          required
        ></v-text-field>
        
        <v-text-field v-model="formData.email" label="Email (Optional)"></v-text-field>
        <v-textarea v-model="formData.address" label="Home Address" rows="2"></v-textarea>
      </template>
    </FormModal>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import FormModal from '@/components/common/FormModal.vue'
import { useStudentStore } from '@/store/student.store'

const studentStore = useStudentStore()

const headers = [
  { title: 'Student Number', key: 'student_number' },
  { title: 'Name', key: 'name' },
  { title: 'Class', key: 'class_id' },
  { title: 'Status', key: 'status' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

const modal = reactive({
  show: false,
  data: {} as any
})

onMounted(() => {
  studentStore.fetchStudents()
  studentStore.fetchClasses()
})

const onOptionsUpdate = (options: any) => {
  studentStore.fetchStudents({
    page: options.page,
    pageSize: options.itemsPerPage
  })
}

const openEnrollModal = () => {
    modal.data = {
        student_number: `ST-${Date.now().toString().slice(-6)}`,
        first_name: '',
        last_name: '',
        gender: 'male',
        date_of_birth: '2015-01-01',
        class_id: null,
        status: 'active'
    }
    modal.show = true
}

const handleEnrollSubmit = async (formData: any) => {
    await studentStore.createStudent(formData)
    modal.show = false
}

const getClassName = (id: string) => {
  const cls = studentStore.classes.find(c => c.id === id)
  return cls ? cls.name : 'Unknown'
}

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success'
      case 'inactive': return 'grey'
      case 'graduated': return 'primary'
      case 'withdrawn': return 'error'
      default: return 'grey'
    }
}
</script>

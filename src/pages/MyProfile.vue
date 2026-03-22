<template>
  <v-container fluid class="pa-4 pa-md-6">
    <PageHeader title="My Profile" subtitle="Your personal employee information" />

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <v-card v-if="profile" rounded="lg" border class="pa-6">
      <div class="d-flex flex-wrap align-center ga-6 mb-6">
        <v-avatar color="primary" size="80">
          <v-img v-if="profile.staff_photo_url" :src="profile.staff_photo_url" />
          <span v-else class="text-h5 font-weight-bold text-white">{{ initials }}</span>
        </v-avatar>
        <div>
          <h2 class="text-h5 font-weight-bold">{{ profile.first_name }} {{ profile.last_name }}</h2>
          <p class="text-body-2 text-medium-emphasis">{{ profile.email }}</p>
          <StatusChip v-if="profile.employment_type" :status="profile.employment_type" class="mt-1" />
        </div>
      </div>

      <v-divider class="mb-6" />

      <v-row>
        <v-col cols="12" sm="6" md="4">
          <div class="text-caption text-medium-emphasis text-uppercase">Phone</div>
          <div class="text-body-1">{{ profile.phone || '—' }}</div>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <div class="text-caption text-medium-emphasis text-uppercase">Date of Birth</div>
          <div class="text-body-1">{{ profile.date_of_birth ? formatDate(profile.date_of_birth) : '—' }}</div>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <div class="text-caption text-medium-emphasis text-uppercase">Hire Date</div>
          <div class="text-body-1">{{ profile.hire_date ? formatDate(profile.hire_date) : '—' }}</div>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <div class="text-caption text-medium-emphasis text-uppercase">Department</div>
          <div class="text-body-1">{{ profile.department_name || profile.department_id || '—' }}</div>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <div class="text-caption text-medium-emphasis text-uppercase">Position</div>
          <div class="text-body-1">{{ profile.position || '—' }}</div>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <div class="text-caption text-medium-emphasis text-uppercase">Status</div>
          <StatusChip :status="profile.is_active ? 'active' : 'inactive'" />
        </v-col>
      </v-row>

      <v-divider class="my-6" />

      <v-row>
        <v-col cols="12" sm="6" md="4">
          <div class="text-caption text-medium-emphasis text-uppercase">Address</div>
          <div class="text-body-1">{{ profile.address || '—' }}</div>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <div class="text-caption text-medium-emphasis text-uppercase">Emergency Contact</div>
          <div class="text-body-1">{{ profile.emergency_contact_name || '—' }}</div>
          <div v-if="profile.emergency_contact_phone" class="text-caption text-medium-emphasis">{{ profile.emergency_contact_phone }}</div>
        </v-col>
        <v-col cols="12" sm="6" md="4">
          <div class="text-caption text-medium-emphasis text-uppercase">Gender</div>
          <div class="text-body-1">{{ profile.gender || '—' }}</div>
        </v-col>
      </v-row>
    </v-card>

    <EmptyState v-else-if="!loading" icon="mdi-account-alert-outline" title="No profile found" subtitle="Your employee profile has not been set up yet" />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatusChip from '@/components/common/StatusChip.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useEmployeeStore } from '@/store/employee.store'

const employeeStore = useEmployeeStore()
const profile = ref<any>(null)
const loading = ref(true)

const initials = computed(() => {
  if (!profile.value) return '?'
  return `${profile.value.first_name?.[0] || ''}${profile.value.last_name?.[0] || ''}`.toUpperCase()
})

const formatDate = (d: string) => {
  try { return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(d)) }
  catch { return d }
}

onMounted(async () => {
  profile.value = await employeeStore.fetchMyProfile()
  loading.value = false
})
</script>

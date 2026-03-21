<template>
  <v-container class="fill-height d-flex align-center justify-center" fluid>
    <v-card class="mx-auto pa-8" max-width="500" elevation="8" rounded="lg">
      <v-card-title class="text-h5 font-weight-bold text-center mb-2">
        Select Company
      </v-card-title>
      <v-card-subtitle class="text-center mb-6">
        Choose the company you want to manage
      </v-card-subtitle>

      <v-alert v-if="error" type="error" class="mb-4" closable @click:close="error = ''">
        {{ error }}
      </v-alert>

      <v-list lines="two">
        <v-list-item
          v-for="company in companies"
          :key="company.id"
          :title="company.name"
          :subtitle="company.domain || 'No domain'"
          @click="handleSelect(company.id)"
          :disabled="loading"
          rounded="lg"
          class="mb-2"
          border
        >
          <template v-slot:prepend>
            <v-avatar color="primary" variant="tonal">
              <span class="text-h6">{{ company.name.charAt(0).toUpperCase() }}</span>
            </v-avatar>
          </template>
          <template v-slot:append>
            <v-icon>mdi-chevron-right</v-icon>
          </template>
        </v-list-item>
      </v-list>

      <v-progress-linear v-if="loading" indeterminate color="primary" class="mt-4" />
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'
import type { Company } from '@/types/company.types'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')

const companies = computed<Company[]>(() => {
  return authStore.postLoginContext?.companies || []
})

onMounted(async () => {
  if (!authStore.postLoginContext) {
    await authStore.fetchPostLoginContext()
  }
  if (companies.value.length === 0) {
    router.push('/')
  }
})

async function handleSelect(companyId: string) {
  loading.value = true
  error.value = ''
  try {
    await authStore.selectCompany(companyId)
    router.push('/')
  } catch (e: any) {
    error.value = e?.response?.data?.detail || e?.message || 'Failed to select company'
  } finally {
    loading.value = false
  }
}
</script>

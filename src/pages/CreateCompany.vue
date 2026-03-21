<template>
  <v-app>
    <v-main class="bg-grey-lighten-4 d-flex align-center justify-center">
      <v-card class="elevation-12 pa-8" width="100%" max-width="500" rounded="xl">
        <v-card-title class="text-h5 font-weight-bold text-center mb-2 color-primary">
          Create Your Company
        </v-card-title>

        <v-card-subtitle class="text-center mb-6 text-body-2">
          Set up your organisation to get started
        </v-card-subtitle>

        <v-form @submit.prevent="handleSubmit" ref="formRef">
          <v-text-field
            v-model="companyForm.name"
            label="Company Name"
            prepend-inner-icon="mdi-office-building-outline"
            variant="outlined"
            :rules="[v => !!v || 'Company name is required']"
          />

          <v-text-field
            v-model="companyForm.domain"
            label="Domain (optional)"
            prepend-inner-icon="mdi-web"
            variant="outlined"
            hint="e.g. acme.com"
            persistent-hint
            class="mt-3"
          />

          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            class="mt-4"
            closable
            @click:close="errorMessage = null"
          >
            {{ errorMessage }}
          </v-alert>

          <v-btn
            type="submit"
            color="primary"
            size="x-large"
            block
            class="mt-6"
            rounded="lg"
            :loading="isSubmitting"
          >
            Create Company
          </v-btn>
        </v-form>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useCompanyStore } from '@/store/company.store'

const router = useRouter()
const companyStore = useCompanyStore()
const formRef = ref()
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

const companyForm = reactive({
  name: '',
  domain: '',
})

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  isSubmitting.value = true
  errorMessage.value = null

  try {
    await companyStore.createCompany({
      name: companyForm.name,
      domain: companyForm.domain || undefined,
    })
    router.push('/')
  } catch (err: any) {
    errorMessage.value = err.error?.message || 'Failed to create company'
  } finally {
    isSubmitting.value = false
  }
}
</script>

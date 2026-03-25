<template>
  <v-app>
    <v-main class="bg-grey-lighten-4 d-flex align-center justify-center" style="min-height: 100vh;">
      <v-card class="elevation-12 pa-8" width="100%" max-width="540" rounded="xl">
        <div class="text-center mb-6">
          <v-avatar color="primary" size="64" class="mb-4">
            <v-icon color="white" size="32">mdi-shield-account</v-icon>
          </v-avatar>
          <div class="text-h5 font-weight-bold">Welcome to OphilliaHRMS</div>
          <div class="text-body-2 text-grey mt-1">Set up your admin account and company to get started</div>
        </div>

        <v-form @submit.prevent="handleSubmit" ref="formRef">
          <div class="text-overline text-grey-darken-1 mb-2">Admin Account</div>

          <v-text-field
            v-model="form.email"
            label="Email Address"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
            type="email"
            :rules="[rules.required, rules.email]"
            class="mb-1"
          />

          <v-text-field
            v-model="form.password"
            label="Password"
            prepend-inner-icon="mdi-lock-outline"
            variant="outlined"
            :type="showPassword ? 'text' : 'password'"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            :rules="[rules.required, rules.passwordLength]"
            hint="Min 10 chars, uppercase, lowercase, digit, special char"
            persistent-hint
            class="mb-1"
          />

          <v-text-field
            v-model="form.confirmPassword"
            label="Confirm Password"
            prepend-inner-icon="mdi-lock-check-outline"
            variant="outlined"
            :type="showPassword ? 'text' : 'password'"
            :rules="[rules.required, rules.passwordMatch]"
            class="mb-3"
          />

          <v-divider class="mb-4" />

          <div class="text-overline text-grey-darken-1 mb-2">Company Details</div>

          <v-text-field
            v-model="form.companyName"
            label="Company Name"
            prepend-inner-icon="mdi-office-building-outline"
            variant="outlined"
            :rules="[rules.required]"
            class="mb-1"
          />

          <v-text-field
            v-model="form.companyDomain"
            label="Domain (optional)"
            prepend-inner-icon="mdi-web"
            variant="outlined"
            hint="e.g. acme.com"
            persistent-hint
            class="mb-3"
          />

          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            class="mb-4"
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
            rounded="lg"
            :loading="isSubmitting"
          >
            Create Account & Company
          </v-btn>
        </v-form>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'
import { resetSystemStatusCache } from '@/router'
import apiClient from '@/utils/api-client'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref()
const isSubmitting = ref(false)
const showPassword = ref(false)
const errorMessage = ref<string | null>(null)

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  companyName: '',
  companyDomain: '',
})

const rules = {
  required: (v: string) => !!v || 'This field is required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Invalid email address',
  passwordLength: (v: string) => v.length >= 10 || 'Password must be at least 10 characters',
  passwordMatch: (v: string) => v === form.password || 'Passwords do not match',
}

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  isSubmitting.value = true
  errorMessage.value = null

  try {
    const response: any = await apiClient.post('/auth/bootstrap', {
      email: form.email,
      password: form.password,
      company_name: form.companyName,
      company_domain: form.companyDomain || undefined,
    })

    const data = response.data || response

    if (data.access_token) {
      authStore.accessToken = data.access_token
      authStore.refreshToken = data.refresh_token
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      await authStore.fetchUser()
    }

    // Reset cached system status so router guard knows system is now initialized
    resetSystemStatusCache()
    router.push('/')
  } catch (err: any) {
    errorMessage.value = err.error?.message || err.detail || 'Setup failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

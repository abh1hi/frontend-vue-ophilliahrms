<template>
  <v-app>
    <v-main class="bg-grey-lighten-4 d-flex align-center justify-center" style="min-height: 100vh;">
      <v-card class="elevation-12 pa-8" width="100%" max-width="480" rounded="xl">
        <!-- Loading state while verifying token -->
        <div v-if="isVerifying" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="48" class="mb-4" />
          <div class="text-body-1">Verifying your invitation...</div>
        </div>

        <!-- Token invalid / expired -->
        <div v-else-if="tokenError" class="text-center py-8">
          <v-icon size="64" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
          <div class="text-h6 font-weight-bold mb-2">Invalid Invitation</div>
          <div class="text-body-2 text-grey mb-6">{{ tokenError }}</div>
          <v-btn color="primary" to="/login" rounded="lg">Go to Login</v-btn>
        </div>

        <!-- Set password form -->
        <div v-else>
          <div class="text-center mb-6">
            <v-avatar color="primary" size="56" class="mb-3">
              <v-icon color="white" size="28">mdi-account-check</v-icon>
            </v-avatar>
            <div class="text-h5 font-weight-bold">Welcome!</div>
            <div class="text-body-2 text-grey mt-1">
              Set your password to join <strong>{{ companyName }}</strong>
            </div>
          </div>

          <v-text-field
            :model-value="inviteEmail"
            label="Email"
            variant="outlined"
            prepend-inner-icon="mdi-email-outline"
            disabled
            class="mb-2"
          />

          <v-form @submit.prevent="handleSetPassword" ref="formRef">
            <v-text-field
              v-model="password"
              label="Password"
              prepend-inner-icon="mdi-lock-outline"
              variant="outlined"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              :rules="[v => !!v || 'Required', v => v.length >= 10 || 'Min 10 characters']"
              hint="Min 10 chars, uppercase, lowercase, digit, special char"
              persistent-hint
              class="mb-2"
            />

            <v-text-field
              v-model="confirmPassword"
              label="Confirm Password"
              prepend-inner-icon="mdi-lock-check-outline"
              variant="outlined"
              :type="showPassword ? 'text' : 'password'"
              :rules="[v => !!v || 'Required', v => v === password || 'Passwords do not match']"
              class="mb-3"
            />

            <v-alert
              v-if="submitError"
              type="error"
              variant="tonal"
              class="mb-4"
              closable
              @click:close="submitError = null"
            >
              {{ submitError }}
            </v-alert>

            <v-btn
              type="submit"
              color="primary"
              size="x-large"
              block
              rounded="lg"
              :loading="isSubmitting"
            >
              Create Account
            </v-btn>
          </v-form>
        </div>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'
import apiClient from '@/utils/api-client'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isVerifying = ref(true)
const tokenError = ref<string | null>(null)
const inviteEmail = ref('')
const companyName = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const formRef = ref()
const inviteToken = ref('')

onMounted(async () => {
  const token = route.query.token as string
  if (!token) {
    tokenError.value = 'No invitation token provided.'
    isVerifying.value = false
    return
  }

  inviteToken.value = token

  try {
    // Verify the invite token with the backend
    const response: any = await apiClient.get(`/auth/verify-invite?token=${encodeURIComponent(token)}`)
    const data = response.data || response
    inviteEmail.value = data.email || ''
    companyName.value = data.company_name || 'your organization'
  } catch (err: any) {
    tokenError.value = err.error?.message || 'This invitation link is invalid or has expired.'
  } finally {
    isVerifying.value = false
  }
})

const handleSetPassword = async () => {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  isSubmitting.value = true
  submitError.value = null

  try {
    const response: any = await apiClient.post('/auth/accept-invite', {
      token: inviteToken.value,
      password: password.value,
    })

    const data = response.data || response

    if (data.access_token) {
      authStore.accessToken = data.access_token
      authStore.refreshToken = data.refresh_token
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      await authStore.fetchUser()
    }

    router.push('/')
  } catch (err: any) {
    submitError.value = err.error?.message || 'Failed to create account. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

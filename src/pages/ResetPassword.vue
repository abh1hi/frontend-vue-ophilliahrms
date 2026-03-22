<template>
  <v-app>
    <v-main class="login-bg d-flex align-center justify-center">
      <v-container fluid class="d-flex align-center justify-center" style="min-height: 100vh">
        <v-row justify="center" align="center">
          <v-col cols="12" sm="8" md="5" lg="4" xl="3">
            <div class="text-center mb-8">
              <v-avatar color="primary" size="64" class="mb-4">
                <v-icon size="36" color="white">mdi-lock-reset</v-icon>
              </v-avatar>
              <h1 class="text-h4 font-weight-bold text-white">New Password</h1>
              <p class="text-body-2 text-grey-lighten-1 mt-1">OphilliaHRMS Admin Panel</p>
            </div>

            <v-card class="pa-8" elevation="8" rounded="xl">
              <v-card-text class="pa-0">
                <template v-if="!success">
                  <h2 class="text-h5 font-weight-bold mb-1">Set new password</h2>
                  <p class="text-body-2 text-medium-emphasis mb-6">
                    Enter your new password below.
                  </p>

                  <v-form @submit.prevent="handleSubmit" ref="form">
                    <v-text-field
                      v-model="password"
                      label="New Password"
                      :type="showPassword ? 'text' : 'password'"
                      prepend-inner-icon="mdi-lock-outline"
                      :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                      @click:append-inner="showPassword = !showPassword"
                      hint="Min 10 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char"
                      persistent-hint
                      :rules="passwordRules"
                      class="mb-2"
                    ></v-text-field>

                    <v-text-field
                      v-model="confirmPassword"
                      label="Confirm Password"
                      :type="showConfirm ? 'text' : 'password'"
                      prepend-inner-icon="mdi-lock-check-outline"
                      :append-inner-icon="showConfirm ? 'mdi-eye-off' : 'mdi-eye'"
                      @click:append-inner="showConfirm = !showConfirm"
                      :rules="[v => !!v || 'Required', v => v === password || 'Passwords must match']"
                    ></v-text-field>

                    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" density="compact" closable>
                      {{ error }}
                    </v-alert>

                    <v-btn
                      type="submit"
                      color="primary"
                      size="x-large"
                      block
                      class="mt-2"
                      :loading="loading"
                      rounded="lg"
                    >
                      <v-icon start>mdi-check</v-icon>
                      Reset Password
                    </v-btn>
                  </v-form>
                </template>

                <template v-else>
                  <div class="text-center py-4">
                    <v-icon size="64" color="success" class="mb-4">mdi-check-circle-outline</v-icon>
                    <h2 class="text-h5 font-weight-bold mb-2">Password Reset</h2>
                    <p class="text-body-2 text-medium-emphasis mb-6">
                      Your password has been updated. You can now sign in.
                    </p>
                    <v-btn color="primary" to="/login" rounded="lg" class="text-none">
                      <v-icon start>mdi-login</v-icon>
                      Sign In
                    </v-btn>
                  </div>
                </template>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'

const route = useRoute()
const authStore = useAuthStore()
const form = ref()
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const loading = ref(false)
const success = ref(false)
const error = ref('')

const token = route.query.token as string || ''

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 10 || 'Min 10 characters',
  (v: string) => /[A-Z]/.test(v) || 'Needs an uppercase letter',
  (v: string) => /[a-z]/.test(v) || 'Needs a lowercase letter',
  (v: string) => /\d/.test(v) || 'Needs a digit',
  (v: string) => /[!@#$%^&*()_+\-=[\]{}|;:'",.<>?/\\`~]/.test(v) || 'Needs a special character',
]

const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  if (!token) {
    error.value = 'Invalid or missing reset token. Please request a new link.'
    return
  }

  loading.value = true
  error.value = ''
  try {
    await authStore.resetPassword(token, password.value)
    success.value = true
  } catch (err: any) {
    error.value = err.error?.message || 'Failed to reset password. The link may have expired.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-bg {
  background: linear-gradient(135deg, #1E3A5F 0%, #0D9488 100%);
  min-height: 100vh;
}
</style>

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
              <h1 class="text-h4 font-weight-bold text-white">Reset Password</h1>
              <p class="text-body-2 text-grey-lighten-1 mt-1">OphilliaHRMS Admin Panel</p>
            </div>

            <v-card class="pa-8" elevation="8" rounded="xl">
              <v-card-text class="pa-0">
                <template v-if="!submitted">
                  <h2 class="text-h5 font-weight-bold mb-1">Forgot your password?</h2>
                  <p class="text-body-2 text-medium-emphasis mb-6">
                    Enter your email and we'll send you a reset link.
                  </p>

                  <v-form @submit.prevent="handleSubmit" ref="form">
                    <v-text-field
                      v-model="email"
                      label="Email Address"
                      type="email"
                      prepend-inner-icon="mdi-email-outline"
                      variant="outlined"
                      :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Must be valid']"
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
                      <v-icon start>mdi-email-fast-outline</v-icon>
                      Send Reset Link
                    </v-btn>
                  </v-form>
                </template>

                <template v-else>
                  <div class="text-center py-4">
                    <v-icon size="64" color="success" class="mb-4">mdi-email-check-outline</v-icon>
                    <h2 class="text-h5 font-weight-bold mb-2">Check your email</h2>
                    <p class="text-body-2 text-medium-emphasis mb-6">
                      If an account exists for <strong>{{ email }}</strong>, you'll receive a password reset link shortly.
                    </p>
                    <v-btn variant="text" color="primary" @click="submitted = false" class="text-none">
                      Try another email
                    </v-btn>
                  </div>
                </template>

                <v-divider class="my-6"></v-divider>

                <div class="text-center">
                  <router-link to="/login" class="text-decoration-none text-primary text-body-2 font-weight-medium">
                    <v-icon size="14" class="mr-1">mdi-arrow-left</v-icon>
                    Back to Sign In
                  </router-link>
                </div>
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
import { useAuthStore } from '@/store/auth.store'

const authStore = useAuthStore()
const form = ref()
const email = ref('')
const loading = ref(false)
const submitted = ref(false)
const error = ref('')

const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  error.value = ''
  try {
    await authStore.forgotPassword(email.value)
    submitted.value = true
  } catch (err: any) {
    // Always show success to prevent email enumeration
    submitted.value = true
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

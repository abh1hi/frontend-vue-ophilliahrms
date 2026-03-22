<template>
  <v-app>
    <v-main class="login-bg d-flex align-center justify-center">
      <v-container fluid class="d-flex align-center justify-center" style="min-height: 100vh">
        <v-row justify="center" align="center">
          <v-col cols="12" sm="8" md="5" lg="4" xl="3">
            <v-card class="pa-8 text-center" elevation="8" rounded="xl">
              <template v-if="loading">
                <v-progress-circular indeterminate color="primary" size="64" class="mb-4"></v-progress-circular>
                <h2 class="text-h5 font-weight-bold mb-2">Verifying...</h2>
                <p class="text-body-2 text-medium-emphasis">Please wait while we verify your login link.</p>
              </template>

              <template v-else-if="error">
                <v-icon size="64" color="error" class="mb-4">mdi-alert-circle-outline</v-icon>
                <h2 class="text-h5 font-weight-bold mb-2">Verification Failed</h2>
                <p class="text-body-2 text-medium-emphasis mb-6">{{ error }}</p>
                <v-btn color="primary" to="/login" rounded="lg" class="text-none">
                  <v-icon start>mdi-arrow-left</v-icon>
                  Back to Sign In
                </v-btn>
              </template>

              <template v-else>
                <v-icon size="64" color="success" class="mb-4">mdi-check-circle-outline</v-icon>
                <h2 class="text-h5 font-weight-bold mb-2">Verified!</h2>
                <p class="text-body-2 text-medium-emphasis">Redirecting to dashboard...</p>
              </template>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const token = route.query.token as string
  if (!token) {
    error.value = 'No verification token provided.'
    loading.value = false
    return
  }

  try {
    await authStore.verifyMagicLink(token)
    loading.value = false
    // Short delay so user sees success state
    setTimeout(() => router.push('/'), 1000)
  } catch (err: any) {
    error.value = err.error?.message || 'The link is invalid or has expired.'
    loading.value = false
  }
})
</script>

<style scoped>
.login-bg {
  background: linear-gradient(135deg, #1E3A5F 0%, #0D9488 100%);
  min-height: 100vh;
}
</style>

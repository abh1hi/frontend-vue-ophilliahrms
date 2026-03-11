<template>
  <v-app>
    <v-main class="bg-grey-lighten-4 d-flex align-center justify-center">
      <v-card class="elevation-12 pa-8" width="100%" max-width="450" rounded="lg">
        <v-card-title class="text-h4 font-weight-bold text-center mb-6 color-primary">
          OphilliaHRMS
        </v-card-title>
        
        <v-card-subtitle class="text-center mb-6 text-body-1">
          Sign in to your account
        </v-card-subtitle>

        <v-form @submit.prevent="handleLogin" ref="form">
          <v-text-field
            v-model="credentials.email"
            label="Email Address"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
            required
            :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'E-mail must be valid']"
          ></v-text-field>

          <v-text-field
            v-model="credentials.password"
            label="Password"
            prepend-inner-icon="mdi-lock-outline"
            variant="outlined"
            type="password"
            required
            :rules="[v => !!v || 'Password is required']"
            class="mt-4"
          ></v-text-field>

          <v-alert
            v-if="authStore.error"
            type="error"
            variant="tonal"
            class="mt-4 mb-4"
          >
            {{ authStore.error }}
          </v-alert>

          <v-btn
            type="submit"
            color="primary"
            size="x-large"
            block
            class="mt-6"
            :loading="authStore.isLoading"
          >
            Log In
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

const router = useRouter()
const authStore = useAuthStore()
const form = ref()

const credentials = reactive({
  email: '',
  password: ''
})

const handleLogin = async () => {
  const { valid } = await form.value.validate()
  
  if (!valid) return

  try {
    await authStore.login(credentials)
    // Successful login pushes to dashboard
    router.push('/')
  } catch (err) {
    // Error is handled and displayed via authStore.error state
    console.error("Login failed", err)
  }
}
</script>

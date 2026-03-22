<template>
  <v-app>
    <v-main class="login-bg d-flex align-center justify-center">
      <v-container fluid class="d-flex align-center justify-center" style="min-height: 100vh">
        <v-row justify="center" align="center">
          <v-col cols="12" sm="8" md="5" lg="4" xl="3">
            <div class="text-center mb-8">
              <v-avatar color="primary" size="64" class="mb-4">
                <v-icon size="36" color="white">mdi-shield-account</v-icon>
              </v-avatar>
              <h1 class="text-h4 font-weight-bold text-white">OphilliaHRMS</h1>
              <p class="text-body-2 text-grey-lighten-1 mt-1">Admin Control Panel</p>
            </div>

            <v-card class="pa-8" elevation="8" rounded="xl">
              <v-card-text class="pa-0">
                <h2 class="text-h5 font-weight-bold mb-1">Welcome back</h2>
                <p class="text-body-2 text-medium-emphasis mb-6">Sign in to access the admin dashboard</p>

                <!-- Password Login -->
                <v-form v-if="!magicLinkMode" @submit.prevent="handleLogin" ref="form">
                  <v-text-field
                    v-model="credentials.email"
                    label="Email Address"
                    prepend-inner-icon="mdi-email-outline"
                    variant="outlined"
                    required
                    :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'E-mail must be valid']"
                    class="mb-2"
                  ></v-text-field>

                  <v-text-field
                    v-model="credentials.password"
                    label="Password"
                    prepend-inner-icon="mdi-lock-outline"
                    variant="outlined"
                    :type="showPassword ? 'text' : 'password'"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    @click:append-inner="showPassword = !showPassword"
                    required
                    :rules="[v => !!v || 'Password is required']"
                  ></v-text-field>

                  <div class="d-flex justify-end mb-2">
                    <router-link to="/forgot-password" class="text-caption text-primary text-decoration-none font-weight-medium">
                      Forgot password?
                    </router-link>
                  </div>

                  <v-alert
                    v-if="authStore.error"
                    type="error"
                    variant="tonal"
                    class="mt-2 mb-4"
                    density="compact"
                    closable
                  >
                    {{ authStore.error }}
                  </v-alert>

                  <v-btn
                    type="submit"
                    color="primary"
                    size="x-large"
                    block
                    class="mt-4"
                    :loading="authStore.isLoading"
                    rounded="lg"
                  >
                    <v-icon start>mdi-login</v-icon>
                    Sign In
                  </v-btn>
                </v-form>

                <!-- Magic Link Login -->
                <v-form v-else @submit.prevent="handleMagicLink" ref="magicForm">
                  <template v-if="!magicLinkSent">
                    <v-text-field
                      v-model="magicEmail"
                      label="Email Address"
                      prepend-inner-icon="mdi-email-outline"
                      variant="outlined"
                      required
                      :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Must be valid']"
                    ></v-text-field>

                    <v-btn
                      type="submit"
                      color="primary"
                      size="x-large"
                      block
                      class="mt-4"
                      :loading="magicLoading"
                      rounded="lg"
                    >
                      <v-icon start>mdi-email-fast-outline</v-icon>
                      Send Login Link
                    </v-btn>
                  </template>

                  <div v-else class="text-center py-2">
                    <v-icon size="48" color="success" class="mb-3">mdi-email-check-outline</v-icon>
                    <p class="text-body-2 text-medium-emphasis">
                      A login link has been sent to <strong>{{ magicEmail }}</strong>
                    </p>
                    <v-btn variant="text" size="small" @click="magicLinkSent = false" class="mt-2 text-none">
                      Try again
                    </v-btn>
                  </div>
                </v-form>

                <v-divider class="my-6"></v-divider>

                <v-btn
                  variant="text"
                  block
                  size="small"
                  @click="magicLinkMode = !magicLinkMode; magicLinkSent = false"
                  class="text-none text-medium-emphasis"
                >
                  <v-icon start size="16">{{ magicLinkMode ? 'mdi-lock-outline' : 'mdi-link-variant' }}</v-icon>
                  {{ magicLinkMode ? 'Sign in with password' : 'Sign in with email link' }}
                </v-btn>

                <div class="d-flex align-center justify-center ga-2 text-caption text-medium-emphasis mt-4">
                  <v-icon size="14">mdi-shield-check</v-icon>
                  Secured access for Super Admin, Admin &amp; HR
                </div>
              </v-card-text>
            </v-card>

            <p class="text-center text-caption text-grey-lighten-1 mt-6">
              &copy; {{ new Date().getFullYear() }} OphilliaHRMS. All rights reserved.
            </p>
          </v-col>
        </v-row>
      </v-container>
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
const magicForm = ref()
const showPassword = ref(false)
const magicLinkMode = ref(false)
const magicLinkSent = ref(false)
const magicEmail = ref('')
const magicLoading = ref(false)

const credentials = reactive({
  email: '',
  password: ''
})

const handleLogin = async () => {
  const { valid } = await form.value.validate()

  if (!valid) return

  try {
    await authStore.login(credentials)

    // Backend-driven routing decision
    const context = await authStore.fetchPostLoginContext()

    switch (context.next_action) {
      case 'CREATE_COMPANY':
        router.push('/create-company')
        return
      case 'SELECT_COMPANY':
        router.push('/select-company')
        return
      case 'ENTER_DASHBOARD':
      default:
        router.push('/')
        return
    }
  } catch (err) {
    // Error is handled and displayed via authStore.error state
    console.error("Login failed", err)
  }
}

const handleMagicLink = async () => {
  const { valid } = await magicForm.value.validate()
  if (!valid) return

  magicLoading.value = true
  try {
    await authStore.sendMagicLink(magicEmail.value)
    magicLinkSent.value = true
  } catch {
    // Always show success to prevent email enumeration
    magicLinkSent.value = true
  } finally {
    magicLoading.value = false
  }
}
</script>

<style scoped>
.login-bg {
  background: linear-gradient(135deg, #1E3A5F 0%, #0D9488 100%);
  min-height: 100vh;
}
</style>

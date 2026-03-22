<template>
  <Sidebar v-model="sidebarOpen" />

  <!-- Top App Bar -->
  <v-app-bar flat color="surface" border="b" density="comfortable">
    <div class="d-flex align-center px-4 w-100">
      <!-- Mobile hamburger -->
      <v-btn
        icon="mdi-menu"
        variant="text"
        size="small"
        class="d-md-none mr-2"
        @click="sidebarOpen = !sidebarOpen"
      ></v-btn>

      <!-- Breadcrumb -->
      <div class="d-none d-sm-block">
        <v-breadcrumbs :items="breadcrumbs" density="compact" class="pa-0 text-body-2">
          <template v-slot:divider>
            <v-icon size="14">mdi-chevron-right</v-icon>
          </template>
        </v-breadcrumbs>
      </div>
      <!-- Mobile title -->
      <div class="d-sm-none text-body-1 font-weight-medium">
        {{ routeNames[route.name as string] || 'Dashboard' }}
      </div>

      <v-spacer />

      <!-- Quick Actions -->
      <v-btn icon variant="text" size="small" class="mr-1 d-none d-sm-flex">
        <v-icon size="22">mdi-magnify</v-icon>
        <v-tooltip activator="parent" location="bottom">Search</v-tooltip>
      </v-btn>

      <ThemeToggle class="mr-1" />

      <v-btn icon variant="text" size="small" class="mr-1" to="/notifications">
        <v-badge :content="notificationCount" :model-value="notificationCount > 0" color="error" size="x-small">
          <v-icon size="22">mdi-bell-outline</v-icon>
        </v-badge>
        <v-tooltip activator="parent" location="bottom">Notifications</v-tooltip>
      </v-btn>

      <v-divider vertical class="mx-3 d-none d-sm-flex" length="24"></v-divider>

      <!-- User Menu -->
      <v-menu min-width="200" rounded="lg">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" variant="text" class="text-none" rounded="lg">
            <v-avatar color="primary" size="32" class="mr-2">
              <span class="text-white text-caption font-weight-bold">{{ userInitials }}</span>
            </v-avatar>
            <div class="text-left d-none d-md-block">
              <div class="text-body-2 font-weight-medium">{{ authStore.user?.name || 'Admin' }}</div>
              <div class="text-caption text-medium-emphasis" style="line-height: 1;">{{ roleLabel }}</div>
            </div>
            <v-icon end size="18" class="d-none d-md-flex">mdi-chevron-down</v-icon>
          </v-btn>
        </template>

        <v-card>
          <v-card-text class="pa-2">
            <div class="px-3 py-2">
              <div class="text-body-2 font-weight-bold">{{ authStore.user?.name || 'Admin' }}</div>
              <div class="text-caption text-medium-emphasis">{{ authStore.user?.email }}</div>
            </div>
            <v-divider class="my-1"></v-divider>
            <v-list density="compact" nav class="pa-0">
              <v-list-item prepend-icon="mdi-account-outline" title="My Profile" to="/profile" rounded="lg"></v-list-item>
              <v-list-item v-if="authStore.userRole === 'super_admin'" prepend-icon="mdi-cog-outline" title="Settings" to="/settings" rounded="lg"></v-list-item>
            </v-list>
            <v-divider class="my-1"></v-divider>
            <v-list density="compact" nav class="pa-0">
              <v-list-item prepend-icon="mdi-logout" title="Sign Out" rounded="lg" @click="handleLogout" base-color="error"></v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-menu>
    </div>
  </v-app-bar>

  <v-main>
    <v-container fluid class="pa-4 pa-md-6">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'
import { useSystemStore } from '@/store/system.store'
import Sidebar from '@/components/layout/Sidebar.vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const systemStore = useSystemStore()

const sidebarOpen = ref(true)

const notificationCount = computed(() => {
  return systemStore.notificationLogs.filter(l => l.status === 'FAILED').length
})

const userInitials = computed(() => {
  const name = authStore.user?.name || 'A'
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
})

const roleLabel = computed(() => {
  const role = authStore.user?.role || ''
  const labels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    hr: 'HR Manager',
    manager: 'Manager',
  }
  return labels[role] || role || 'User'
})

const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  employees: 'Employees',
  departments: 'Departments',
  attendance: 'Attendance',
  leave: 'Leave Management',
  payroll: 'Payroll',
  notifications: 'Notifications',
  'audit-logs': 'Audit Logs',
  students: 'Students',
  classes: 'Classes',
  companies: 'Companies',
  settings: 'Settings',
  users: 'User Management',
  holidays: 'Holidays',
  'my-profile': 'My Profile',
  geofences: 'Geofences',
  'attendance-policies': 'Attendance Policies',
  'productivity-reports': 'Productivity Reports',
  'notification-preferences': 'Notification Preferences',
}

const breadcrumbs = computed(() => {
  const items = [{ title: 'Admin', disabled: false, href: '/' }]
  const name = route.name as string
  if (name && name !== 'dashboard') {
    items.push({ title: routeNames[name] || name, disabled: true, href: '' })
  }
  return items
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

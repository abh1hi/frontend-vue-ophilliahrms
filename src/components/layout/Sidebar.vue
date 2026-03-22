<template>
  <v-navigation-drawer
    v-model="drawerModel"
    :rail="!mobile && rail"
    :permanent="!mobile"
    :temporary="mobile"
    color="primary"
    dark
    @click="mobile ? undefined : (rail = false)"
  >
    <!-- Brand Header -->
    <div class="d-flex align-center pa-4" :class="!mobile && rail ? 'justify-center' : ''">
      <v-avatar color="secondary" :size="!mobile && rail ? 36 : 42">
        <v-icon color="white" :size="!mobile && rail ? 20 : 24">mdi-shield-account</v-icon>
      </v-avatar>
      <div v-if="mobile || !rail" class="ml-3">
        <div class="text-subtitle-1 font-weight-bold text-white">OphilliaHRMS</div>
        <div class="text-caption" style="color: rgba(255,255,255,0.6)">Admin Panel</div>
      </div>
      <v-spacer v-if="mobile || !rail" />
      <v-btn
        v-if="!mobile && !rail"
        icon="mdi-chevron-left"
        variant="text"
        size="small"
        color="white"
        @click.stop="rail = !rail"
      ></v-btn>
      <v-btn
        v-if="mobile"
        icon="mdi-close"
        variant="text"
        size="small"
        color="white"
        @click.stop="drawerModel = false"
      ></v-btn>
    </div>

    <v-divider color="rgba(255,255,255,0.12)"></v-divider>

    <!-- User Info (when expanded) -->
    <div v-if="mobile || !rail" class="pa-4">
      <div class="d-flex align-center">
        <v-avatar color="secondary" size="40">
          <span class="text-white text-body-2 font-weight-bold">{{ userInitials }}</span>
        </v-avatar>
        <div class="ml-3">
          <div class="text-body-2 font-weight-medium text-white">{{ authStore.user?.name || 'Admin User' }}</div>
          <v-chip size="x-small" :color="roleColor" variant="flat" class="mt-1">
            {{ roleLabel }}
          </v-chip>
        </div>
      </div>
    </div>
    <div v-else class="d-flex justify-center py-3">
      <v-avatar color="secondary" size="32">
        <span class="text-white text-caption font-weight-bold">{{ userInitials }}</span>
      </v-avatar>
    </div>

    <v-divider color="rgba(255,255,255,0.12)"></v-divider>

    <!-- Navigation Groups -->
    <v-list density="compact" nav class="px-2 pt-2">
      <template v-for="group in visibleGroups" :key="group.title">
        <div v-if="mobile || !rail" class="text-overline px-4 pt-3 pb-1" style="color: rgba(255,255,255,0.45); font-size: 0.65rem !important; letter-spacing: 0.1em;">
          {{ group.title }}
        </div>
        <v-divider v-if="!mobile && rail" color="rgba(255,255,255,0.08)" class="my-1"></v-divider>

        <v-list-item
          v-for="item in group.items"
          :key="item.value"
          :prepend-icon="item.icon"
          :title="item.title"
          :value="item.value"
          :to="item.to"
          rounded="lg"
          class="mb-1 nav-item"
          active-class="nav-item-active"
          @click="mobile ? (drawerModel = false) : undefined"
        ></v-list-item>
      </template>
    </v-list>

    <template v-slot:append>
      <v-divider color="rgba(255,255,255,0.12)"></v-divider>
      <div class="pa-3">
        <v-btn
          v-if="!mobile && rail"
          icon
          variant="text"
          size="small"
          @click.stop="rail = false"
          class="mx-auto d-block mb-2"
        >
          <v-icon color="white" size="18">mdi-chevron-right</v-icon>
        </v-btn>
        <v-btn
          v-if="mobile || !rail"
          block
          variant="tonal"
          color="white"
          prepend-icon="mdi-logout"
          @click="handleLogout"
          rounded="lg"
          class="text-none"
        >
          Sign Out
        </v-btn>
        <v-btn
          v-else
          icon="mdi-logout"
          variant="text"
          size="small"
          @click="handleLogout"
        >
          <v-icon color="white" size="18">mdi-logout</v-icon>
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/store/auth.store'

const props = defineProps<{
  modelValue?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const router = useRouter()
const authStore = useAuthStore()
const { mobile } = useDisplay()

const internalDrawer = ref(true)
const rail = ref(false)

const drawerModel = computed({
  get: () => props.modelValue !== undefined ? props.modelValue : internalDrawer.value,
  set: (val: boolean) => {
    internalDrawer.value = val
    emit('update:modelValue', val)
  },
})

// Auto-collapse rail on medium screens
watch(mobile, (isMobile) => {
  if (isMobile) {
    rail.value = false
    drawerModel.value = false
  } else {
    drawerModel.value = true
  }
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

const roleColor = computed(() => {
  const role = authStore.user?.role || ''
  const colors: Record<string, string> = {
    super_admin: '#7C3AED',
    admin: '#3B82F6',
    hr: '#0D9488',
    manager: '#F59E0B',
  }
  return colors[role] || '#64748B'
})

interface NavItem {
  title: string
  icon: string
  value: string
  to: string
  roles: string[] | null
}

interface NavGroup {
  title: string
  roles: string[] | null
  items: NavItem[]
}

const navigationGroups: NavGroup[] = [
  {
    title: 'Main',
    roles: null,
    items: [
      { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', value: 'dashboard', to: '/', roles: null },
    ],
  },
  {
    title: 'HR Management',
    roles: null,
    items: [
      { title: 'Employees', icon: 'mdi-account-group-outline', value: 'employees', to: '/employees', roles: null },
      { title: 'Departments', icon: 'mdi-office-building-outline', value: 'departments', to: '/departments', roles: null },
      { title: 'Attendance', icon: 'mdi-clock-check-outline', value: 'attendance', to: '/attendance', roles: null },
      { title: 'Geofences', icon: 'mdi-map-marker-radius', value: 'geofences', to: '/attendance/geofences', roles: ['super_admin', 'hr'] },
      { title: 'Policies', icon: 'mdi-file-document-edit-outline', value: 'attendance-policies', to: '/attendance/policies', roles: ['super_admin', 'hr'] },
      { title: 'Leave Management', icon: 'mdi-calendar-remove-outline', value: 'leave', to: '/leave', roles: null },
      { title: 'Payroll', icon: 'mdi-cash-multiple', value: 'payroll', to: '/payroll', roles: null },
      { title: 'Holidays', icon: 'mdi-calendar-star', value: 'holidays', to: '/holidays', roles: null },
    ],
  },
  {
    title: 'Academic',
    roles: null,
    items: [
      { title: 'Students', icon: 'mdi-school-outline', value: 'students', to: '/students', roles: null },
      { title: 'Classes', icon: 'mdi-google-classroom', value: 'classes', to: '/classes', roles: null },
    ],
  },
  {
    title: 'System',
    roles: ['super_admin', 'admin'],
    items: [
      { title: 'Productivity Reports', icon: 'mdi-chart-bar', value: 'productivity-reports', to: '/reports/productivity', roles: ['super_admin', 'hr'] },
      { title: 'User Management', icon: 'mdi-account-cog-outline', value: 'users', to: '/users', roles: ['super_admin', 'admin'] },
      { title: 'Notifications', icon: 'mdi-bell-outline', value: 'notifications', to: '/notifications', roles: null },
      { title: 'Notification Prefs', icon: 'mdi-bell-cog-outline', value: 'notification-preferences', to: '/notification-preferences', roles: null },
      { title: 'Audit Logs', icon: 'mdi-clipboard-text-clock-outline', value: 'audit', to: '/audit-logs', roles: ['super_admin', 'admin'] },
    ],
  },
  {
    title: 'Super Admin',
    roles: ['super_admin'],
    items: [
      { title: 'Companies', icon: 'mdi-domain', value: 'companies', to: '/companies', roles: ['super_admin'] },
      { title: 'Settings', icon: 'mdi-cog-outline', value: 'settings', to: '/settings', roles: ['super_admin'] },
    ],
  },
]

const visibleGroups = computed(() => {
  const userRole = authStore.userRole
  return navigationGroups
    .filter(group => group.roles === null || (userRole && group.roles.includes(userRole)))
    .map(group => ({
      ...group,
      items: group.items.filter(item => item.roles === null || (userRole && item.roles.includes(userRole))),
    }))
    .filter(group => group.items.length > 0)
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.nav-item {
  color: rgba(255, 255, 255, 0.7) !important;
  transition: all 0.2s ease;
}

.nav-item:hover {
  color: white !important;
  background: rgba(255, 255, 255, 0.08) !important;
}

.nav-item-active {
  color: white !important;
  background: rgba(255, 255, 255, 0.15) !important;
}

.nav-item-active .v-icon {
  color: #14B8A6 !important;
}
</style>

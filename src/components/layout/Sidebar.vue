<template>
  <v-navigation-drawer v-model="drawer" :rail="rail" permanent @click="rail = false">
    <v-list-item
      prepend-avatar="https://randomuser.me/api/portraits/men/85.jpg"
      :title="authStore.user?.name || 'HR Admin'"
      :subtitle="authStore.user?.role || 'Administrator'"
      nav
    >
      <template v-slot:append>
        <v-btn
          icon="mdi-chevron-left"
          variant="text"
          @click.stop="rail = !rail"
        ></v-btn>
      </template>
    </v-list-item>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item
        v-for="item in navigationItems"
        :key="item.value"
        :prepend-icon="item.icon"
        :title="item.title"
        :value="item.value"
        :to="item.to"
        color="primary"
        exact
      ></v-list-item>
    </v-list>
    
    <template v-slot:append>
      <div class="pa-2">
        <v-btn v-if="!rail" block color="error" variant="text" prepend-icon="mdi-logout" @click="handleLogout">
          Logout
        </v-btn>
        <v-btn v-else icon="mdi-logout" color="error" variant="text" @click="handleLogout"></v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const drawer = ref(true)
const rail = ref(false)

const navigationItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', value: 'dashboard', to: '/' },
  { title: 'Employees', icon: 'mdi-account-group', value: 'employees', to: '/employees' },
  { title: 'Departments', icon: 'mdi-office-building', value: 'departments', to: '/departments' },
  { title: 'Attendance', icon: 'mdi-clock-check-outline', value: 'attendance', to: '/attendance' },
  { title: 'Leave Management', icon: 'mdi-calendar-remove', value: 'leave', to: '/leave' },
  { title: 'Payroll', icon: 'mdi-cash-multiple', value: 'payroll', to: '/payroll' },
  { title: 'Notifications', icon: 'mdi-bell-outline', value: 'notifications', to: '/notifications' },
  { title: 'Audit Logs', icon: 'mdi-clipboard-text-clock-outline', value: 'audit', to: '/audit-logs' },
  { title: 'Students', icon: 'mdi-school', value: 'students', to: '/students' },
  { title: 'Classes', icon: 'mdi-google-classroom', value: 'classes', to: '/classes' },
  { title: 'Settings', icon: 'mdi-cog-outline', value: 'settings', to: '/settings' },
]

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

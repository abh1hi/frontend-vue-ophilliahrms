<template>
  <v-navigation-drawer
    v-model="drawerModel"
    :permanent="!mobile"
    :temporary="mobile"
    color="surface"
    :width="260"
    style="border-right: 1px solid rgba(0,0,0,0.08);"
  >
    <!-- ── Brand Header ── -->
    <div class="brand-header d-flex align-center px-4 py-3 gap-3">
      <div class="brand-icon">
        <v-icon color="primary" size="22">mdi-shield-account</v-icon>
      </div>
      <div class="flex-grow-1 min-w-0">
        <div class="brand-name">OphilliaHRMS</div>
        <div class="brand-sub">Admin Panel</div>
      </div>
      <v-btn
        v-if="mobile"
        icon="mdi-close"
        variant="text"
        size="x-small"
        density="compact"
        @click.stop="drawerModel = false"
      />
    </div>

    <v-divider />

    <!-- ── User Info ── -->
    <div class="user-card mx-3 my-2 px-3 py-2 rounded-lg d-flex align-center gap-2">
      <v-avatar :color="roleColor" size="32" class="flex-shrink-0">
        <span class="text-white text-caption font-weight-bold" style="font-size:11px;">{{ userInitials }}</span>
      </v-avatar>
      <div class="min-w-0 flex-grow-1">
        <div class="user-name text-truncate">{{ authStore.user?.name || 'Admin User' }}</div>
        <div class="user-role">{{ roleLabel }}</div>
      </div>
    </div>

    <v-divider class="mx-3 mb-1" />

    <!-- ── Tree Navigation ── -->
    <div class="tree-nav px-2 py-1">
      <div
        v-for="group in visibleGroups"
        :key="group.title"
        class="tree-group mb-1"
      >
        <!-- Group folder node -->
        <button
          class="tree-folder d-flex align-center w-100 px-2 py-1 rounded"
          @click="toggleGroup(group.title)"
        >
          <v-icon
            size="14"
            class="chevron-icon mr-1"
            :class="expandedGroups.has(group.title) ? 'chevron-open' : ''"
            style="color: #94A3B8; transition: transform 0.18s ease; flex-shrink:0;"
          >
            mdi-chevron-right
          </v-icon>
          <v-icon
            size="17"
            class="mr-2"
            :style="{ color: getFolderColor(group.title), flexShrink: 0 }"
          >
            {{ getFolderIcon(group.title) }}
          </v-icon>
          <span class="tree-folder-label">{{ group.title }}</span>
        </button>

        <!-- Group children -->
        <div
          v-show="expandedGroups.has(group.title)"
          class="tree-children"
        >
          <!-- Tree indent line -->
          <div class="tree-indent">
            <div class="tree-line" />
            <div class="tree-items flex-grow-1">
              <router-link
                v-for="item in group.items"
                :key="item.value"
                :to="item.to"
                custom
                v-slot="{ isActive, navigate }"
              >
                <button
                  class="tree-item d-flex align-center w-100 px-2 py-1 rounded mb-px"
                  :class="{ 'tree-item-active': isActive }"
                  @click="() => { navigate(); if(mobile) drawerModel = false }"
                >
                  <v-icon
                    size="16"
                    class="mr-2"
                    :style="{ color: isActive ? 'rgb(var(--v-theme-primary))' : getItemColor(item.value), flexShrink: 0 }"
                  >
                    {{ item.icon }}
                  </v-icon>
                  <span class="tree-item-label" :class="{ 'active-label': isActive }">
                    {{ item.title }}
                  </span>
                </button>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Footer ── -->
    <template v-slot:append>
      <v-divider />
      <div class="pa-3">
        <button class="sign-out-btn d-flex align-center w-100 px-3 py-2 rounded" @click="handleLogout">
          <v-icon size="17" class="mr-2" color="error">mdi-logout</v-icon>
          <span class="sign-out-label">Sign Out</span>
        </button>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/store/auth.store'

const props = defineProps<{ modelValue?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const router = useRouter()
const authStore = useAuthStore()
const { mobile } = useDisplay()

const internalDrawer = ref(true)

const drawerModel = computed({
  get: () => props.modelValue !== undefined ? props.modelValue : internalDrawer.value,
  set: (val: boolean) => {
    internalDrawer.value = val
    emit('update:modelValue', val)
  },
})

watch(mobile, (isMobile) => {
  if (isMobile) drawerModel.value = false
  else drawerModel.value = true
})

// ── Tree expand/collapse state ──
const expandedGroups = ref<Set<string>>(new Set(['Main', 'HR Management']))

function toggleGroup(title: string) {
  if (expandedGroups.value.has(title)) {
    expandedGroups.value.delete(title)
  } else {
    expandedGroups.value.add(title)
  }
  // Trigger reactivity
  expandedGroups.value = new Set(expandedGroups.value)
}

// ── User info ──
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

// ── Folder icon/color per group ──
function getFolderIcon(title: string): string {
  const map: Record<string, string> = {
    'Main':        'mdi-folder-home-outline',
    'HR Management': 'mdi-folder-account-outline',
    'Academic':    'mdi-folder-school-outline',
    'System':      'mdi-folder-cog-outline',
    'Super Admin': 'mdi-folder-key-outline',
  }
  return map[title] ?? 'mdi-folder-outline'
}

function getFolderColor(title: string): string {
  const map: Record<string, string> = {
    'Main':        '#F59E0B',
    'HR Management': '#F59E0B',
    'Academic':    '#F59E0B',
    'System':      '#F59E0B',
    'Super Admin': '#A855F7',
  }
  return map[title] ?? '#F59E0B'
}

// ── Item icon color ──
function getItemColor(value: string): string {
  const map: Record<string, string> = {
    'dashboard':              '#6366F1',
    'employees':              '#3B82F6',
    'departments':            '#06B6D4',
    'attendance':             '#10B981',
    'geofences':              '#14B8A6',
    'attendance-policies':    '#F59E0B',
    'attendance-dashboard':   '#8B5CF6',
    'leave':                  '#EF4444',
    'payroll':                '#22C55E',
    'holidays':               '#F97316',
    'students':               '#3B82F6',
    'classes':                '#8B5CF6',
    'productivity-reports':   '#F59E0B',
    'users':                  '#6366F1',
    'notifications':          '#EC4899',
    'notification-preferences': '#F97316',
    'audit':                  '#64748B',
    'companies':              '#A855F7',
    'settings':               '#64748B',
  }
  return map[value] ?? '#94A3B8'
}

// ── Navigation groups ──
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
      { title: 'Geofences', icon: 'mdi-map-marker-radius', value: 'geofences', to: '/attendance/geofences', roles: ['super_admin', 'admin', 'hr'] },
      { title: 'Policies', icon: 'mdi-file-document-edit-outline', value: 'attendance-policies', to: '/attendance/policies', roles: ['super_admin', 'admin', 'hr'] },
      { title: 'Attendance Dashboard', icon: 'mdi-chart-box-outline', value: 'attendance-dashboard', to: '/attendance/dashboard', roles: ['super_admin', 'admin'] },
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
      { title: 'Productivity Reports', icon: 'mdi-chart-bar', value: 'productivity-reports', to: '/reports/productivity', roles: ['super_admin', 'admin', 'hr'] },
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
/* ── Brand ── */
.brand-header {
  min-height: 56px;
}
.brand-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: rgba(var(--v-theme-primary), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.brand-name {
  font-size: 13px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.2;
}
.brand-sub {
  font-size: 10px;
  color: #94A3B8;
  letter-spacing: 0.03em;
}

/* ── User card ── */
.user-card {
  background: rgba(var(--v-theme-primary), 0.05);
}
.user-name {
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.3;
}
.user-role {
  font-size: 10px;
  color: #94A3B8;
}

/* ── Tree ── */
.tree-nav {
  overflow-y: auto;
}

.tree-folder {
  background: transparent;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background 0.15s;
}
.tree-folder:hover {
  background: rgba(var(--v-theme-on-surface), 0.05);
}
.tree-folder-label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  letter-spacing: 0.01em;
  flex-grow: 1;
  text-align: left;
}

.chevron-icon {
  transition: transform 0.18s ease !important;
}
.chevron-open {
  transform: rotate(90deg) !important;
}

/* ── Tree children with indent line ── */
.tree-indent {
  display: flex;
  padding-left: 12px;
}
.tree-line {
  width: 1px;
  background: rgba(var(--v-theme-on-surface), 0.1);
  margin-right: 10px;
  margin-left: 6px;
  flex-shrink: 0;
  border-radius: 1px;
}
.tree-items {
  min-width: 0;
}

/* ── Tree item ── */
.tree-item {
  background: transparent;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: background 0.12s;
  border-radius: 6px;
}
.tree-item:hover {
  background: rgba(var(--v-theme-on-surface), 0.05);
}
.tree-item-active {
  background: rgba(var(--v-theme-primary), 0.1) !important;
}
.tree-item-label {
  font-size: 12.5px;
  color: #475569;
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.active-label {
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600;
}

.mb-px {
  margin-bottom: 1px;
}

/* ── Sign out ── */
.sign-out-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}
.sign-out-btn:hover {
  background: rgba(239, 68, 68, 0.06);
}
.sign-out-label {
  font-size: 12.5px;
  color: #EF4444;
  font-weight: 500;
}

/* ── Minimal scrollbar ── */
.tree-nav::-webkit-scrollbar { width: 3px; }
.tree-nav::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 2px; }
</style>

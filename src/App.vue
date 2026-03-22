<template>
  <v-app :theme="themeStore.current">
    <router-view />
    <NotificationToast />
  </v-app>
</template>

<script setup lang="ts">
import NotificationToast from '@/components/common/NotificationToast.vue'
import { useThemeStore } from '@/store/theme.store'

const themeStore = useThemeStore()
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Admin panel scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(128, 128, 128, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(128, 128, 128, 0.5);
}

/* Smooth transitions for route changes */
.v-main {
  transition: padding 0.2s ease;
}

/* Theme transition */
.v-application {
  transition: background-color 0.3s ease, color 0.3s ease;
}
</style>

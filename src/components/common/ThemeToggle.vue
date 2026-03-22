<template>
  <v-btn
    icon
    variant="text"
    size="small"
    @click="handleToggle"
  >
    <v-icon size="22">{{ themeStore.isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
    <v-tooltip activator="parent" location="bottom">
      {{ themeStore.isDark ? 'Light mode' : 'Dark mode' }}
    </v-tooltip>
  </v-btn>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import { useThemeStore } from '@/store/theme.store'

const themeStore = useThemeStore()
const vuetifyTheme = useTheme()

const handleToggle = () => {
  themeStore.toggle()
  vuetifyTheme.global.name.value = themeStore.current
}
</script>

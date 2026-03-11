<template>
  <v-app>
    <router-view />
    <NotificationToast />
  </v-app>
</template>

<script setup lang="ts">
import NotificationToast from '@/components/common/NotificationToast.vue'
</script>

<style>
/* Global resets or utility overrides can go here */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>

<template>
  <Sidebar />
  <v-main class="bg-grey-lighten-4">
    <v-container fluid class="fill-height align-start">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import Sidebar from '@/components/layout/Sidebar.vue'
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

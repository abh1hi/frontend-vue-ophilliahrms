<template>
  <div class="toast-container">
    <v-snackbar
      v-for="(toast, index) in toastStore.toasts"
      :key="toast.id"
      :model-value="true"
      :color="toast.color"
      location="top right"
      :style="{ marginTop: `${index * 60}px` }"
      timeout="-1"
      class="mt-4 mr-4"
    >
      {{ toast.text }}

      <template v-slot:actions>
        <v-btn
          variant="text"
          icon="mdi-close"
          @click="toastStore.remove(toast.id)"
        ></v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { useToastStore } from '@/store/toast.store'

const toastStore = useToastStore()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9999;
}
</style>

<template>
  <div class="mb-2">
    <div class="d-flex align-center px-3 py-1 bg-grey-lighten-4 rounded mt-2">
      <v-icon size="15" class="mr-2" color="primary">{{ icon }}</v-icon>
      <span class="text-caption font-weight-bold text-grey-darken-2 text-uppercase tracking-wider">
        {{ title }}
      </span>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{ icon: string; title: string }>()
</script>

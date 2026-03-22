<template>
  <div class="d-flex flex-column align-center justify-center py-12 text-center">
    <v-icon :size="64" color="medium-emphasis" class="mb-4">{{ icon }}</v-icon>
    <h3 class="text-h6 font-weight-medium mb-1">{{ title }}</h3>
    <p v-if="subtitle" class="text-body-2 text-medium-emphasis mb-4" style="max-width: 400px;">{{ subtitle }}</p>
    <slot name="action"></slot>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string
  title?: string
  subtitle?: string
}>(), {
  icon: 'mdi-inbox-outline',
  title: 'No data found',
})
</script>

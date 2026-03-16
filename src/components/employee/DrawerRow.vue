<template>
  <div v-if="value != null && value !== ''" class="d-flex justify-space-between px-3 py-1">
    <span class="text-caption text-grey-darken-1 flex-shrink-0 mr-2">{{ label }}</span>
    <span class="text-caption font-weight-medium text-grey-darken-3" style="text-align:right;word-break:break-word;">
      {{ value }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value?: string | number | null }>()
</script>

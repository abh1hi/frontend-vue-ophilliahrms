<template>
  <v-chip
    :color="chipColor"
    :size="size"
    label
    class="text-uppercase font-weight-bold"
  >
    {{ displayText }}
  </v-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  status: string
  colorMap?: Record<string, string>
  size?: string
  labelMap?: Record<string, string>
}>(), {
  size: 'small',
})

const defaultColorMap: Record<string, string> = {
  active: 'success',
  present: 'success',
  approved: 'success',
  completed: 'success',
  sent: 'success',
  delivered: 'success',
  healthy: 'success',

  pending: 'warning',
  processing: 'warning',
  late: 'warning',
  draft: 'warning',
  half_day: 'info',

  error: 'error',
  failed: 'error',
  rejected: 'error',
  terminated: 'error',
  absent: 'error',
  expelled: 'error',
  not_completed: 'error',

  inactive: 'grey',
  withdrawn: 'grey',
  cancelled: 'grey',

  graduated: 'primary',
  partially_completed: 'info',
}

const chipColor = computed(() => {
  const status = props.status?.toLowerCase() || ''
  if (props.colorMap && props.colorMap[status]) return props.colorMap[status]
  return defaultColorMap[status] || 'grey'
})

const displayText = computed(() => {
  const status = props.status || ''
  if (props.labelMap && props.labelMap[status.toLowerCase()]) return props.labelMap[status.toLowerCase()]
  return status.replace(/_/g, ' ')
})
</script>

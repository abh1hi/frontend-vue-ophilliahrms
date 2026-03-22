<template>
  <v-card class="stat-card" :to="to" v-bind="$attrs">
    <v-card-text class="pa-4 pa-md-5">
      <div class="d-flex align-center justify-space-between">
        <div class="min-width-0">
          <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold" style="letter-spacing: 0.05em;">
            {{ title }}
          </div>
          <div class="text-h5 text-md-h4 font-weight-black mt-2">{{ value }}</div>
          <div v-if="subtitle" class="text-caption mt-1" :class="trendClass">
            <v-icon v-if="trend" size="12" :color="trendColor" class="mr-1">{{ trendIcon }}</v-icon>
            {{ subtitle }}
          </div>
        </div>
        <v-avatar :color="iconColor" variant="tonal" size="48" :rounded="iconRounded">
          <v-icon size="26">{{ icon }}</v-icon>
        </v-avatar>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  value: string | number
  subtitle?: string
  icon: string
  iconColor?: string
  iconRounded?: string
  to?: string
  trend?: 'up' | 'down' | 'flat'
}>(), {
  iconColor: 'primary',
  iconRounded: 'lg',
})

const trendIcon = computed(() => {
  if (props.trend === 'up') return 'mdi-trending-up'
  if (props.trend === 'down') return 'mdi-trending-down'
  return 'mdi-minus'
})

const trendColor = computed(() => {
  if (props.trend === 'up') return 'success'
  if (props.trend === 'down') return 'error'
  return 'grey'
})

const trendClass = computed(() => {
  if (props.trend === 'up') return 'text-success'
  if (props.trend === 'down') return 'text-error'
  return 'text-medium-emphasis'
})
</script>

<style scoped>
.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.min-width-0 {
  min-width: 0;
}
</style>

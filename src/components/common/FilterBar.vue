<template>
  <v-card class="mb-4" rounded="lg">
    <v-card-text class="pa-4">
      <v-row dense align="center">
        <v-col
          v-for="filter in filters"
          :key="filter.key"
          cols="12"
          :sm="colSize"
          :md="colSize"
        >
          <!-- Text input -->
          <v-text-field
            v-if="filter.type === 'text'"
            v-model="localValues[filter.key]"
            :label="filter.label"
            density="compact"
            hide-details
            clearable
            prepend-inner-icon="mdi-magnify"
          ></v-text-field>

          <!-- Select -->
          <v-select
            v-else-if="filter.type === 'select'"
            v-model="localValues[filter.key]"
            :label="filter.label"
            :items="filter.options || []"
            :multiple="filter.multiple"
            density="compact"
            hide-details
            clearable
          ></v-select>

          <!-- Date -->
          <v-text-field
            v-else-if="filter.type === 'date'"
            v-model="localValues[filter.key]"
            :label="filter.label"
            type="date"
            density="compact"
            hide-details
            clearable
          ></v-text-field>

          <!-- Date range (start) -->
          <v-text-field
            v-else-if="filter.type === 'daterange'"
            v-model="localValues[filter.key + '_from']"
            :label="filter.label + ' From'"
            type="date"
            density="compact"
            hide-details
            clearable
          ></v-text-field>
        </v-col>

        <!-- Date range (end) — rendered separately for daterange filters -->
        <v-col
          v-for="filter in dateRangeFilters"
          :key="filter.key + '_to'"
          cols="12"
          :sm="colSize"
          :md="colSize"
        >
          <v-text-field
            v-model="localValues[filter.key + '_to']"
            :label="filter.label + ' To'"
            type="date"
            density="compact"
            hide-details
            clearable
          ></v-text-field>
        </v-col>

        <!-- Action buttons -->
        <v-col cols="12" sm="auto" class="d-flex ga-2 align-center">
          <v-btn color="primary" variant="tonal" size="small" @click="handleApply" class="text-none">
            <v-icon start size="16">mdi-filter</v-icon>
            Apply
          </v-btn>
          <v-btn variant="text" size="small" @click="handleReset" class="text-none">
            Reset
          </v-btn>
          <slot name="append"></slot>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface FilterConfig {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'daterange'
  options?: { title: string; value: any }[]
  multiple?: boolean
}

const props = defineProps<{
  filters: FilterConfig[]
  modelValue: Record<string, any>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'apply': [value: Record<string, any>]
  'reset': []
}>()

const localValues = ref<Record<string, any>>({ ...props.modelValue })

watch(() => props.modelValue, (v) => {
  localValues.value = { ...v }
}, { deep: true })

const dateRangeFilters = computed(() => props.filters.filter(f => f.type === 'daterange'))

const colSize = computed(() => {
  const count = props.filters.length + dateRangeFilters.value.length
  if (count <= 2) return 4
  if (count <= 4) return 3
  return 2
})

const handleApply = () => {
  emit('update:modelValue', { ...localValues.value })
  emit('apply', { ...localValues.value })
}

const handleReset = () => {
  const empty: Record<string, any> = {}
  props.filters.forEach(f => {
    if (f.type === 'daterange') {
      empty[f.key + '_from'] = null
      empty[f.key + '_to'] = null
    } else {
      empty[f.key] = null
    }
  })
  localValues.value = empty
  emit('update:modelValue', empty)
  emit('reset')
}
</script>

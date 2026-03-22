<template>
  <div class="w-100">
    <v-tabs
      v-model="activeTab"
      color="primary"
      density="comfortable"
      class="mb-4"
      :show-arrows="mobile"
    >
      <v-tab
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
        class="text-none"
      >
        <v-icon v-if="tab.icon" start size="18">{{ tab.icon }}</v-icon>
        {{ tab.label }}
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab">
      <v-tabs-window-item
        v-for="tab in tabs"
        :key="tab.value"
        :value="tab.value"
      >
        <slot :name="tab.value"></slot>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

export interface TabConfig {
  value: string
  label: string
  icon?: string
}

const props = defineProps<{
  tabs: TabConfig[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { mobile } = useDisplay()

const activeTab = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
</script>

<template>
  <v-card class="elevation-2" rounded="lg">
    <v-card-title class="d-flex align-center bg-grey-lighten-4 py-3">
      <span class="text-h6 font-weight-bold text-grey-darken-3">{{ title }}</span>
      <v-spacer></v-spacer>
      
      <!-- Slot for extra actions (e.g., Create Button) -->
      <slot name="actions"></slot>
      
      <v-text-field
        v-if="searchable"
        v-model="search"
        append-inner-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
        density="compact"
        class="ml-4 max-w-sm"
        @input="onSearch"
      ></v-text-field>
    </v-card-title>

    <v-data-table-server
      v-model:items-per-page="itemsPerPage"
      v-model:page="page"
      :headers="headers"
      :items="items"
      :items-length="totalItems"
      :loading="loading"
      :search="search"
      @update:options="onOptionsUpdate"
      class="elevation-0"
    >
      <!-- Pass down slots to v-data-table-server to allow custom column rendering -->
      <template v-for="(_, slotName) in $slots" v-slot:[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps || {}"></slot>
      </template>
    </v-data-table-server>
  </v-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  title: string
  headers: any[]
  items: any[]
  totalItems: number
  loading: boolean
  searchable?: boolean
  initialPage?: number
  initialItemsPerPage?: number
}>()

const emit = defineEmits<{
  (e: 'update:options', options: any): void
  (e: 'search', query: string): void
}>()

const page = ref(props.initialPage || 1)
const itemsPerPage = ref(props.initialItemsPerPage || 10)
const search = ref('')

// Debounce search
let timeout: any = null
const onSearch = () => {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(() => {
    emit('search', search.value)
  }, 500)
}

const onOptionsUpdate = (options: any) => {
  emit('update:options', options)
}

// Watchers for external resets
watch(() => props.initialPage, (newVal) => {
  if (newVal) page.value = newVal
})
</script>

<style scoped>
.max-w-sm {
  max-width: 300px;
}
</style>

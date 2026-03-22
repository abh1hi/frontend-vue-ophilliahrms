<template>
  <v-file-input
    v-model="internalFiles"
    :label="label"
    :accept="accept"
    :multiple="multiple"
    :hint="hint"
    :persistent-hint="!!hint"
    variant="outlined"
    density="comfortable"
    prepend-icon=""
    prepend-inner-icon="mdi-upload"
    show-size
    counter
    @update:model-value="handleChange"
  >
    <template v-slot:selection="{ fileNames }">
      <template v-for="fileName in fileNames" :key="fileName">
        <v-chip size="small" label class="me-2" color="primary" variant="tonal">
          {{ fileName }}
        </v-chip>
      </template>
    </template>
  </v-file-input>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: File | File[] | null
  label?: string
  accept?: string
  multiple?: boolean
  hint?: string
}>(), {
  label: 'Upload File',
  accept: '.csv,.xlsx,.xls',
  multiple: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: File | File[] | null]
}>()

const internalFiles = ref<File | File[] | null>(props.modelValue)

watch(() => props.modelValue, (v) => { internalFiles.value = v })

const handleChange = (files: File | File[] | null) => {
  emit('update:modelValue', files)
}
</script>

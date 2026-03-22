<template>
  <v-dialog v-model="internalValue" max-width="450" persistent>
    <v-card rounded="lg" class="pa-2">
      <v-card-title class="text-h6 text-center pt-4">
        <v-icon v-if="icon" :color="confirmColor" size="48" class="mb-2 d-block mx-auto">{{ icon }}</v-icon>
        {{ title }}
      </v-card-title>
      <v-card-text class="text-center text-body-2 pb-2">
        {{ message }}
      </v-card-text>
      <v-card-actions class="justify-center pb-4 pt-2">
        <v-btn
          variant="text"
          @click="close"
          :disabled="loading"
          class="text-none"
        >
          {{ cancelText }}
        </v-btn>
        <v-btn
          :color="confirmColor"
          variant="elevated"
          @click="handleConfirm"
          :loading="loading"
          class="text-none px-6"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: string
  loading?: boolean
  icon?: string
}>(), {
  title: 'Confirm',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  confirmColor: 'error',
  loading: false,
  icon: 'mdi-alert-circle-outline',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
}>()

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const close = () => { internalValue.value = false }
const handleConfirm = () => { emit('confirm') }
</script>

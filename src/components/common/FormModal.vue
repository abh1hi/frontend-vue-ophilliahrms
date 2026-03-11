<template>
  <v-dialog v-model="internalValue" max-width="600px" persistent>
    <v-card rounded="lg">
      <v-card-title class="bg-primary text-white py-4 px-6 d-flex align-center">
        <span class="text-h6 font-weight-bold">{{ title }}</span>
        <v-spacer></v-spacer>
        <v-btn icon="mdi-close" variant="text" color="white" @click="close"></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="pa-6">
        <v-form ref="form" v-model="isFormValid" @submit.prevent="submit">
          <slot :form-data="formData"></slot>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="pa-4 bg-grey-lighten-4">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          color="grey-darken-1"
          @click="close"
          :disabled="loading"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="submit"
          :loading="loading"
          :disabled="!isFormValid || loading"
          class="px-6"
        >
          {{ submitText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
  title: string
  submitText?: string
  loading?: boolean
  initialData?: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: any): void
}>()

const internalValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const submitText = computed(() => props.submitText || 'Save')

const form = ref<any>(null)
const isFormValid = ref(false)
const formData = ref<any>({})

// Reset/Initialize form data when modal opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    formData.value = props.initialData ? { ...props.initialData } : {}
    if (form.value) form.value.resetValidation()
  }
})

const close = () => {
  internalValue.value = false
}

const submit = async () => {
  const { valid } = await form.value.validate()
  if (valid) {
    emit('submit', formData.value)
  }
}
</script>

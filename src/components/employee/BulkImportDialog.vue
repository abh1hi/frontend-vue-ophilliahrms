<template>
  <v-dialog v-model="dialogModel" max-width="520" persistent>
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center pa-4">
        <v-icon color="primary" class="mr-2">mdi-upload</v-icon>
        Bulk Import Employees
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="dialogModel = false" />
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <p class="text-body-2 text-medium-emphasis mb-4">
          Upload a CSV or Excel file with employee data. Required columns: first_name, last_name, email.
        </p>

        <FileUploadField
          v-model="selectedFile"
          label="Choose file"
          accept=".csv,.xlsx,.xls"
          hint="CSV or Excel file"
        />

        <v-alert v-if="result" :type="result.errors?.length ? 'warning' : 'success'" variant="tonal" class="mt-4" density="compact">
          <div v-if="result.created">{{ result.created }} employees imported successfully.</div>
          <div v-if="result.errors?.length" class="mt-1">
            {{ result.errors.length }} errors:
            <ul class="ml-4">
              <li v-for="(err, idx) in result.errors.slice(0, 5)" :key="idx" class="text-caption">{{ err }}</li>
              <li v-if="result.errors.length > 5" class="text-caption text-medium-emphasis">...and {{ result.errors.length - 5 }} more</li>
            </ul>
          </div>
        </v-alert>
      </v-card-text>
      <v-card-actions class="pa-4 bg-surface-variant">
        <v-spacer />
        <v-btn variant="text" @click="dialogModel = false" class="text-none">Cancel</v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="employeeStore.isLoading"
          :disabled="!selectedFile"
          @click="handleImport"
          class="text-none"
        >
          Import
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import FileUploadField from '@/components/common/FileUploadField.vue'
import { useEmployeeStore } from '@/store/employee.store'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const employeeStore = useEmployeeStore()
const selectedFile = ref<File | null>(null)
const result = ref<any>(null)

const dialogModel = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const handleImport = async () => {
  if (!selectedFile.value) return
  try {
    result.value = await employeeStore.bulkImport(selectedFile.value as File)
  } catch {
    // Error handled in store
  }
}
</script>

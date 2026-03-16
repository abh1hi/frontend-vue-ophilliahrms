<template>
  <v-dialog v-model="internalValue" max-width="900px" persistent scrollable>
    <v-card rounded="lg">

      <!-- ── Header ─────────────────────────────────────────────────────── -->
      <v-card-title class="bg-primary text-white py-4 px-6 d-flex align-center">
        <v-icon class="mr-3">{{ isEdit ? 'mdi-account-edit' : 'mdi-account-plus' }}</v-icon>
        <span class="text-h6 font-weight-bold">
          {{ isEdit ? 'Edit Employee' : 'Register New Employee' }}
        </span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" color="white" @click="close" />
      </v-card-title>

      <!-- ── Tab bar ────────────────────────────────────────────────────── -->
      <v-tabs v-model="activeTab" bg-color="grey-lighten-4" color="primary" grow>
        <v-tab v-for="tab in tabs" :key="tab.value" :value="tab.value">
          <v-icon start>{{ tab.icon }}</v-icon>{{ tab.label }}
        </v-tab>
      </v-tabs>

      <v-divider />

      <!-- ── Tab content ────────────────────────────────────────────────── -->
      <v-card-text class="pa-0" style="height: 520px; overflow-y: auto;">
        <v-form ref="form" v-model="isFormValid" @submit.prevent="submit">
          <v-tabs-window v-model="activeTab">
            <EmpPersonalTab   :form-data="formData" />
            <EmpContactTab    :form-data="formData" :is-edit="isEdit ?? false" />
            <EmpGovIdsTab     :form-data="formData" />
            <EmpBankingTab    :form-data="formData" />
            <EmpEmergencyTab  :form-data="formData" />
            <EmpEducationTab  :form-data="formData" />
            <EmpExperienceTab :form-data="formData" />
            <EmpJobInfoTab    :form-data="formData" :is-edit="isEdit ?? false" :departments="departments ?? []" />
          </v-tabs-window>
        </v-form>
      </v-card-text>

      <v-divider />

      <!-- ── Footer ─────────────────────────────────────────────────────── -->
      <v-card-actions class="pa-4 bg-grey-lighten-4">
        <!-- Progress dots -->
        <div class="d-flex align-center ga-1">
          <v-icon
            v-for="tab in tabs"
            :key="tab.value"
            :color="activeTab === tab.value ? 'primary' : 'grey-lighten-2'"
            size="10"
          >mdi-circle</v-icon>
        </div>
        <v-spacer />
        <v-btn variant="text" color="grey-darken-1" :disabled="loading" @click="close">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="loading"
          class="px-6"
          @click="submit"
        >
          {{ isEdit ? 'Update Employee' : 'Create Employee' }}
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import EmpPersonalTab   from '@/components/employee/tabs/EmpPersonalTab.vue'
import EmpContactTab    from '@/components/employee/tabs/EmpContactTab.vue'
import EmpGovIdsTab     from '@/components/employee/tabs/EmpGovIdsTab.vue'
import EmpBankingTab    from '@/components/employee/tabs/EmpBankingTab.vue'
import EmpEmergencyTab  from '@/components/employee/tabs/EmpEmergencyTab.vue'
import EmpEducationTab  from '@/components/employee/tabs/EmpEducationTab.vue'
import EmpExperienceTab from '@/components/employee/tabs/EmpExperienceTab.vue'
import EmpJobInfoTab    from '@/components/employee/tabs/EmpJobInfoTab.vue'

const props = defineProps<{
  modelValue: boolean
  isEdit?: boolean
  initialData?: any
  loading?: boolean
  departments?: any[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: any]
}>()

const tabs = [
  { value: 'personal',   icon: 'mdi-account',              label: 'Personal'   },
  { value: 'contact',    icon: 'mdi-phone',                 label: 'Contact'    },
  { value: 'ids',        icon: 'mdi-card-account-details',  label: 'Gov. IDs'   },
  { value: 'banking',    icon: 'mdi-bank',                  label: 'Banking'    },
  { value: 'emergency',  icon: 'mdi-alert-circle',          label: 'Emergency'  },
  { value: 'education',  icon: 'mdi-school',                label: 'Education'  },
  { value: 'experience', icon: 'mdi-briefcase',             label: 'Experience' },
  { value: 'job',        icon: 'mdi-domain',                label: 'Job Info'   },
]

const activeTab     = ref('personal')
const form          = ref<any>(null)
const isFormValid   = ref(false)
const formData      = ref<any>({})

const internalValue = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    activeTab.value = 'personal'
    formData.value = props.initialData
      ? { ...props.initialData }
      : { date_joined: new Date().toISOString().substring(0, 10) }
    form.value?.resetValidation()
  }
})

const close = () => { internalValue.value = false }

const submit = async () => {
  const result = await form.value?.validate()
  if (result?.valid) emit('submit', formData.value)
}
</script>

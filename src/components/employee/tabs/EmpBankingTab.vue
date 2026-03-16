<template>
  <v-tabs-window-item value="banking" class="pa-6">
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.bank_name"
          label="Bank Name"
          prepend-inner-icon="mdi-bank"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.bank_branch"
          label="Branch"
          prepend-inner-icon="mdi-map-marker-outline"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.bank_account_number"
          label="Account Number"
          prepend-inner-icon="mdi-numeric"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.ifsc_code"
          label="IFSC Code"
          prepend-inner-icon="mdi-barcode"
          maxlength="11"
          :rules="[v => !v || /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(v) || 'Invalid IFSC (e.g. SBIN0001234)']"
        />
      </v-col>
    </v-row>
  </v-tabs-window-item>
</template>

<script setup lang="ts">
const props = defineProps<{ formData: any }>()
const fd = props.formData
</script>

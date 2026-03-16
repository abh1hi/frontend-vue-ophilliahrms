<template>
  <v-tabs-window-item value="ids" class="pa-6">
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.aadhaar_number"
          label="Aadhaar Number"
          prepend-inner-icon="mdi-card-account-details"
          maxlength="12"
          counter="12"
          :rules="[v => !v || /^\d{12}$/.test(v) || 'Must be exactly 12 digits']"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.pan_number"
          label="PAN"
          prepend-inner-icon="mdi-card-text"
          maxlength="10"
          :rules="[v => !v || /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(v) || 'Invalid PAN (AAAAA9999A)']"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.uan_number"
          label="UAN"
          prepend-inner-icon="mdi-identifier"
          maxlength="12"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.esi_number"
          label="ESI Number"
          prepend-inner-icon="mdi-shield-account"
          maxlength="17"
        />
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="fd.driving_license_number"
          label="Driving License Number"
          prepend-inner-icon="mdi-car"
        />
      </v-col>
    </v-row>
  </v-tabs-window-item>
</template>

<script setup lang="ts">
const props = defineProps<{ formData: any }>()
const fd = props.formData
</script>

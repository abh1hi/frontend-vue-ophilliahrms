<template>
  <v-tabs-window-item value="experience" class="pa-6">
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.last_firm_name"
          label="Last Firm / Company Name"
          prepend-inner-icon="mdi-office-building"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.years_of_experience"
          label="Years of Experience"
          prepend-inner-icon="mdi-clock-outline"
          hint="e.g. 3.5"
          persistent-hint
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.last_designation"
          label="Last Designation"
          prepend-inner-icon="mdi-badge-account"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.last_drawn_salary"
          label="Last Drawn Salary (₹)"
          type="number"
          prepend-inner-icon="mdi-currency-inr"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.referred_by"
          label="Referred By"
          prepend-inner-icon="mdi-account-arrow-right"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-textarea
          v-model="fd.reason_to_quit"
          label="Reason to Quit Last Job"
          rows="2"
          auto-grow
        />
      </v-col>
    </v-row>
  </v-tabs-window-item>
</template>

<script setup lang="ts">
const props = defineProps<{ formData: any }>()
const fd = props.formData
</script>

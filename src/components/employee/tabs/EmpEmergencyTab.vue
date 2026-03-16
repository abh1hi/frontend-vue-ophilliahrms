<template>
  <v-tabs-window-item value="emergency" class="pa-6">
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.emergency_contact_name"
          label="Contact Person Name"
          prepend-inner-icon="mdi-account-heart"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.emergency_contact_number"
          label="Contact Person Number"
          prepend-inner-icon="mdi-phone-alert"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.emergency_contact_relation"
          label="Relationship to Employee"
          prepend-inner-icon="mdi-human-male-female"
          hint="e.g. Spouse, Parent, Sibling"
          persistent-hint
        />
      </v-col>
    </v-row>
  </v-tabs-window-item>
</template>

<script setup lang="ts">
const props = defineProps<{ formData: any }>()
const fd = props.formData
</script>

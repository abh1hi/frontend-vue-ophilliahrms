<template>
  <v-tabs-window-item value="education" class="pa-6">
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="fd.highest_qualification"
          label="Highest Educational Qualification"
          prepend-inner-icon="mdi-school"
          hint="e.g. B.Tech, MBA, MSc"
          persistent-hint
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="fd.year_of_passing"
          label="Year of Passing"
          maxlength="4"
          prepend-inner-icon="mdi-calendar-check"
          :rules="[v => !v || /^\d{4}$/.test(v) || 'Enter a valid 4-digit year']"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="fd.percentage"
          label="Percentage / CGPA"
          prepend-inner-icon="mdi-percent"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model="fd.institute_name"
          label="Institute Name"
          prepend-inner-icon="mdi-domain"
        />
      </v-col>
    </v-row>
  </v-tabs-window-item>
</template>

<script setup lang="ts">
const props = defineProps<{ formData: any }>()
const fd = props.formData
</script>

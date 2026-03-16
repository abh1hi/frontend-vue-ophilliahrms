<template>
  <v-tabs-window-item value="job" class="pa-6">
    <v-row>
      <v-col cols="12" sm="6">
        <v-select
          v-model="fd.department_id"
          :items="departments"
          item-title="name"
          item-value="id"
          label="Department"
          prepend-inner-icon="mdi-sitemap"
          clearable
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.designation"
          label="Designation"
          prepend-inner-icon="mdi-badge-account-horizontal"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.role"
          label="Role"
          prepend-inner-icon="mdi-shield-key"
          hint="e.g. hr, manager, employee"
          persistent-hint
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.project"
          label="Project"
          prepend-inner-icon="mdi-folder-open"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.date_joined"
          label="Date of Joining *"
          type="date"
          required
          prepend-inner-icon="mdi-calendar-star"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.joining_salary"
          label="Joining Salary (₹)"
          type="number"
          prepend-inner-icon="mdi-currency-inr"
        />
      </v-col>

      <!-- Status — edit only -->
      <v-col cols="12" sm="6" v-if="isEdit">
        <v-select
          v-model="fd.employment_status"
          :items="['active', 'inactive', 'on_leave', 'terminated']"
          label="Employment Status"
          prepend-inner-icon="mdi-account-check"
        />
      </v-col>
    </v-row>

    <!-- File uploads -->
    <v-divider class="my-4" />
    <SectionHeading icon="mdi-paperclip" title="File Uploads" />

    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.staff_photo_url"
          label="Staff Photograph URL"
          prepend-inner-icon="mdi-camera"
          hint="Paste the URL of the uploaded photo"
          persistent-hint
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-textarea
          v-model="fd.staff_documents_urls"
          label="Staff Documents (comma-separated URLs)"
          rows="2"
          auto-grow
          prepend-inner-icon="mdi-file-multiple"
          hint="Paste document URLs separated by commas"
          persistent-hint
        />
      </v-col>
    </v-row>
  </v-tabs-window-item>
</template>

<script setup lang="ts">
import SectionHeading from '../SectionHeading.vue'

const props = defineProps<{
  formData: any
  isEdit: boolean
  departments: any[]
}>()
const fd = props.formData
</script>

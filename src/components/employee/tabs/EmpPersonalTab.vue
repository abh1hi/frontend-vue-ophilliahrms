<template>
  <v-tabs-window-item value="personal" class="pa-6">
    <!-- Basic -->
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.first_name"
          label="First Name *"
          required
          :rules="[v => !!v || 'First name is required']"
          prepend-inner-icon="mdi-account"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.last_name"
          label="Last Name *"
          required
          :rules="[v => !!v || 'Last name is required']"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-select
          v-model="fd.gender"
          :items="['male', 'female', 'other']"
          label="Gender"
          prepend-inner-icon="mdi-gender-male-female"
          clearable
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.date_of_birth"
          label="Date of Birth"
          type="date"
          prepend-inner-icon="mdi-calendar"
        />
      </v-col>
    </v-row>

    <v-divider class="my-4" />
    <SectionHeading icon="mdi-map-marker" title="Address" />

    <v-row>
      <v-col cols="12" sm="4">
        <v-text-field v-model="fd.door_no" label="Door No." prepend-inner-icon="mdi-home" />
      </v-col>
      <v-col cols="12" sm="8">
        <v-text-field v-model="fd.street" label="Street" />
      </v-col>
      <v-col cols="12" sm="8">
        <v-text-field v-model="fd.village_town" label="Village / Town" />
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field v-model="fd.pin_code" label="PIN Code" prepend-inner-icon="mdi-post" />
      </v-col>
    </v-row>

    <v-divider class="my-4" />
    <SectionHeading icon="mdi-medical-bag" title="Health" />

    <v-row>
      <v-col cols="12" sm="6">
        <v-textarea v-model="fd.health_issues" label="Any Health Issues" rows="2" auto-grow />
      </v-col>
      <v-col cols="12" sm="6">
        <v-textarea v-model="fd.allergies" label="Any Allergies" rows="2" auto-grow />
      </v-col>
    </v-row>
  </v-tabs-window-item>
</template>

<script setup lang="ts">
import SectionHeading from '../SectionHeading.vue'

const props = defineProps<{ formData: any }>()
const fd = props.formData   // reactive object — nested mutation is fine
</script>

<template>
  <v-tabs-window-item value="contact" class="pa-6">
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.email"
          label="Work Email *"
          type="email"
          :disabled="isEdit"
          required
          :rules="[v => !!v || 'Work email is required']"
          prepend-inner-icon="mdi-email"
          hint="Used as login credential — cannot change after creation"
          persistent-hint
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.personal_email"
          label="Personal Email"
          type="email"
          prepend-inner-icon="mdi-email-outline"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.phone"
          label="Phone No. 1"
          prepend-inner-icon="mdi-phone"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fd.phone_2"
          label="Phone No. 2"
          prepend-inner-icon="mdi-phone-plus"
        />
      </v-col>
    </v-row>

    <v-text-field
      v-if="!isEdit"
      v-model="fd._initial_password"
      label="Initial Password *"
      type="password"
      prepend-inner-icon="mdi-lock"
      hint="Employee will use this to log in for the first time"
      persistent-hint
      required
      :rules="[v => !!v || 'Password is required', v => v.length >= 8 || 'Minimum 8 characters']"
      class="mt-2"
    />
  </v-tabs-window-item>
</template>

<script setup lang="ts">
const props = defineProps<{ formData: any; isEdit: boolean }>()
const fd = props.formData
</script>

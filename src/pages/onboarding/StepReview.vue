<template>
  <div class="text-center">
    <v-icon size="64" color="success" class="mb-4">mdi-check-circle-outline</v-icon>
    <div class="text-h6 font-weight-bold mb-2">You're All Set!</div>
    <div class="text-body-2 text-grey mb-6" style="max-width: 400px; margin: 0 auto;">
      Your workspace is configured. You can always adjust settings from the dashboard.
    </div>

    <v-list class="text-left mb-6" style="max-width: 360px; margin: 0 auto;" density="compact">
      <v-list-item prepend-icon="mdi-office-building-outline" title="Departments configured" />
      <v-list-item prepend-icon="mdi-calendar-remove-outline" title="Leave policies set up" />
      <v-list-item prepend-icon="mdi-account-group-outline" title="Team invitations sent" />
    </v-list>

    <v-btn
      color="primary"
      size="x-large"
      rounded="lg"
      @click="$emit('complete')"
      prepend-icon="mdi-rocket-launch"
    >
      Launch Dashboard
    </v-btn>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  complete: []
}>()
</script>

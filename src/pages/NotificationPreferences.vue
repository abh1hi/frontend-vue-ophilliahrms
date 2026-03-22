<template>
  <v-container fluid class="pa-4 pa-md-6">
    <PageHeader title="Notification Preferences" subtitle="Manage how you receive notifications" />

    <v-progress-linear v-if="notificationStore.isLoading && !notificationStore.preferences" indeterminate color="primary" class="mb-4" />

    <v-card v-if="notificationStore.preferences" rounded="lg" border class="pa-6" max-width="600">
      <div class="text-subtitle-1 font-weight-bold mb-4">Delivery Channels</div>

      <v-list class="pa-0">
        <v-list-item class="px-0">
          <template #prepend>
            <v-avatar color="primary" variant="tonal" size="40" class="mr-4">
              <v-icon>mdi-email-outline</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-medium">Email Notifications</v-list-item-title>
          <v-list-item-subtitle>Receive notifications via email</v-list-item-subtitle>
          <template #append>
            <v-switch
              :model-value="notificationStore.preferences.email_enabled"
              color="primary"
              hide-details
              density="compact"
              @update:model-value="toggleEmail"
            />
          </template>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-item class="px-0">
          <template #prepend>
            <v-avatar color="teal" variant="tonal" size="40" class="mr-4">
              <v-icon>mdi-message-text-outline</v-icon>
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-medium">SMS Notifications</v-list-item-title>
          <v-list-item-subtitle>Receive notifications via SMS</v-list-item-subtitle>
          <template #append>
            <v-switch
              :model-value="notificationStore.preferences.sms_enabled"
              color="teal"
              hide-details
              density="compact"
              @update:model-value="toggleSms"
            />
          </template>
        </v-list-item>
      </v-list>

      <v-alert type="info" variant="tonal" density="compact" class="mt-6">
        Changes are saved automatically.
      </v-alert>
    </v-card>

    <EmptyState
      v-else-if="!notificationStore.isLoading"
      icon="mdi-bell-off-outline"
      title="Preferences unavailable"
      subtitle="Unable to load your notification preferences"
    />
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useNotificationStore } from '@/store/notification.store'

const notificationStore = useNotificationStore()

onMounted(() => {
  notificationStore.fetchPreferences()
})

const toggleEmail = (val: boolean | null) => {
  notificationStore.updatePreferences({ email_enabled: !!val })
}

const toggleSms = (val: boolean | null) => {
  notificationStore.updatePreferences({ sms_enabled: !!val })
}
</script>

<template>
  <v-card v-if="onboardingStore.shouldShowWidget" class="mb-6" rounded="xl" variant="outlined" color="primary">
    <v-card-text class="pa-5">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="d-flex align-center">
          <v-avatar color="primary" variant="tonal" size="40" rounded="lg" class="mr-3">
            <v-icon size="22">mdi-rocket-launch-outline</v-icon>
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-bold">Getting Started</div>
            <div class="text-caption text-medium-emphasis">
              {{ onboardingStore.completedCount }}/{{ onboardingStore.totalSteps }} steps complete
            </div>
          </div>
        </div>
        <div class="d-flex align-center ga-2">
          <v-btn
            v-if="onboardingStore.status !== 'COMPLETE'"
            variant="tonal"
            color="primary"
            size="small"
            rounded="lg"
            to="/onboarding"
            class="text-none"
          >
            Continue Setup
          </v-btn>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="x-small"
            @click="onboardingStore.dismiss()"
          />
        </div>
      </div>

      <v-progress-linear
        :model-value="onboardingStore.progressPercent"
        color="primary"
        height="6"
        rounded
        class="mb-3"
      />

      <v-list density="compact" class="pa-0 bg-transparent">
        <v-list-item
          v-for="step in onboardingStore.currentSteps"
          :key="step.key"
          class="px-0"
          density="compact"
        >
          <template v-slot:prepend>
            <v-icon
              :color="step.completed ? 'success' : step.skipped ? 'grey' : 'grey-lighten-1'"
              size="20"
              class="mr-2"
            >
              {{ step.completed ? 'mdi-check-circle' : step.skipped ? 'mdi-minus-circle' : 'mdi-circle-outline' }}
            </v-icon>
          </template>
          <v-list-item-title
            class="text-body-2"
            :class="{ 'text-decoration-line-through text-medium-emphasis': step.skipped }"
          >
            {{ step.label }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useOnboardingStore } from '@/store/onboarding.store'

const onboardingStore = useOnboardingStore()
</script>

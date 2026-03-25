<template>
  <v-app>
    <v-main class="bg-grey-lighten-4">
      <v-container class="py-8" style="max-width: 800px;">
        <!-- Header -->
        <div class="text-center mb-6">
          <v-avatar color="primary" size="56" class="mb-3">
            <v-icon color="white" size="28">mdi-rocket-launch-outline</v-icon>
          </v-avatar>
          <div class="text-h5 font-weight-bold">Get Started with OphilliaHRMS</div>
          <div class="text-body-2 text-grey mt-1">Complete these steps to set up your workspace</div>
        </div>

        <!-- Stepper -->
        <v-stepper
          v-model="currentStep"
          :items="stepItems"
          alt-labels
          flat
          class="bg-transparent elevation-0"
        >
          <template v-slot:[`item.1`]>
            <v-card class="pa-6" rounded="xl">
              <StepDepartments @next="completeAndNext('departments')" @skip="skipAndNext('departments')" />
            </v-card>
          </template>

          <template v-slot:[`item.2`]>
            <v-card class="pa-6" rounded="xl">
              <StepLeavePolicy @next="completeAndNext('leave_policy')" @skip="skipAndNext('leave_policy')" />
            </v-card>
          </template>

          <template v-slot:[`item.3`]>
            <v-card class="pa-6" rounded="xl">
              <StepInviteTeam @next="completeAndNext('invite_team')" @skip="skipAndNext('invite_team')" />
            </v-card>
          </template>

          <template v-slot:[`item.4`]>
            <v-card class="pa-6" rounded="xl">
              <StepReview @complete="completeOnboarding" />
            </v-card>
          </template>
        </v-stepper>

        <!-- Skip All -->
        <div class="text-center mt-4">
          <v-btn variant="text" color="grey" @click="skipAll" size="small">
            Skip setup and go to dashboard
          </v-btn>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useOnboardingStore } from '@/store/onboarding.store'
import StepDepartments from './StepDepartments.vue'
import StepLeavePolicy from './StepLeavePolicy.vue'
import StepInviteTeam from './StepInviteTeam.vue'
import StepReview from './StepReview.vue'

const router = useRouter()
const onboardingStore = useOnboardingStore()
const currentStep = ref(1)

const stepItems = [
  { title: 'Departments', value: 1 },
  { title: 'Leave Policy', value: 2 },
  { title: 'Invite Team', value: 3 },
  { title: 'Review', value: 4 },
]

const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const completeAndNext = (stepKey: string) => {
  onboardingStore.completeStep(stepKey)
  nextStep()
}

const skipAndNext = (stepKey: string) => {
  onboardingStore.skipStep(stepKey)
  nextStep()
}

const completeOnboarding = async () => {
  onboardingStore.markComplete()
  router.push('/')
}

const skipAll = () => {
  onboardingStore.dismiss()
  router.push('/')
}
</script>

import { defineStore } from 'pinia'

export type OnboardingStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE' | 'DISMISSED'

export interface OnboardingStep {
  key: string
  label: string
  completed: boolean
  skipped: boolean
}

const DEFAULT_STEPS: OnboardingStep[] = [
  { key: 'departments', label: 'Set up departments', completed: false, skipped: false },
  { key: 'leave_policy', label: 'Review leave policies', completed: false, skipped: false },
  { key: 'invite_team', label: 'Invite team members', completed: false, skipped: false },
  { key: 'first_employee', label: 'Add first employee', completed: false, skipped: false },
]

export const useOnboardingStore = defineStore('onboarding', {
  state: () => ({
    status: (localStorage.getItem('onboarding_status') || 'NOT_STARTED') as OnboardingStatus,
    steps: JSON.parse(localStorage.getItem('onboarding_steps') || 'null') as OnboardingStep[] | null,
    dismissed: localStorage.getItem('onboarding_dismissed') === 'true',
  }),

  getters: {
    currentSteps: (state): OnboardingStep[] => state.steps || DEFAULT_STEPS,

    completedCount(): number {
      return this.currentSteps.filter(s => s.completed || s.skipped).length
    },

    totalSteps(): number {
      return this.currentSteps.length
    },

    progressPercent(): number {
      return this.totalSteps > 0 ? Math.round((this.completedCount / this.totalSteps) * 100) : 0
    },

    isComplete(): boolean {
      return this.status === 'COMPLETE' || this.completedCount === this.totalSteps
    },

    shouldShowWidget(): boolean {
      return !this.dismissed && this.status !== 'COMPLETE'
    },
  },

  actions: {
    completeStep(key: string) {
      const steps = this.steps || [...DEFAULT_STEPS]
      const step = steps.find(s => s.key === key)
      if (step) {
        step.completed = true
        this.steps = steps
        this.status = 'IN_PROGRESS'
        this._persist()
      }
    },

    skipStep(key: string) {
      const steps = this.steps || [...DEFAULT_STEPS]
      const step = steps.find(s => s.key === key)
      if (step) {
        step.skipped = true
        this.steps = steps
        this.status = 'IN_PROGRESS'
        this._persist()
      }
    },

    markComplete() {
      this.status = 'COMPLETE'
      if (this.steps) {
        this.steps.forEach(s => { if (!s.completed) s.skipped = true })
      }
      this._persist()
    },

    dismiss() {
      this.dismissed = true
      this._persist()
    },

    reset() {
      this.status = 'NOT_STARTED'
      this.steps = null
      this.dismissed = false
      this._persist()
    },

    _persist() {
      localStorage.setItem('onboarding_status', this.status)
      localStorage.setItem('onboarding_dismissed', String(this.dismissed))
      if (this.steps) {
        localStorage.setItem('onboarding_steps', JSON.stringify(this.steps))
      } else {
        localStorage.removeItem('onboarding_steps')
      }
    },
  },
})

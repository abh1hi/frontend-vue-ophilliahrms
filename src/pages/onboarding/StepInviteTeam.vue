<template>
  <div>
    <div class="text-h6 font-weight-bold mb-1">Invite Your Team</div>
    <div class="text-body-2 text-grey mb-4">
      Add team members by email. They'll receive an invitation to join your organization.
    </div>

    <div v-for="(invite, index) in invites" :key="index" class="d-flex ga-2 mb-2">
      <v-text-field
        v-model="invite.email"
        label="Email"
        variant="outlined"
        density="compact"
        prepend-inner-icon="mdi-email-outline"
        :rules="[v => !v || /.+@.+\..+/.test(v) || 'Invalid email']"
        class="flex-grow-1"
      />
      <v-select
        v-model="invite.role"
        :items="roleOptions"
        label="Role"
        variant="outlined"
        density="compact"
        style="max-width: 180px;"
      />
      <v-btn
        icon="mdi-close"
        variant="text"
        size="small"
        color="grey"
        @click="removeInvite(index)"
        :disabled="invites.length <= 1"
      />
    </div>

    <v-btn
      variant="text"
      color="primary"
      prepend-icon="mdi-plus"
      size="small"
      @click="addInvite"
      :disabled="invites.length >= 10"
      class="mb-4"
    >
      Add Another
    </v-btn>

    <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
      {{ error }}
    </v-alert>

    <v-alert v-if="sentCount > 0" type="success" variant="tonal" density="compact" class="mb-4">
      {{ sentCount }} invitation(s) sent successfully.
    </v-alert>

    <v-alert type="info" variant="tonal" density="compact" class="mb-4">
      You can always invite more people later from User Management.
    </v-alert>

    <div class="d-flex justify-end ga-2">
      <v-btn variant="text" @click="$emit('skip')" :disabled="saving">Skip</v-btn>
      <v-btn color="primary" @click="handleNext" :loading="saving">
        {{ hasInvites ? 'Send Invites & Continue' : 'Continue' }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import apiClient from '@/utils/api-client'

const emit = defineEmits<{
  next: []
  skip: []
}>()

interface Invite {
  email: string
  role: string
}

const invites = ref<Invite[]>([
  { email: '', role: 'hr' },
])

const roleOptions = [
  { title: 'HR Manager', value: 'hr' },
  { title: 'Manager', value: 'manager' },
  { title: 'Employee', value: 'employee' },
]

const saving = ref(false)
const error = ref('')
const sentCount = ref(0)

const hasInvites = computed(() => invites.value.some(i => i.email.trim() !== ''))

const addInvite = () => {
  invites.value.push({ email: '', role: 'employee' })
}

const removeInvite = (index: number) => {
  invites.value.splice(index, 1)
}

const handleNext = async () => {
  const valid = invites.value.filter(i => i.email.trim() !== '' && /.+@.+\..+/.test(i.email))
  if (valid.length === 0) {
    emit('next')
    return
  }

  saving.value = true
  error.value = ''
  sentCount.value = 0

  try {
    const response: any = await apiClient.post('/auth/invite-batch', {
      invites: valid.map(i => ({ email: i.email.trim(), role: i.role })),
    })
    sentCount.value = response?.data?.sent_count ?? valid.length
    emit('next')
  } catch (err: any) {
    error.value = err?.error?.message || err?.message || 'Failed to send invitations'
  } finally {
    saving.value = false
  }
}
</script>

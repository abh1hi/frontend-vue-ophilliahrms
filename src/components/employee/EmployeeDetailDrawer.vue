<template>
  <v-navigation-drawer
    v-model="internalValue"
    location="right"
    width="420"
    temporary
  >
    <template v-if="employee">

      <!-- Header -->
      <div class="pa-5 bg-primary d-flex align-center gap-4">
        <v-avatar :color="employee.staff_photo_url ? undefined : 'white'" size="56">
          <v-img v-if="employee.staff_photo_url" :src="employee.staff_photo_url" />
          <span v-else class="text-h6 font-weight-bold text-primary">{{ initials }}</span>
        </v-avatar>
        <div class="flex-grow-1 min-w-0">
          <div class="text-h6 text-white font-weight-bold text-truncate">
            {{ employee.first_name }} {{ employee.last_name }}
          </div>
          <div class="text-caption text-white opacity-80 text-truncate">{{ employee.email }}</div>
          <v-chip :color="statusColor" size="x-small" class="mt-1">
            {{ employee.employment_status }}
          </v-chip>
        </div>
        <v-btn icon="mdi-close" variant="text" color="white" @click="internalValue = false" />
      </div>

      <!-- Sections -->
      <div class="overflow-y-auto" style="height: calc(100% - 200px)">

        <DrawerSection title="Job Info" icon="mdi-domain">
          <DrawerRow label="Designation"    :value="employee.designation" />
          <DrawerRow label="Department"     :value="employee.department_id" />
          <DrawerRow label="Role"           :value="employee.role" />
          <DrawerRow label="Project"        :value="employee.project" />
          <DrawerRow label="Date Joined"    :value="employee.date_joined" />
          <DrawerRow label="Joining Salary" :value="formatCurrency(employee.joining_salary)" />
        </DrawerSection>

        <DrawerSection title="Personal" icon="mdi-account">
          <DrawerRow label="Gender"         :value="employee.gender" />
          <DrawerRow label="Date of Birth"  :value="employee.date_of_birth" />
          <DrawerRow label="Phone 1"        :value="employee.phone" />
          <DrawerRow label="Phone 2"        :value="employee.phone_2" />
          <DrawerRow label="Personal Email" :value="employee.personal_email" />
        </DrawerSection>

        <DrawerSection title="Address" icon="mdi-map-marker">
          <DrawerRow label="Door No"        :value="employee.door_no" />
          <DrawerRow label="Street"         :value="employee.street" />
          <DrawerRow label="Village / Town" :value="employee.village_town" />
          <DrawerRow label="PIN Code"       :value="employee.pin_code" />
        </DrawerSection>

        <DrawerSection title="Government IDs" icon="mdi-card-account-details">
          <DrawerRow label="Aadhaar"         :value="mask(employee.aadhaar_number)" />
          <DrawerRow label="PAN"             :value="employee.pan_number" />
          <DrawerRow label="UAN"             :value="employee.uan_number" />
          <DrawerRow label="ESI No"          :value="employee.esi_number" />
          <DrawerRow label="Driving License" :value="employee.driving_license_number" />
        </DrawerSection>

        <DrawerSection title="Banking" icon="mdi-bank">
          <DrawerRow label="Bank"       :value="employee.bank_name" />
          <DrawerRow label="Branch"     :value="employee.bank_branch" />
          <DrawerRow label="Account No" :value="mask(employee.bank_account_number)" />
          <DrawerRow label="IFSC"       :value="employee.ifsc_code" />
        </DrawerSection>

        <DrawerSection title="Emergency Contact" icon="mdi-alert-circle">
          <DrawerRow label="Name"     :value="employee.emergency_contact_name" />
          <DrawerRow label="Phone"    :value="employee.emergency_contact_number" />
          <DrawerRow label="Relation" :value="employee.emergency_contact_relation" />
        </DrawerSection>

        <DrawerSection title="Education" icon="mdi-school">
          <DrawerRow label="Qualification" :value="employee.highest_qualification" />
          <DrawerRow label="Year"          :value="employee.year_of_passing" />
          <DrawerRow label="Percentage"    :value="employee.percentage" />
          <DrawerRow label="Institute"     :value="employee.institute_name" />
        </DrawerSection>

        <DrawerSection title="Work History" icon="mdi-briefcase">
          <DrawerRow label="Last Firm"        :value="employee.last_firm_name" />
          <DrawerRow label="Experience"       :value="employee.years_of_experience" />
          <DrawerRow label="Last Designation" :value="employee.last_designation" />
          <DrawerRow label="Last Salary"      :value="formatCurrency(employee.last_drawn_salary)" />
          <DrawerRow label="Referred By"      :value="employee.referred_by" />
          <DrawerRow label="Reason to Quit"   :value="employee.reason_to_quit" />
        </DrawerSection>

        <DrawerSection title="Health" icon="mdi-medical-bag">
          <DrawerRow label="Health Issues" :value="employee.health_issues" />
          <DrawerRow label="Allergies"     :value="employee.allergies" />
        </DrawerSection>

      </div>

      <!-- Quick actions -->
      <div class="pa-4 d-flex gap-2 border-t">
        <v-btn
          variant="outlined"
          color="primary"
          prepend-icon="mdi-pencil"
          class="flex-grow-1"
          @click="$emit('edit', employee)"
        >Edit</v-btn>
        <v-btn
          variant="outlined"
          color="error"
          prepend-icon="mdi-account-off"
          @click="$emit('deactivate', employee)"
        >Deactivate</v-btn>
      </div>

    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Employee } from '@/types/employee.types'
import DrawerSection from './DrawerSection.vue'
import DrawerRow from './DrawerRow.vue'

const props = defineProps<{
  modelValue: boolean
  employee: Employee | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  edit: [employee: Employee]
  deactivate: [employee: Employee]
}>()

const internalValue = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const initials = computed(() =>
  `${props.employee?.first_name?.[0] || ''}${props.employee?.last_name?.[0] || ''}`.toUpperCase()
)

const statusColor = computed(() => {
  switch (props.employee?.employment_status) {
    case 'active':     return 'success'
    case 'on_leave':   return 'info'
    case 'inactive':   return 'warning'
    case 'terminated': return 'error'
    default:           return 'grey'
  }
})

const mask = (val?: string | null) =>
  val && val.length > 4 ? '••••' + val.slice(-4) : val ?? undefined

const formatCurrency = (val?: number | null) =>
  val != null ? '₹' + Number(val).toLocaleString('en-IN') : undefined
</script>

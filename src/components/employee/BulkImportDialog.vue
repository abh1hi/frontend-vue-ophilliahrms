<template>
  <v-dialog v-model="dialogModel" max-width="900" persistent scrollable>
    <v-card rounded="lg" style="min-height:540px;">

      <!-- ── Header ── -->
      <v-card-title class="bg-primary text-white py-4 px-6 d-flex align-center">
        <v-icon class="mr-3">mdi-table-arrow-up</v-icon>
        <span class="text-h6 font-weight-bold">Bulk Import Employees</span>
        <v-spacer />
        <v-chip size="small" color="white" variant="tonal" class="mr-2">
          Step {{ step }} / 3
        </v-chip>
        <v-btn icon="mdi-close" variant="text" color="white" size="small" @click="onClose" />
      </v-card-title>

      <!-- ── Resume Banner ── -->
      <v-alert
        v-if="resumeSession && step === 1"
        type="warning" variant="tonal" density="compact"
        class="mx-4 mt-3" icon="mdi-history"
      >
        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
          <span class="text-body-2">
            Interrupted import: <strong>{{ resumeSession.fileName }}</strong>
            — {{ resumeSession.processedRows }}/{{ resumeSession.totalRows }} rows processed
          </span>
          <div class="d-flex ga-2">
            <v-btn size="x-small" color="warning" variant="flat" class="text-none" @click="startResume">Resume</v-btn>
            <v-btn size="x-small" variant="text" class="text-none" @click="discardResume">Discard</v-btn>
          </div>
        </div>
      </v-alert>

      <!-- ── Step indicator ── -->
      <div class="px-4 pt-3 pb-1">
        <v-stepper :model-value="step" alt-labels flat bg-color="transparent" style="box-shadow:none;">
          <v-stepper-header style="box-shadow:none;">
            <v-stepper-item value="1" title="Upload File" :complete="step > 1" color="primary" />
            <v-divider />
            <v-stepper-item value="2" title="Map Fields" :complete="step > 2" color="primary" />
            <v-divider />
            <v-stepper-item value="3" title="Import" color="primary" />
          </v-stepper-header>
        </v-stepper>
      </div>

      <v-card-text class="pa-0" style="overflow-y:auto; max-height:500px;">

        <!-- ════════════════════ STEP 1: UPLOAD ════════════════════ -->
        <div v-if="step === 1" class="pa-4">
          <div
            class="drop-zone rounded-lg d-flex flex-column align-center justify-center pa-8 mb-4"
            :class="{ 'drop-zone--active': isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="onDrop"
            @click="fileInput?.click()"
            style="cursor:pointer; border:2px dashed rgba(var(--v-theme-primary),0.4); min-height:160px; transition:all 0.2s;"
          >
            <v-icon size="48" :color="isDragging ? 'primary' : 'medium-emphasis'" class="mb-3">mdi-file-upload-outline</v-icon>
            <p class="text-body-1 font-weight-medium mb-1">
              {{ selectedFile ? selectedFile.name : 'Drop your file here or click to browse' }}
            </p>
            <p class="text-caption text-medium-emphasis">Supports .xlsx, .xls, .csv — max 5 MB</p>
            <input ref="fileInput" type="file" accept=".csv,.xlsx,.xls" class="d-none" @change="onFileChange" />
          </div>
          <v-alert v-if="parseError" type="error" variant="tonal" density="compact" class="mb-4">{{ parseError }}</v-alert>
          <!-- Preview -->
          <div v-if="previewRows.length">
            <p class="text-caption text-medium-emphasis mb-2">
              Preview — {{ allDataRows.length }} data rows, {{ detectedColumns.length }} columns
            </p>
            <div style="overflow-x:auto; max-height:200px; overflow-y:auto;">
              <table class="preview-table text-caption">
                <thead><tr><th v-for="col in detectedColumns" :key="col">{{ col }}</th></tr></thead>
                <tbody>
                  <tr v-for="(row, ri) in previewRows.slice(0, 5)" :key="ri">
                    <td v-for="col in detectedColumns" :key="col">{{ row[col] ?? '' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ════════════════════ STEP 2: MAP FIELDS (tabbed like EmployeeForm) ════════════════════ -->
        <div v-if="step === 2">
          <!-- Legend bar -->
          <div class="d-flex align-center ga-3 pa-4 pb-2">
            <v-chip size="small" color="error" variant="tonal" prepend-icon="mdi-asterisk">Mandatory</v-chip>
            <v-chip size="small" color="default" variant="tonal" prepend-icon="mdi-minus">Optional</v-chip>
            <v-spacer />
            <v-btn size="x-small" variant="text" color="primary" class="text-none" @click="autoMap">
              <v-icon start size="14">mdi-auto-fix</v-icon> Auto-detect
            </v-btn>
          </div>

          <v-tabs v-model="mapTab" bg-color="grey-lighten-4" color="primary" grow>
            <v-tab v-for="tab in MAP_TABS" :key="tab.value" :value="tab.value">
              <v-icon start size="18">{{ tab.icon }}</v-icon>
              <span class="text-caption">{{ tab.label }}</span>
            </v-tab>
          </v-tabs>
          <v-divider />

          <v-tabs-window v-model="mapTab" style="min-height:320px;">
            <v-tabs-window-item v-for="tab in MAP_TABS" :key="tab.value" :value="tab.value">
              <div class="pa-4">
                <v-row dense>
                  <v-col
                    v-for="field in getFieldsForTab(tab.value)"
                    :key="field.key"
                    cols="12" sm="6"
                  >
                    <v-select
                      v-model="fieldMapping[field.key]"
                      :items="columnOptions"
                      :label="field.label + (field.required ? ' *' : '')"
                      density="compact"
                      variant="outlined"
                      :color="field.required ? 'error' : 'primary'"
                      :base-color="field.required && !fieldMapping[field.key] ? 'error' : undefined"
                      hide-details
                      class="mb-3"
                    >
                      <template #prepend-inner>
                        <v-icon size="14" :color="field.required ? 'error' : 'grey'">
                          {{ field.required ? 'mdi-asterisk' : 'mdi-minus' }}
                        </v-icon>
                      </template>
                      <template #append-inner>
                        <v-icon
                          v-if="fieldMapping[field.key] && fieldMapping[field.key] !== '__skip__'"
                          size="16" color="success"
                        >mdi-check-circle</v-icon>
                      </template>
                    </v-select>
                  </v-col>
                </v-row>
              </div>
            </v-tabs-window-item>
          </v-tabs-window>

          <v-alert v-if="mappingError" type="error" variant="tonal" density="compact" class="mx-4 mb-2">
            {{ mappingError }}
          </v-alert>
        </div>

        <!-- ════════════════════ STEP 3: IMPORT ════════════════════ -->
        <div v-if="step === 3" class="pa-4">
          <!-- Running -->
          <div v-if="importStatus === 'running'" class="text-center py-6">
            <v-progress-circular indeterminate color="primary" size="56" class="mb-4" />
            <p class="text-h6 font-weight-bold mb-1">Importing employees…</p>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Row {{ importProgress.current }} of {{ importProgress.total }}
            </p>
            <v-progress-linear
              :model-value="importPercent" color="primary" height="8" rounded
              class="mb-4" style="max-width:400px; margin:0 auto;"
            />
            <v-btn size="small" variant="tonal" color="warning" class="text-none" @click="pauseImport">Pause</v-btn>
          </div>
          <!-- Paused -->
          <div v-else-if="importStatus === 'paused'" class="text-center py-6">
            <v-icon size="56" color="warning" class="mb-4">mdi-pause-circle-outline</v-icon>
            <p class="text-h6 font-weight-bold mb-1">Import Paused</p>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ importProgress.current }} of {{ importProgress.total }} rows processed. Progress saved.
            </p>
            <div class="d-flex ga-2 justify-center">
              <v-btn color="primary" variant="flat" class="text-none" @click="runImport">Resume Import</v-btn>
              <v-btn variant="tonal" class="text-none" @click="onClose">Close &amp; Save Progress</v-btn>
            </div>
          </div>
          <!-- Done -->
          <div v-else-if="importStatus === 'done'" class="text-center py-4">
            <v-icon size="56" :color="importErrors.length ? 'warning' : 'success'" class="mb-3">
              {{ importErrors.length ? 'mdi-alert-circle-outline' : 'mdi-check-circle-outline' }}
            </v-icon>
            <p class="text-h6 font-weight-bold mb-1">Import Complete</p>
            <div class="d-flex ga-3 justify-center mb-4 flex-wrap">
              <v-chip color="success" variant="tonal" prepend-icon="mdi-check">
                {{ importProgress.total - importErrors.length }} created
              </v-chip>
              <v-chip v-if="importErrors.length" color="error" variant="tonal" prepend-icon="mdi-alert">
                {{ importErrors.length }} failed
              </v-chip>
            </div>
            <div v-if="importErrors.length" style="text-align:left; max-height:220px; overflow-y:auto;">
              <p class="text-caption text-medium-emphasis mb-2">Failed rows:</p>
              <v-list density="compact" variant="tonal" rounded="lg">
                <v-list-item
                  v-for="e in importErrors" :key="e.row"
                  :subtitle="`Row ${e.row + 1}: ${e.error}`"
                  prepend-icon="mdi-close-circle"
                  class="text-caption"
                />
              </v-list>
            </div>
          </div>
          <!-- Idle (pre-start) -->
          <div v-else class="text-center py-6">
            <v-icon size="56" color="primary" class="mb-4">mdi-rocket-launch-outline</v-icon>
            <p class="text-h6 font-weight-bold mb-1">Ready to Import</p>
            <p class="text-body-2 text-medium-emphasis mb-4">
              {{ importProgress.total }} employees will be created.
              <br/>Failed rows will not block successful ones.
            </p>
            <v-btn color="primary" variant="flat" size="large" class="text-none" @click="runImport">
              Start Import
            </v-btn>
          </div>
        </div>

      </v-card-text>

      <v-divider />
      <!-- ── Footer ── -->
      <v-card-actions class="pa-4 bg-grey-lighten-4">
        <!-- Progress dots -->
        <div class="d-flex align-center ga-1">
          <v-icon v-for="i in 3" :key="i" :color="step === i ? 'primary' : 'grey-lighten-2'" size="10">mdi-circle</v-icon>
        </div>
        <v-spacer />
        <v-btn v-if="step > 1 && importStatus === 'idle'" variant="text" class="text-none" @click="step--">Back</v-btn>
        <v-btn variant="text" color="grey-darken-1" class="text-none" @click="onClose">
          {{ importStatus === 'done' ? 'Close' : 'Cancel' }}
        </v-btn>
        <v-btn v-if="step === 1" color="primary" variant="elevated" class="text-none px-6"
          :disabled="!selectedFile || !allDataRows.length" @click="goToMapping">
          Next: Map Fields
        </v-btn>
        <v-btn v-if="step === 2" color="primary" variant="elevated" class="text-none px-6"
          @click="goToImport">
          Next: Import
        </v-btn>
      </v-card-actions>

    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import { useEmployeeStore } from '@/store/employee.store'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const dialogModel = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})
const employeeStore = useEmployeeStore()

// ─── Tabs & field definitions (mirrors EmployeeForm) ──────────────────────
const MAP_TABS = [
  { value: 'personal',   icon: 'mdi-account',              label: 'Personal'   },
  { value: 'contact',    icon: 'mdi-phone',                label: 'Contact'    },
  { value: 'ids',        icon: 'mdi-card-account-details',  label: 'Gov. IDs'   },
  { value: 'banking',    icon: 'mdi-bank',                 label: 'Banking'    },
  { value: 'emergency',  icon: 'mdi-alert-circle',         label: 'Emergency'  },
  { value: 'education',  icon: 'mdi-school',               label: 'Education'  },
  { value: 'experience', icon: 'mdi-briefcase',            label: 'Experience' },
  { value: 'job',        icon: 'mdi-domain',               label: 'Job Info'   },
]

interface FieldDef {
  key: string
  label: string
  required: boolean
  tab: string
}

const PLATFORM_FIELDS: FieldDef[] = [
  // ── Personal ──
  { key: 'first_name',     label: 'First Name',        required: true,  tab: 'personal' },
  { key: 'last_name',      label: 'Last Name',         required: true,  tab: 'personal' },
  { key: 'gender',         label: 'Gender',            required: false, tab: 'personal' },
  { key: 'date_of_birth',  label: 'Date of Birth',     required: false, tab: 'personal' },
  { key: 'door_no',        label: 'Door No.',          required: false, tab: 'personal' },
  { key: 'street',         label: 'Street',            required: false, tab: 'personal' },
  { key: 'village_town',   label: 'Village / Town',    required: false, tab: 'personal' },
  { key: 'pin_code',       label: 'PIN Code',          required: false, tab: 'personal' },
  { key: 'health_issues',  label: 'Health Issues',     required: false, tab: 'personal' },
  { key: 'allergies',      label: 'Allergies',         required: false, tab: 'personal' },
  // ── Contact ──
  { key: 'email',              label: 'Work Email',         required: true,  tab: 'contact' },
  { key: 'personal_email',     label: 'Personal Email',     required: false, tab: 'contact' },
  { key: 'phone',              label: 'Phone No. 1',        required: false, tab: 'contact' },
  { key: 'phone_2',            label: 'Phone No. 2',        required: false, tab: 'contact' },
  { key: 'initial_password',   label: 'Initial Password',   required: false, tab: 'contact' },
  // ── Gov IDs ──
  { key: 'aadhaar_number',         label: 'Aadhaar Number',         required: false, tab: 'ids' },
  { key: 'pan_number',             label: 'PAN',                    required: false, tab: 'ids' },
  { key: 'uan_number',             label: 'UAN',                    required: false, tab: 'ids' },
  { key: 'esi_number',             label: 'ESI Number',             required: false, tab: 'ids' },
  { key: 'driving_license_number', label: 'Driving License Number', required: false, tab: 'ids' },
  // ── Banking ──
  { key: 'bank_name',           label: 'Bank Name',       required: false, tab: 'banking' },
  { key: 'bank_branch',         label: 'Branch',          required: false, tab: 'banking' },
  { key: 'bank_account_number', label: 'Account Number',  required: false, tab: 'banking' },
  { key: 'ifsc_code',           label: 'IFSC Code',       required: false, tab: 'banking' },
  // ── Emergency ──
  { key: 'emergency_contact_name',     label: 'Contact Person Name',   required: false, tab: 'emergency' },
  { key: 'emergency_contact_number',   label: 'Contact Person Number', required: false, tab: 'emergency' },
  { key: 'emergency_contact_relation', label: 'Relationship',          required: false, tab: 'emergency' },
  // ── Education ──
  { key: 'highest_qualification', label: 'Highest Qualification',  required: false, tab: 'education' },
  { key: 'year_of_passing',      label: 'Year of Passing',        required: false, tab: 'education' },
  { key: 'percentage',           label: 'Percentage / CGPA',      required: false, tab: 'education' },
  { key: 'institute_name',       label: 'Institute Name',         required: false, tab: 'education' },
  // ── Experience ──
  { key: 'last_firm_name',       label: 'Last Company',          required: false, tab: 'experience' },
  { key: 'years_of_experience',  label: 'Years of Experience',   required: false, tab: 'experience' },
  { key: 'last_designation',     label: 'Last Designation',      required: false, tab: 'experience' },
  { key: 'last_drawn_salary',    label: 'Last Drawn Salary',     required: false, tab: 'experience' },
  { key: 'referred_by',          label: 'Referred By',           required: false, tab: 'experience' },
  { key: 'reason_to_quit',       label: 'Reason to Quit',        required: false, tab: 'experience' },
  // ── Job Info ──
  { key: 'designation',         label: 'Designation',              required: false, tab: 'job' },
  { key: 'role',                label: 'Role',                     required: false, tab: 'job' },
  { key: 'project',             label: 'Project',                  required: false, tab: 'job' },
  { key: 'date_joined',         label: 'Date of Joining',          required: false, tab: 'job' },
  { key: 'joining_salary',      label: 'Joining Salary',           required: false, tab: 'job' },
  { key: 'staff_photo_url',     label: 'Staff Photograph URL',     required: false, tab: 'job' },
  { key: 'staff_documents_urls',label: 'Staff Documents URLs',     required: false, tab: 'job' },
]

function getFieldsForTab(tabValue: string): FieldDef[] {
  return PLATFORM_FIELDS.filter(f => f.tab === tabValue)
}

// ─── State ─────────────────────────────────────────────────────────────────
const step = ref(1)
const mapTab = ref('personal')
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const selectedFile = ref<File | null>(null)
const parseError = ref('')
const detectedColumns = ref<string[]>([])
const previewRows = ref<Record<string, any>[]>([])
const allDataRows = ref<Record<string, any>[]>([])
const fieldMapping = ref<Record<string, string>>({})
const mappingError = ref('')

const importStatus = ref<'idle' | 'running' | 'paused' | 'done'>('idle')
const importProgress = ref({ current: 0, total: 0 })
const importErrors = ref<Array<{ row: number; error: string }>>([])
const importPercent = computed(() =>
  importProgress.value.total ? Math.round((importProgress.value.current / importProgress.value.total) * 100) : 0
)

// Resume
interface ImportSession {
  sessionId: string; fileName: string; totalRows: number; processedRows: number
  mappedData: any[]; errors: Array<{ row: number; error: string }>
  startedAt: string; status: 'running' | 'interrupted'
}
const STORAGE_KEY = 'hrms_bulk_import_session'
const resumeSession = ref<ImportSession | null>(null)
let shouldPause = false
let currentSessionId = ''

const columnOptions = computed(() => [
  { title: '— Skip —', value: '__skip__' },
  ...detectedColumns.value.map(c => ({ title: c, value: c })),
])

// ─── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const s: ImportSession = JSON.parse(saved)
      if (s.status === 'interrupted' && s.processedRows < s.totalRows) resumeSession.value = s
    } catch { /* ignore */ }
  }
})

watch(() => props.modelValue, (val) => { if (!val) reset() })

// ─── File handling ──────────────────────────────────────────────────────────
function onDrop(e: DragEvent) {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files?.length) loadFile(files[0])
}
function onFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) loadFile(f)
}
function loadFile(f: File) {
  parseError.value = ''
  selectedFile.value = f
  const reader = new FileReader()
  reader.onload = (ev) => {
    try {
      const data = new Uint8Array(ev.target!.result as ArrayBuffer)
      const wb = XLSX.read(data, { type: 'array', cellDates: true })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: '' })
      if (!rows.length) { parseError.value = 'File is empty or has no data rows.'; return }
      detectedColumns.value = Object.keys(rows[0])
      allDataRows.value = rows
      previewRows.value = rows.slice(0, 5)
      autoMap()
    } catch {
      parseError.value = 'Failed to parse file. Ensure it is a valid .xlsx/.xls/.csv file.'
    }
  }
  reader.readAsArrayBuffer(f)
}

function autoMap() {
  const mapping: Record<string, string> = {}
  const normalise = (s: string) => s.toLowerCase().replace(/[\s_\-\.]/g, '')
  for (const field of PLATFORM_FIELDS) {
    const fNorm = normalise(field.key)
    const fLblNorm = normalise(field.label)
    const match = detectedColumns.value.find(col => {
      const cNorm = normalise(col)
      return cNorm === fNorm || cNorm === fLblNorm || cNorm.includes(fNorm) || fNorm.includes(cNorm)
    })
    mapping[field.key] = match ?? '__skip__'
  }
  fieldMapping.value = mapping
}

// ─── Navigation ──────────────────────────────────────────────────────────────
function goToMapping() {
  parseError.value = ''
  mapTab.value = 'personal'
  step.value = 2
}
function goToImport() {
  const missing = PLATFORM_FIELDS
    .filter(f => f.required && (!fieldMapping.value[f.key] || fieldMapping.value[f.key] === '__skip__'))
    .map(f => f.label)
  if (missing.length) {
    mappingError.value = `Please map mandatory fields: ${missing.join(', ')}`
    return
  }
  mappingError.value = ''
  importProgress.value = { current: 0, total: allDataRows.value.length }
  importErrors.value = []
  importStatus.value = 'idle'
  step.value = 3
}

// ─── Map raw row → backend payload ────────────────────────────────────────
function mapRow(rawRow: Record<string, any>): Record<string, any> {
  const payload: Record<string, any> = {}
  for (const field of PLATFORM_FIELDS) {
    const col = fieldMapping.value[field.key]
    if (!col || col === '__skip__') continue
    let val = rawRow[col]
    if (val === null || val === undefined || val === '') continue
    if (['date_of_birth', 'date_joined'].includes(field.key)) {
      if (val instanceof Date) val = val.toISOString().split('T')[0]
      else if (typeof val === 'string') val = val.trim()
    }
    payload[field.key] = typeof val === 'string' ? val.trim() : val
  }
  return payload
}

// ─── Import execution ────────────────────────────────────────────────────────
async function runImport() {
  shouldPause = false
  importStatus.value = 'running'
  const startFrom = importProgress.value.current
  const BATCH = 10
  currentSessionId = currentSessionId || crypto.randomUUID()

  for (let i = startFrom; i < allDataRows.value.length; i += BATCH) {
    if (shouldPause) { importStatus.value = 'paused'; saveSession(); return }
    const batch = allDataRows.value.slice(i, i + BATCH).map((r, bi) => ({
      rowIndex: i + bi, payload: mapRow(r),
    }))
    try {
      const resp = await employeeStore.bulkImportMapped(batch.map(b => b.payload))
      for (const result of resp.results) {
        if (!result.success)
          importErrors.value.push({ row: i + result.index, error: result.error || 'Unknown error' })
      }
    } catch (err: any) {
      for (const b of batch)
        importErrors.value.push({ row: b.rowIndex, error: err?.message || 'Request failed' })
    }
    importProgress.value.current = Math.min(i + BATCH, allDataRows.value.length)
    saveSession()
  }
  importStatus.value = 'done'
  clearSession()
  await employeeStore.fetchEmployees()
}
function pauseImport() { shouldPause = true }

// ─── Session persistence ─────────────────────────────────────────────────────
function saveSession() {
  const session: ImportSession = {
    sessionId: currentSessionId,
    fileName: selectedFile.value?.name ?? resumeSession.value?.fileName ?? '',
    totalRows: importProgress.value.total,
    processedRows: importProgress.value.current,
    mappedData: allDataRows.value.map(r => mapRow(r)),
    errors: importErrors.value,
    startedAt: new Date().toISOString(),
    status: importStatus.value === 'done' ? 'running' : 'interrupted',
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}
function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
  resumeSession.value = null
}
function startResume() {
  if (!resumeSession.value) return
  const s = resumeSession.value
  currentSessionId = s.sessionId
  allDataRows.value = s.mappedData
  for (const field of PLATFORM_FIELDS) fieldMapping.value[field.key] = field.key
  detectedColumns.value = PLATFORM_FIELDS.map(f => f.key)
  importProgress.value = { current: s.processedRows, total: s.totalRows }
  importErrors.value = s.errors
  importStatus.value = 'idle'
  selectedFile.value = new File([], s.fileName)
  step.value = 3
}
function discardResume() { clearSession() }

// ─── Close / Reset ──────────────────────────────────────────────────────────
function onClose() {
  if (importStatus.value === 'running') shouldPause = true
  dialogModel.value = false
}
function reset() {
  if (importStatus.value === 'running') return
  step.value = 1; mapTab.value = 'personal'
  selectedFile.value = null; parseError.value = ''
  detectedColumns.value = []; previewRows.value = []; allDataRows.value = []
  fieldMapping.value = {}; mappingError.value = ''
  importStatus.value = 'idle'
  importProgress.value = { current: 0, total: 0 }
  importErrors.value = []; shouldPause = false; currentSessionId = ''
}
</script>

<style scoped>
.drop-zone:hover,
.drop-zone--active {
  border-color: rgb(var(--v-theme-primary)) !important;
  background: rgba(var(--v-theme-primary), 0.04);
}
.preview-table {
  width: 100%; border-collapse: collapse; font-size: 11px;
}
.preview-table th {
  background: rgba(var(--v-theme-primary), 0.08);
  padding: 4px 8px; text-align: left; white-space: nowrap;
  border: 1px solid rgba(0,0,0,0.08); font-weight: 600;
}
.preview-table td {
  padding: 3px 8px; border: 1px solid rgba(0,0,0,0.06);
  white-space: nowrap; max-width: 120px; overflow: hidden; text-overflow: ellipsis;
}
.preview-table tr:nth-child(even) { background: rgba(0,0,0,0.02); }
</style>

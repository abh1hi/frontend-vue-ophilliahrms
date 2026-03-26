<template>
  <v-container fluid class="pa-4 pa-md-6">
    <PageHeader title="Geofence Management" subtitle="Configure location boundaries for attendance tracking">
      <template #actions>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate" class="text-none">
          Add Geofence
        </v-btn>
      </template>
    </PageHeader>

    <DataTable
      title="Geofences"
      :headers="headers"
      :items="attendanceStore.geofences"
      :total-items="attendanceStore.geofences.length"
      :loading="attendanceStore.isLoading"
    >
      <template #item.radius_meters="{ item }">
        {{ item.radius_meters }}m
      </template>

      <template #item.coordinates="{ item }">
        <span class="text-caption font-mono">{{ item.latitude?.toFixed(6) }}, {{ item.longitude?.toFixed(6) }}</span>
      </template>

      <template #item.actions="{ item }">
        <v-btn icon size="small" variant="text" color="primary" @click="openEdit(item)">
          <v-icon size="18">mdi-pencil-outline</v-icon>
          <v-tooltip activator="parent" location="top">Edit</v-tooltip>
        </v-btn>
        <v-btn icon size="small" variant="text" color="error" @click="openDeleteDialog(item)">
          <v-icon size="18">mdi-delete-outline</v-icon>
          <v-tooltip activator="parent" location="top">Delete</v-tooltip>
        </v-btn>
      </template>
    </DataTable>

    <!-- ── Create / Edit Dialog ── -->
    <v-dialog v-model="modal.show" max-width="760" scrollable :persistent="attendanceStore.isLoading">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between pa-5 pb-3">
          <span>{{ modal.isEdit ? 'Edit Geofence' : 'Add Geofence' }}</span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="modal.show = false" />
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-5">
          <!-- Name + Radius row -->
          <v-row dense class="mb-3">
            <v-col cols="8">
              <v-text-field
                v-model="form.name"
                label="Geofence Name *"
                prepend-inner-icon="mdi-map-marker-outline"
                density="comfortable"
                :rules="[v => !!v || 'Name is required']"
                placeholder="e.g. Main Office, Warehouse A"
              />
            </v-col>
            <v-col cols="4">
              <v-text-field
                v-model.number="form.radius_meters"
                label="Radius (meters) *"
                prepend-inner-icon="mdi-circle-expand"
                type="number"
                density="comfortable"
                min="10"
                :rules="[v => v > 0 || 'Must be > 0']"
                @update:model-value="updateCircleRadius"
              />
            </v-col>
          </v-row>

          <!-- Coordinates Preview pill -->
          <div class="d-flex align-center gap-2 mb-4">
            <v-chip
              :color="form.latitude && form.longitude ? 'success' : 'default'"
              variant="tonal"
              size="small"
              prepend-icon="mdi-crosshairs-gps"
            >
              {{ form.latitude && form.longitude
                ? `${Number(form.latitude).toFixed(6)}, ${Number(form.longitude).toFixed(6)}`
                : 'No location selected' }}
            </v-chip>
            <v-chip v-if="form.latitude && form.longitude" color="primary" variant="tonal" size="small">
              Radius: {{ form.radius_meters }}m
            </v-chip>
          </div>

          <!-- Location input tabs -->
          <v-tabs v-model="locationTab" color="primary" density="compact" class="mb-0">
            <v-tab value="map" prepend-icon="mdi-map-outline">Pick on Map</v-tab>
            <v-tab value="manual" prepend-icon="mdi-pencil-outline">Manual Entry</v-tab>
            <v-tab value="url" prepend-icon="mdi-link-variant">Paste URL</v-tab>
          </v-tabs>

          <v-divider class="mb-4" />

          <!-- ── TAB: Map Picker ── -->
          <div v-show="locationTab === 'map'">
            <!-- Search bar -->
            <v-text-field
              v-model="searchQuery"
              label="Search address or place"
              prepend-inner-icon="mdi-magnify"
              density="compact"
              class="mb-3"
              clearable
              :loading="searchLoading"
              placeholder="e.g. Bhopal, M.P., India"
              @keydown.enter.prevent="searchLocation"
            >
              <template #append-inner>
                <v-btn size="x-small" variant="tonal" color="primary" class="text-none" @click="searchLocation" :loading="searchLoading">
                  Search
                </v-btn>
              </template>
            </v-text-field>

            <!-- Search results -->
            <v-list v-if="searchResults.length" density="compact" elevation="2" rounded="lg" class="mb-3 overflow-auto" style="max-height:160px;">
              <v-list-item
                v-for="r in searchResults"
                :key="r.place_id"
                :title="r.display_name"
                @click="selectSearchResult(r)"
                class="text-caption"
                style="cursor:pointer;"
              />
            </v-list>

            <!-- Map -->
            <div
              ref="mapContainer"
              style="height:340px; border-radius:12px; overflow:hidden; border:1px solid rgba(0,0,0,0.12);"
            />
            <p class="text-caption text-center mt-2" style="color:#79747E;">
              Click anywhere on the map to place the geofence center
            </p>
          </div>

          <!-- ── TAB: Manual Entry ── -->
          <div v-show="locationTab === 'manual'">
            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  v-model.number="form.latitude"
                  label="Latitude *"
                  prepend-inner-icon="mdi-latitude"
                  type="number"
                  step="0.000001"
                  density="comfortable"
                  placeholder="e.g. 23.123456"
                  hint="-90 to 90"
                  persistent-hint
                  @update:model-value="onManualCoordsChange"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="form.longitude"
                  label="Longitude *"
                  prepend-inner-icon="mdi-longitude"
                  type="number"
                  step="0.000001"
                  density="comfortable"
                  placeholder="e.g. 79.567890"
                  hint="-180 to 180"
                  persistent-hint
                  @update:model-value="onManualCoordsChange"
                />
              </v-col>
            </v-row>
            <v-btn
              class="mt-3 text-none"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-map-search"
              :disabled="!form.latitude || !form.longitude"
              @click="goToMapTab"
            >
              Preview on Map
            </v-btn>
          </div>

          <!-- ── TAB: Paste URL ── -->
          <div v-show="locationTab === 'url'">
            <v-textarea
              v-model="pastedUrl"
              label="Paste Google Maps or coordinate URL"
              prepend-inner-icon="mdi-link-variant"
              density="comfortable"
              rows="3"
              placeholder="https://maps.google.com/maps?q=23.1234,79.5678&#10;or&#10;https://www.google.com/maps/place/.../@23.1234,79.5678,15z/..."
              hint="Supports Google Maps links, share links, and plain coordinates (lat, lng)"
              persistent-hint
            />

            <v-alert v-if="urlParseError" type="error" variant="tonal" density="compact" rounded="lg" class="mt-2 mb-2">
              {{ urlParseError }}
            </v-alert>
            <v-alert v-if="urlParseSuccess" type="success" variant="tonal" density="compact" rounded="lg" class="mt-2 mb-2">
              {{ urlParseSuccess }}
            </v-alert>

            <v-btn
              class="mt-3 text-none"
              color="primary"
              variant="tonal"
              prepend-icon="mdi-crosshairs-gps"
              :disabled="!pastedUrl.trim()"
              @click="parseUrl"
            >
              Extract Coordinates
            </v-btn>

            <v-divider class="my-4" />
            <p class="text-caption text-medium-emphasis mb-2">Supported formats:</p>
            <v-chip-group>
              <v-chip size="x-small" label>maps.google.com/?q=lat,lng</v-chip>
              <v-chip size="x-small" label>/@lat,lng,zoom</v-chip>
              <v-chip size="x-small" label>place/.../@lat,lng</v-chip>
              <v-chip size="x-small" label>?ll=lat,lng</v-chip>
              <v-chip size="x-small" label>plain: lat, lng</v-chip>
            </v-chip-group>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-btn variant="text" class="text-none" @click="modal.show = false">Cancel</v-btn>
          <v-spacer />
          <v-btn
            color="primary"
            variant="elevated"
            class="text-none"
            :loading="attendanceStore.isLoading"
            :disabled="!isFormValid"
            @click="handleSubmit"
          >
            {{ modal.isEdit ? 'Save Changes' : 'Create Geofence' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ConfirmDialog
      v-model="deleteDialog.show"
      title="Delete Geofence"
      :message="`Delete geofence '${deleteDialog.item?.name}'? This cannot be undone.`"
      confirm-text="Delete"
      confirm-color="error"
      icon="mdi-map-marker-remove"
      @confirm="handleDelete"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onUnmounted, nextTick } from 'vue'
import DataTable from '@/components/common/DataTable.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useAttendanceStore } from '@/store/attendance.store'
import type { Geofence } from '@/types/attendance.types'

const attendanceStore = useAttendanceStore()

const headers = [
  { title: 'Name', key: 'name', align: 'start' as const },
  { title: 'Coordinates', key: 'coordinates' },
  { title: 'Radius', key: 'radius_meters' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' as const },
]

// ── Form state ────────────────────────────────────────────────────────────────

const modal = reactive({ show: false, isEdit: false, editId: '' })
const deleteDialog = reactive({ show: false, item: null as Geofence | null })
const locationTab = ref<'map' | 'manual' | 'url'>('map')

const form = reactive({
  name: '',
  latitude: null as number | null,
  longitude: null as number | null,
  radius_meters: 100,
})

const isFormValid = computed(() =>
  !!form.name.trim() &&
  form.latitude !== null && !isNaN(Number(form.latitude)) &&
  form.longitude !== null && !isNaN(Number(form.longitude)) &&
  form.radius_meters > 0
)

// ── Map ───────────────────────────────────────────────────────────────────────

const mapContainer = ref<HTMLDivElement | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let mapInstance: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let markerInstance: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let circleInstance: any = null

async function initMap() {
  await nextTick()
  if (!mapContainer.value) return

  const L = (await import('leaflet')).default

  // Fix Leaflet default icon paths broken by Vite bundling
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })

  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
    markerInstance = null
    circleInstance = null
  }

  const defaultLat = form.latitude ?? 23.2599
  const defaultLng = form.longitude ?? 77.4126
  const defaultZoom = form.latitude ? 15 : 5

  mapInstance = L.map(mapContainer.value).setView([defaultLat, defaultLng], defaultZoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(mapInstance)

  // If coords already set, place marker + circle
  if (form.latitude && form.longitude) {
    placeMarker(L, form.latitude, form.longitude)
  }

  // Click handler
  mapInstance.on('click', (e: any) => {
    form.latitude = parseFloat(e.latlng.lat.toFixed(7))
    form.longitude = parseFloat(e.latlng.lng.toFixed(7))
    placeMarker(L, form.latitude, form.longitude)
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function placeMarker(L: any, lat: number, lng: number) {
  if (!mapInstance) return

  if (markerInstance) {
    markerInstance.setLatLng([lat, lng])
  } else {
    markerInstance = L.marker([lat, lng], { draggable: true }).addTo(mapInstance)
    markerInstance.on('dragend', () => {
      const pos = (markerInstance as NonNullable<typeof markerInstance>).getLatLng()
      form.latitude = parseFloat(pos.lat.toFixed(7))
      form.longitude = parseFloat(pos.lng.toFixed(7))
      updateCirclePosition(pos.lat, pos.lng)
    })
  }

  if (circleInstance) {
    circleInstance.setLatLng([lat, lng])
    circleInstance.setRadius(form.radius_meters)
  } else {
    const L2 = (await import('leaflet')).default
    circleInstance = L2.circle([lat, lng], {
      radius: form.radius_meters,
      color: '#FF9933',
      fillColor: '#FF9933',
      fillOpacity: 0.15,
      weight: 2,
    }).addTo(mapInstance)
  }

  mapInstance.setView([lat, lng], Math.max(mapInstance.getZoom(), 15))
}

function updateCircleRadius() {
  if (circleInstance && form.radius_meters > 0) {
    circleInstance.setRadius(form.radius_meters)
  }
}

function updateCirclePosition(lat: number, lng: number) {
  if (circleInstance) {
    circleInstance.setLatLng([lat, lng])
  }
}

// ── Address Search (Nominatim) ────────────────────────────────────────────────

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const searchLoading = ref(false)

async function searchLocation() {
  if (!searchQuery.value.trim()) return
  searchLoading.value = true
  searchResults.value = []
  try {
    const encoded = encodeURIComponent(searchQuery.value)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=5`,
      { headers: { 'Accept-Language': 'en' } }
    )
    searchResults.value = await res.json()
  } catch {
    // silent fail — user can enter manually
  } finally {
    searchLoading.value = false
  }
}

async function selectSearchResult(result: any) {
  form.latitude = parseFloat(parseFloat(result.lat).toFixed(7))
  form.longitude = parseFloat(parseFloat(result.lon).toFixed(7))
  searchResults.value = []
  searchQuery.value = result.display_name
  const L = (await import('leaflet')).default
  await placeMarker(L, form.latitude, form.longitude)
}

// ── Manual coords → sync to map ───────────────────────────────────────────────

async function onManualCoordsChange() {
  if (form.latitude && form.longitude && mapInstance) {
    const L = (await import('leaflet')).default
    await placeMarker(L, form.latitude, form.longitude)
  }
}

function goToMapTab() {
  locationTab.value = 'map'
}

// ── URL Parser ────────────────────────────────────────────────────────────────

const pastedUrl = ref('')
const urlParseError = ref('')
const urlParseSuccess = ref('')

function parseUrl() {
  urlParseError.value = ''
  urlParseSuccess.value = ''
  const raw = pastedUrl.value.trim()
  if (!raw) return

  let lat: number | null = null
  let lng: number | null = null

  // Pattern 1: /@lat,lng (Google Maps share URLs)
  const atPattern = raw.match(/@(-?\d+\.?\d+),(-?\d+\.?\d+)/)
  if (atPattern) {
    lat = parseFloat(atPattern[1])
    lng = parseFloat(atPattern[2])
  }

  // Pattern 2: ?q=lat,lng or &q=lat,lng
  if (!lat) {
    const qPattern = raw.match(/[?&]q=(-?\d+\.?\d+),(-?\d+\.?\d+)/)
    if (qPattern) {
      lat = parseFloat(qPattern[1])
      lng = parseFloat(qPattern[2])
    }
  }

  // Pattern 3: ?ll=lat,lng or &ll=lat,lng
  if (!lat) {
    const llPattern = raw.match(/[?&]ll=(-?\d+\.?\d+),(-?\d+\.?\d+)/)
    if (llPattern) {
      lat = parseFloat(llPattern[1])
      lng = parseFloat(llPattern[2])
    }
  }

  // Pattern 4: plain "lat, lng" or "lat,lng"
  if (!lat) {
    const plainPattern = raw.match(/^(-?\d+\.?\d+)\s*,\s*(-?\d+\.?\d+)$/)
    if (plainPattern) {
      lat = parseFloat(plainPattern[1])
      lng = parseFloat(plainPattern[2])
    }
  }

  // Validate
  if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
    urlParseError.value = 'Could not extract coordinates. Try copying the full URL from Google Maps (Share → Copy link).'
    return
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    urlParseError.value = `Invalid coordinates: lat=${lat}, lng=${lng}. Latitude must be -90–90, longitude -180–180.`
    return
  }

  form.latitude = parseFloat(lat.toFixed(7))
  form.longitude = parseFloat(lng.toFixed(7))
  urlParseSuccess.value = `Extracted: ${form.latitude}, ${form.longitude}`

  // Switch to map and show marker
  locationTab.value = 'map'
  nextTick(async () => {
    if (mapInstance) {
      const L = (await import('leaflet')).default
      await placeMarker(L, form.latitude!, form.longitude!)
    }
  })
}

// ── Watch tab switch to init map ───────────────────────────────────────────────

watch(locationTab, (tab) => {
  if (tab === 'map' && modal.show) {
    nextTick(() => initMap())
  }
})

watch(() => modal.show, (open) => {
  if (open && locationTab.value === 'map') {
    nextTick(() => initMap())
  }
  if (!open) {
    searchResults.value = []
    urlParseError.value = ''
    urlParseSuccess.value = ''
    pastedUrl.value = ''
    searchQuery.value = ''
  }
})

// ── CRUD handlers ─────────────────────────────────────────────────────────────

function resetForm() {
  form.name = ''
  form.latitude = null
  form.longitude = null
  form.radius_meters = 100
  locationTab.value = 'map'
  searchResults.value = []
  pastedUrl.value = ''
  urlParseError.value = ''
  urlParseSuccess.value = ''
  searchQuery.value = ''
}

function openCreate() {
  resetForm()
  modal.isEdit = false
  modal.editId = ''
  modal.show = true
}

function openEdit(gf: Geofence) {
  resetForm()
  modal.isEdit = true
  modal.editId = gf.id
  form.name = gf.name
  form.latitude = gf.latitude
  form.longitude = gf.longitude
  form.radius_meters = gf.radius_meters
  modal.show = true
}

async function handleSubmit() {
  if (!isFormValid.value) return
  const payload = {
    name: form.name.trim(),
    latitude: Number(form.latitude),
    longitude: Number(form.longitude),
    radius_meters: Number(form.radius_meters),
  }
  if (modal.isEdit) {
    await attendanceStore.updateGeofence(modal.editId, payload)
  } else {
    await attendanceStore.createGeofence(payload)
  }
  modal.show = false
}

function openDeleteDialog(gf: Geofence) {
  deleteDialog.item = gf
  deleteDialog.show = true
}

async function handleDelete() {
  if (!deleteDialog.item) return
  await attendanceStore.deleteGeofence(deleteDialog.item.id)
  deleteDialog.show = false
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove()
    mapInstance = null
  }
})

// ── Load geofences on mount ───────────────────────────────────────────────────

attendanceStore.fetchGeofences()
</script>

<style scoped>
@import 'leaflet/dist/leaflet.css';

.font-mono {
  font-family: 'Roboto Mono', monospace;
}
</style>

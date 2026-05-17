<template>
  <div v-if="existingWorldSettings.length > 0" class="mb-4">
    <h2 class="mb-1">Copy Settings</h2>
    <div>Select a world to copy settings from:</div>
    <div class="d-flex gap-3">
      <v-btn
        v-for="(settings, index) in existingWorldSettings"
        :key="index"
        :disabled="loading"
        variant="tonal"
        @click="selectSettings(settings)"
      >
        <v-icon start>mdi-earth</v-icon>
        {{ index + 1 }}
      </v-btn>
    </div>
  </div>

  <h2 class="mb-2">Start with Presets</h2>
  <wotw-seedgen-preset-button
    v-for="presetId in groupedWorldPresetIds['Base']"
    :key="presetId"
    :selected="presetId === selectedBasePreset?.id"
    large
    class="mb-2"
    :preset-id="presetId"
    :preset-info="(worldPresets[presetId] as WorldPreset).info"
    @click="onBaseWorldPresetSelected(presetId)"
  />

  <v-expand-transition>
    <div v-if="selectedBasePreset !== null" class="d-flex gap-6">
      <wotw-seedgen-preset-button
        v-for="presetId in Object.keys(presetsWithoutGroup)"
        :key="presetId"
        :disabled="selectedBasePreset.preset.includes?.includes(presetId)"
        :selected="selectedAdditionalPresets.has(presetId) || selectedBasePreset.preset.includes?.includes(presetId)"
        :preset-id="presetId"
        :preset-info="(worldPresets[presetId] as WorldPreset).info"
        :description-append="selectedBasePreset.preset.includes?.includes(presetId) ? `Included in the '${selectedBasePreset.preset.info?.name ?? selectedBasePreset.id}' preset` : null"
        @click="onAdditionalPresetSelected(presetId)"
      />

      <v-btn variant="flat" color="accent" :loading="loading" @click="finishPresetSelection">
        <v-icon start>mdi-check</v-icon>
        Done
      </v-btn>
    </div>
  </v-expand-transition>

  <div class="d-flex justify-end">
    <v-btn size="small" color="primary" variant="text" :loading="loading || randomSettingsLoading" @click="selectRandomWorldSettings">
      Randomize Settings
    </v-btn>
    <v-divider vertical class="mx-2" />
    <v-btn size="small" color="primary" variant="text" :loading="loading" :disabled="randomSettingsLoading" @click="startFromScratch">
      Start from Scratch
    </v-btn>
  </div>
</template>

<script lang="ts" setup>
  import type {HashMapStringWorldPreset, WorldPreset, WorldSettings} from "@shared/types/seedgen"
  import type {GroupedPresetIds} from '~/assets/types/components/seedgen'
  import {clone} from "@shared/utils/clone"
  import {useSeedgenAxios} from "~/composables/useSeedgenAxios"

  const {
    groupedWorldPresetIds,
    worldPresets,
    existingWorldSettings,
    loading = false,
  } = defineProps<{
    groupedWorldPresetIds: GroupedPresetIds,
    worldPresets: HashMapStringWorldPreset,
    existingWorldSettings: WorldSettings[],
    loading?: boolean,
  }>()

  const emit = defineEmits<{
    presetsSelected: [WorldPreset[]],
    settingsSelected: [WorldSettings],
  }>()

  const seedgenAxios = useSeedgenAxios()
  const randomSettingsLoading = ref(false)

  type WorldPresetAndId = {
    id: string,
    preset: WorldPreset,
  }

  const selectedBasePreset = ref<WorldPresetAndId | null>(null)
  const selectedAdditionalPresets = ref<Set<string>>(new Set([]))

  const presetsWithoutGroup = computed(() => Object.fromEntries(
    Object.entries(worldPresets).filter(p => !p[1].info || !p[1].info.group)
  ))

  function onBaseWorldPresetSelected(presetId: string) {
    if (loading) {
      return
    }

    const selectedPreset = worldPresets?.[presetId]

    if (!selectedPreset) {
      return
    }

    selectedAdditionalPresets.value.clear()
    selectedBasePreset.value = {
      id: presetId,
      preset: selectedPreset,
    }
  }

  function onAdditionalPresetSelected(presetId: string) {
    if (loading) {
      return
    }

    if (selectedAdditionalPresets.value.has(presetId)) {
      selectedAdditionalPresets.value.delete(presetId)
    } else {
      selectedAdditionalPresets.value.add(presetId)
    }
  }

  function finishPresetSelection() {
    if (selectedBasePreset.value === null) {
      return
    }

    emit("presetsSelected", [
      selectedBasePreset.value.preset,
      ...selectedAdditionalPresets.value.values().map(presetId => worldPresets[presetId]).filter(preset => !!preset)
    ])
  }

  function startFromScratch() {
    emit("presetsSelected", [])
  }

  function selectSettings(settings: WorldSettings) {
    emit("settingsSelected", clone(settings))
  }

  async function selectRandomWorldSettings() {
    randomSettingsLoading.value = true
    const {data: randomSettings}: {data: WorldSettings} = await seedgenAxios.get("/settings/world/random")
    emit("settingsSelected", randomSettings)
    randomSettingsLoading.value = false
  }
</script>

<style lang="scss" scoped>

</style>

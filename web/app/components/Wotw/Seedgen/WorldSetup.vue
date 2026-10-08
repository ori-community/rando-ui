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

  <h2 class="mb-2">Presets</h2>
  <template v-for="presetId in groupedWorldPresetIds['Base']" :key="presetId">
    <div class="pb-2">
      <wotw-seedgen-preset-button
        :selected="presetId === selectedBasePreset?.id"
        large
        icon="mdi-format-list-bulleted-type"
        :preset-id="presetId"
        :preset-info="(worldPresets[presetId] as WorldPresetInfo).content.info"
        :is-custom="(worldPresets[presetId] as WorldPresetInfo).origin.kind === 'UserDataDir'"
        @click="onBaseWorldPresetSelected(presetId)"
        @contextmenu="(event: MouseEvent) => onPresetButtonContextMenu(presetId, event)"
      />
    </div>

    <v-expand-transition>
      <div v-if="selectedBasePreset !== null && selectedBasePreset.id === presetId">
        <div class="pb-4 d-flex align-start ga-3">
          <v-icon size="28">mdi-arrow-right-bottom</v-icon>

          <div class="d-flex flex-wrap gap-6">
            <wotw-seedgen-preset-button
              v-for="ungroupedPresetId in Object.keys(presetsWithoutGroup)"
              :key="ungroupedPresetId"
              :selected="selectedAdditionalPresets.has(ungroupedPresetId) || selectedBasePreset.preset.includes?.includes(ungroupedPresetId)"
              :preset-id="ungroupedPresetId"
              :preset-info="(worldPresets[ungroupedPresetId] as WorldPresetInfo).content.info"
              icon="mdi-plus"
              :is-included-in="selectedBasePreset.preset.includes?.includes(ungroupedPresetId) ? (selectedBasePreset.preset.info?.name ?? selectedBasePreset.id) : null"
              :is-custom="(worldPresets[ungroupedPresetId] as WorldPresetInfo).origin.kind === 'UserDataDir'"
              @click="onAdditionalPresetSelected(ungroupedPresetId)"
              @contextmenu="(event: MouseEvent) => onPresetButtonContextMenu(ungroupedPresetId, event)"
            />

            <v-btn variant="flat" color="accent" :loading="loading" @click="finishPresetSelection">
              <v-icon start>mdi-check</v-icon>
              Done
            </v-btn>
          </div>
        </div>
      </div>
    </v-expand-transition>
  </template>

  <h2 class="mb-2 mt-4">Other Options</h2>
  <div class="mb-2">
    <wotw-seedgen-preset-button
      large
      preset-id="random"
      @click="selectRandomWorldSettings"
    >
      <div class="d-flex ga-3 align-center">
        <v-icon>mdi-dice-multiple-outline</v-icon>
        <div>
          <h3>Random Settings</h3>
          <p>Let the randomizer randomize all your settings</p>
        </div>
      </div>
    </wotw-seedgen-preset-button>
  </div>
  <wotw-seedgen-preset-button
    large
    preset-id="random"
    @click="startFromScratch"
  >
    <div class="d-flex ga-3 align-center">
      <v-icon>mdi-creation-outline</v-icon>
      <div>
        <h3>Start from Scratch</h3>
        <p>Configure everything yourself</p>
      </div>
    </div>
  </wotw-seedgen-preset-button>

  <v-menu v-model="presetContextMenuOpen" :target="[presetContextMenuX, presetContextMenuY]" >
    <v-list>
      <v-list-item @click="deleteUserPreset(presetContextMenuPresetId)">
        <v-icon start>mdi-delete-outline</v-icon>
        Delete
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts" setup>
  import type {WorldPresetInfo, WorldPreset, WorldSettings} from "@shared/types/seedgen"
  import type {GroupedPresetIds} from '~/assets/types/components/seedgen'
  import {clone} from "@shared/utils/clone"
  import {useSeedgenAxios} from "~/composables/useSeedgenAxios"
  import type {ValidWorldPresets} from "@shared/types/seedgen-extra"

  const {
    groupedWorldPresetIds,
    worldPresets,
    existingWorldSettings,
    loading = false,
  } = defineProps<{
    groupedWorldPresetIds: GroupedPresetIds,
    worldPresets: ValidWorldPresets,
    existingWorldSettings: WorldSettings[],
    loading?: boolean,
  }>()

  const emit = defineEmits<{
    presetsSelected: [WorldPreset[]],
    settingsSelected: [WorldSettings],
    tempScheduleAssetRefresh: [],
  }>()

  const seedgenAxios = useSeedgenAxios()
  const electronApi = useElectronApi()
  const randomSettingsLoading = ref(false)
  const presetContextMenuOpen = ref(false)
  const presetContextMenuX = ref(0)
  const presetContextMenuY = ref(0)
  const presetContextMenuPresetId = ref("")

  type WorldPresetAndId = {
    id: string,
    preset: WorldPreset,
  }

  const selectedBasePreset = ref<WorldPresetAndId | null>(null)
  const selectedAdditionalPresets = ref<Set<string>>(new Set([]))

  const presetsWithoutGroup = computed(() => Object.fromEntries(
    Object.entries(worldPresets).filter(p => !p[1].content.info || !p[1].content.info.group)
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
      preset: selectedPreset.content,
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
      ...selectedAdditionalPresets.value.values().map(presetId => worldPresets[presetId]?.content).filter(preset => !!preset)
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

  function onPresetButtonContextMenu(presetId: string, event: MouseEvent) {
    const preset = worldPresets[presetId]

    if (!preset || preset.origin.kind !== "UserDataDir") {
      presetContextMenuOpen.value = false
      return
    }

    presetContextMenuX.value = event.clientX
    presetContextMenuY.value = event.clientY
    presetContextMenuPresetId.value = presetId
    presetContextMenuOpen.value = true
  }

  async function deleteUserPreset(presetId: string) {
    if (electronApi === null) {
      return
    }

    await electronApi.fs.deleteWorldPreset.query({id: presetId})
    emit("tempScheduleAssetRefresh")
  }
</script>

<style lang="scss" scoped>

</style>

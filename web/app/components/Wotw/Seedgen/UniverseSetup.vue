<template>
  <h2 class="mb-2">Presets</h2>
  <template v-for="[presetId, preset] in Object.entries(universePresets)" :key="presetId">
    <div class="pb-2">
      <wotw-seedgen-preset-button
        large
        icon="mdi-format-list-bulleted-type"
        :preset-id="presetId"
        :preset-info="preset.content.info"
        :is-custom="preset.origin.kind === 'UserDataDir'"
        @click="onPresetSelected(preset.content)"
        @contextmenu="(event: MouseEvent) => onPresetButtonContextMenu(presetId, event)"
      />
    </div>
  </template>
  <div v-if="Object.keys(universePresets).length === 0" class="opacity-70">
    There are no Universe Presets available.<br>
    Set up your worlds and save the settings at the bottom of the seed generator interface.
  </div>

  <template v-if="lastSettings !== null">
    <h2 class="mb-2 mt-4">Other Options</h2>
    <wotw-seedgen-preset-button
      large
      preset-id="lastSettings"
      :disabled="loading"
      @click="restoreLastSettings"
    >
      <div class="d-flex ga-3 align-center">
        <v-icon>mdi-backup-restore</v-icon>
        <div>
          <h3>Last Settings</h3>
          <p>Restore the last settings used to generate a seed</p>
        </div>
      </div>
    </wotw-seedgen-preset-button>
  </template>

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
  import type {
    UniverseSettings,
    UniversePreset,
  } from "@shared/types/seedgen"
  import type {ValidUniversePresets} from "@shared/types/seedgen-extra"

  const {
    universePresets,
    loading = false,
  } = defineProps<{
    universePresets: ValidUniversePresets,
    loading?: boolean,
  }>()

  const emit = defineEmits<{
    presetsSelected: [UniversePreset[]],
    settingsSelected: [UniverseSettings],
    tempScheduleAssetRefresh: [],
  }>()

  const electronApi = useElectronApi()
  const lastSettings = ref<UniverseSettings | null>(null)
  const presetContextMenuOpen = ref(false)
  const presetContextMenuX = ref(0)
  const presetContextMenuY = ref(0)
  const presetContextMenuPresetId = ref("")

  onMounted(async () => {
    lastSettings.value = await electronApi?.fs.getLastSeedgenSettings.query() ?? null
  })

  function restoreLastSettings() {
    if (lastSettings.value !== null) {
      emit("settingsSelected", lastSettings.value)
    }
  }

  function onPresetSelected(preset: UniversePreset) {
    emit("presetsSelected", [preset])
  }

  function onPresetButtonContextMenu(presetId: string, event: MouseEvent) {
    const preset = universePresets[presetId]

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

    await electronApi.fs.deleteUniversePreset.query({id: presetId})
    emit("tempScheduleAssetRefresh")
  }
</script>

<style lang="scss" scoped>

</style>

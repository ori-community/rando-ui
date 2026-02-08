<template>
  <h2 class="mb-2">Select a base preset</h2>
  <template v-if="selectedBasePreset === null">
    <wotw-seedgen-preset-button
      v-for="presetId in groupedWorldPresetIds['Base']"
      :key="presetId"
      large
      class="mb-2"
      :preset-id="presetId"
      :preset-info="(worldPresets[presetId] as WorldPreset).info"
      @click="onBaseWorldPresetSelected(presetId)"
    />
  </template>
  <div v-else class="d-flex gap-3">
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

    <v-btn @click="finishWorldSetup">Ok</v-btn>
  </div>
</template>

<script lang="ts" setup>
  import type {HashMapStringWorldPreset, WorldPreset} from '@shared/types/seedgen'
  import type {GroupedPresetIds} from '~/assets/types/components/seedgen'

  const {
    groupedWorldPresetIds,
    worldPresets,
  } = defineProps<{
    groupedWorldPresetIds: GroupedPresetIds,
    worldPresets: HashMapStringWorldPreset,
  }>()

  const emit = defineEmits<{
    setupComplete: [WorldPreset[]],
  }>()

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
    if (selectedAdditionalPresets.value.has(presetId)) {
      selectedAdditionalPresets.value.delete(presetId)
    } else {
      selectedAdditionalPresets.value.add(presetId)
    }
  }

  function finishWorldSetup() {
    if (selectedBasePreset.value === null) {
      return
    }

    emit("setupComplete", [
      selectedBasePreset.value.preset,
      ...selectedAdditionalPresets.value.values().map(presetId => worldPresets[presetId]).filter(preset => !!preset)
    ])
  }
</script>

<style lang="scss" scoped>

</style>

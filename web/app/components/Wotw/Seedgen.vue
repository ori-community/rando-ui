<template>
  <v-tabs v-model="selectedWorldIndex" color="primary">
    <v-expand-x-transition group>
      <template v-if="universeSettings.worldSettings.length >= 2 || selectedWorldIndex === null">
        <div v-for="nth in universeSettings.worldSettings.length" :key="nth - 1">
          <v-tab :value="nth - 1"><v-icon start>mdi-earth</v-icon> {{ nth }}</v-tab>
        </div>
      </template>
    </v-expand-x-transition>

    <v-tab :disabled="universeSettings.worldSettings.length === 0" :value="null">
      <v-icon start>mdi-plus</v-icon>
      <template v-if="universeSettings.worldSettings.length <= 1">Multiworld</template>
      <template v-else>Add World</template>
    </v-tab>
  </v-tabs>
  <v-card>
    <v-skeleton-loader
      v-if="universePresets === null || worldPresets === null || difficulties === null || snippetsInfo === null"
      class="ma-3"
      type="article"
    />
    <template v-else>
      <v-window :model-value="selectedWorldIndex ?? universeSettings.worldSettings.length" :show-arrows="false">
        <v-window-item v-for="nth in universeSettings.worldSettings.length" :key="nth - 1" class="pa-3">
          <wotw-seedgen-world-settings
            v-model="universeSettings.worldSettings[nth - 1]!"
            :snippets-info="snippetsInfo"
            :difficulties="difficulties"
            :tricks="tricks"
          />
        </v-window-item>
        <v-window-item :key="universeSettings.worldSettings.length" class="pa-3">
          <wotw-seedgen-world-setup
            :grouped-world-preset-ids="groupedWorldPresetIds"
            :world-presets="worldPresets"
            @setup-complete="onWorldSetupComplete"
          />
        </v-window-item>
      </v-window>
    </template>
  </v-card>
</template>

<script lang="ts" setup>
  import type {
    Difficulty,
    DifficultyInfo,
    HashMapStringUniversePreset,
    HashMapStringWorldPreset, HashMapStringMetadata,
    UniverseSettings, WorldPreset, WorldSettings, TrickInfo,
  } from '@shared/types/seedgen'
  import type {GroupedPresetIds, Presets} from '~/assets/types/components/seedgen'
  import {useSeedgenAxios} from '~/composables/useSeedgenAxios'

  const electronApi = useElectronApi()
  const seedgenAxios = useSeedgenAxios()
  const universeSettings = ref<UniverseSettings>({
    seed: String(Date.now()),
    worldSettings: [],
  })
  const universePresets = ref<HashMapStringUniversePreset | null>(null)
  const worldPresets = ref<HashMapStringWorldPreset | null>(null)
  const difficulties = ref<DifficultyInfo[]>([])
  const tricks = ref<TrickInfo[]>([])
  const selectedWorldIndex = ref<number | null>(null)
  const snippetsInfo = ref<HashMapStringMetadata | null>(null)

  onMounted(async () => {
    if (electronApi) {
      await electronApi.seedgenServer.ensureRunning.query()
    }

    await Promise.all([updateUniversePresets(), updateWorldPresets(), updateDifficulties(), updateTricks(), updateSnippetsInfo()])
  })

  const difficultyValuesByName = computed(() => difficulties.value.reduce((map, difficultyInfo: DifficultyInfo, index) => {
    map[difficultyInfo.name] = index
    return map
  }, {} as {[K in Difficulty]: number}))

  function groupPresets(presets: Presets): GroupedPresetIds {
    const groupedPresetIds: GroupedPresetIds = {}

    for (const [presetId, preset] of Object.entries(presets)) {
      const group = preset.info?.group ?? null

      if (group !== null) {
        const existingGroups = groupedPresetIds[group]

        if (existingGroups === undefined) {
          groupedPresetIds[group] = [presetId]
        } else {
          existingGroups.push(presetId)
        }
      }
    }

    return groupedPresetIds
  }

  const groupedUniversePresetIds = computed(
    () => universePresets.value !== null
      ? groupPresets(universePresets.value)
      : {}
  )

  const groupedWorldPresetIds = computed(
    () => {
      const presets = worldPresets.value
      if (presets === null) {
        return {}
      }

      const groupedPresets = groupPresets(presets)

      // Sort grouped presets by difficulty and amount of tricks
      for (const presetsInGroup of Object.values(groupedPresets)) {
        presetsInGroup.sort((a, b) => {
          const presetA = presets[a]!
          const presetB = presets[b]!
          const difficultyA = presetA.difficulty ?? null
          const difficultyB = presetB.difficulty ?? null

          if (difficultyA !== null && difficultyB === null) {
            return -1
          }

          if (difficultyA === null && difficultyB !== null) {
            return 1
          }

          if (difficultyA !== null && difficultyB !== null && difficultyA !== difficultyB) {
            return difficultyValuesByName.value[difficultyA] - difficultyValuesByName.value[difficultyB]
          }

          const tricksA = presetA.tricks ?? []
          const tricksB = presetB.tricks ?? []

          if (tricksA.length !== tricksB.length) {
            return tricksA.length - tricksB.length
          }

          return a.localeCompare(b)
        })
      }

      return groupedPresets
    }
  )

  async function updateUniversePresets() {
    universePresets.value = (await seedgenAxios.get("/presets/universe/list")).data
  }

  async function updateWorldPresets() {
    worldPresets.value = (await seedgenAxios.get("/presets/world/list")).data
  }

  async function updateDifficulties() {
    difficulties.value = (await seedgenAxios.get("/settings/difficulties")).data
  }

  async function updateTricks() {
    tricks.value = (await seedgenAxios.get("/settings/tricks")).data
  }

  async function updateSnippetsInfo() {
    snippetsInfo.value = (await seedgenAxios.get("/snippets/info")).data
  }

  async function onWorldSetupComplete(presets: WorldPreset[]) {
    const {data}: {data: WorldSettings} = await seedgenAxios.post("/presets/world/apply", {presets})
    universeSettings.value.worldSettings.push(data)
    selectedWorldIndex.value = universeSettings.value.worldSettings.length - 1
  }
</script>

<style lang="scss">

</style>

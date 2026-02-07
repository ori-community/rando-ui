<template>
  <v-tabs v-model="selectedWorldIndex" color="primary">
    <v-expand-x-transition group>
      <template v-if="universeSettings.worldSettings.length >= 2 || selectedWorldIndex === null">
        <div v-for="nth in universeSettings.worldSettings.length" :key="nth - 1">
          <v-tab :value="nth - 1">
            <v-icon start>mdi-earth</v-icon>
            {{ nth }}
          </v-tab>
        </div>
      </template>
    </v-expand-x-transition>

    <v-tab :disabled="universeSettings.worldSettings.length === 0" :value="null">
      <v-icon start>mdi-plus</v-icon>
      <template v-if="universeSettings.worldSettings.length <= 1">Multiworld</template>
      <template v-else>Add World</template>
    </v-tab>
  </v-tabs>
  <v-card :loading="runningSeedgenActionId !== null">
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

  <v-dialog :model-value="runningSeedgenActionId !== null" persistent max-width="600">
    <v-card class="pa-16 text-center loading-text">
      {{ generatingMessages[generatingMessageIndex] }}
      <v-progress-linear :model-value="fakeProgressValue" :max="1" class="mt-5" :class="{'no-transition': fakeProgressActive}" />
    </v-card>
  </v-dialog>

  <div class="mt-6 d-flex justify-center gap-6">
    <div
      v-for="action in seedgenActions"
      :key="action.id"
    >
      <v-btn
        :ref="
          (component) => {
            if (component && action.id === runningSeedgenActionId) {
              runningSeedgenActionButtonElement = (component as ComponentPublicInstance).$el
            }
          }
        "
        :loading="runningSeedgenActionId === action.id"
        :disabled="action.disabled || runningSeedgenActionId !== null"
        size="x-large"
        color="accent"
        @click="action.handler"
      >
        <v-icon start>{{ action.icon }}</v-icon>
        {{ action.label }}
      </v-btn>
      <v-tooltip v-if="!!action.hint" activator="parent" location="bottom" open-delay="400">
        <span class="text-pre">{{ action.hint }}</span>
      </v-tooltip>
    </div>
  </div>
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
  import {confettiFromElement} from '~/assets/utils/confetti'
  import type {ComponentPublicInstance} from "vue"
  import {shuffleArray} from "~/assets/utils/shuffleArray"

  const isElectron = useIsElectron()
  const electronApi = useElectronApi()
  const seedgenAxios = useSeedgenAxios()
  const {axios} = useAxios()
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
  const userStore = useUserStore()
  const generatingMessageIndex = ref(0)
  const generatingMessages = shuffleArray([
    "Stealing back Burrow from Grom...",
    "Looking for the next Health Fragment...",
    "Hiding Launch...",
    "Waking up Shriek...",
    "Infecting Mora...",
    "Planting seeds in the seed...",
    "Asking Motay for assistance...",
    "Handing out maps to Lupo...",
    "Reviving the Moki Father...",
    "Placing 1 Spirit Light...",
    "Cleaning Water in Luma Pools...",
    "Dumping Poison into the waters...",
    "Petrifying trees in Silent Woods...",
    "Turning off the lights in Mouldwood Depths...",
    "Looking for Gorlek Mines...",
    "Locking Keystone doors...",
    "Restocking shops...",
    "Disassembling huts into Gorlek Ore...",
    "Tearing out plants in Wellspring Glades...",
    "Letting Baur fall asleep...",
    "Placing convenient Grapple Plants...",
    "Pulling back Levers...",
    "Distributing Wisps...",
    "Rebuilding walls...",
    "Filling up Kwolok's Hollow...",
    "Blowing out candles...",
    "Placing a snowball...",
    "Stacking up leaf piles...",
    "Cooking soup...",
    "Stealing Kuro's Feather from Ku...",
    "Separating Glide and Flap... (somehow)",
    "Closing Midnight Burrows...",
    "Polishing the Sword...",
    "Stealing Tokk's Compass...",
    "Corrupting the Wellspring...",
    "Coloring item messages...",
    "Deciding the first weapon...",
    "Calculating Spirit Light amounts...",
    "Writing hint notes to NPCs...",
    "Placing something on Rebuild the Glades...",
    "Flipping a coin for Sword or Hammer...",
    "Preventing Keystone door softlocks...",
    "Fixing strange vanilla bugs...",
    "Dashing and Bashing...",
    "Painting Murals in Windtorn Ruins...",
  ])

  onMounted(async () => {
    if (electronApi) {
      await electronApi.seedgenServer.ensureRunning.query()
    }

    await Promise.all([updateUniversePresets(), updateWorldPresets(), updateDifficulties(), updateTricks(), updateSnippetsInfo()])
  })

  const difficultyValuesByName = computed(() => difficulties.value.reduce((map, difficultyInfo: DifficultyInfo, index) => {
    map[difficultyInfo.name] = index
    return map
  }, {} as { [K in Difficulty]: number }))

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
      : {},
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
    },
  )

  type SeedgenAction = {
    id: number,
    label: string,
    icon: string,
    hint?: string,
    disabled?: boolean,
    handler: () => Promise<void>,
  }

  const runningSeedgenActionId = ref<number | null>(null)
  const runningSeedgenActionButtonElement = ref<HTMLElement | null>(null)
  const fakeProgressValue = ref<number>(0)
  const fakeProgressActive = ref(false)

  let animationFrameId: number | null = null
  let jumpToNextGeneratingMessageTimeoutId: number | null = null

  watch(fakeProgressActive, (value) => {
    if (!value) {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
      }

      if (jumpToNextGeneratingMessageTimeoutId !== null) {
        clearTimeout(jumpToNextGeneratingMessageTimeoutId)
      }

      return
    }

    let previousFrameTime: number | null = null
    const queueFrame = () => {
      animationFrameId = requestAnimationFrame((time) => {
        if (fakeProgressActive.value === false) {
          return
        }

        if (previousFrameTime !== null) {
          const delta = time - previousFrameTime
          fakeProgressValue.value += (1.0 - fakeProgressValue.value) * Math.min(delta / 1000.0 * 0.7, 1.0)
        }

        previousFrameTime = time

        queueFrame()
      })
    }

    queueFrame()

    const jumpToNextGeneratingMessage = () => {
      generatingMessageIndex.value = (generatingMessageIndex.value + 1) % generatingMessages.length
    }

    const queueJumpToNextGeneratingMessage = () => {
      jumpToNextGeneratingMessageTimeoutId = window.setTimeout(() => {
        jumpToNextGeneratingMessage()
        queueJumpToNextGeneratingMessage()
      }, 800 + Math.random() * 1000)
    }

    jumpToNextGeneratingMessage()
    queueJumpToNextGeneratingMessage()
  })

  const seedgenActions = computed(() => {
    const actions: Omit<SeedgenAction, "id">[] = []

    switch (universeSettings.value.worldSettings.length) {
      case 0: return []
      case 1: {
        if (isElectron) {
          actions.push({
            label: "Play Offline",
            icon: "mdi-play-outline",
            handler: async () => {
              // TODO
              await new Promise(resolve => setTimeout(resolve, 2000))
            },
          })

          actions.push({
            label: "Save",
            icon: "mdi-content-save-outline",
            handler: async () => {
              // TODO
              await seedgenAxios.post("/generate", universeSettings.value)
            },
          })
        } else {
          actions.push({
            label: "Download",
            icon: "mdi-download-outline",
            handler: async () => {
              // TODO
              await seedgenAxios.post("/generate", universeSettings.value)
            },
          })
        }

        actions.push({
          label: "Play Online",
          icon: "mdi-account-multiple-outline",
          hint: userStore.isLoggedIn
            ? "Play online co-op with and/or race against friends.\nAll items are shared in a Universe."
            : "You must be logged in to play online games.",
          handler: async () => {
            type SeedsResponse = {
              seedId: number,
            }

            const {data: seed}: {data: SeedsResponse} = await axios.post("/seeds", universeSettings.value)

            const {data: multiverseId}: {data: string} = await axios.post("/multiverses", {
              seedId: seed.seedId,
            })

            await useRouter().push({
              name: "game-multiverseId",
              params: {
                multiverseId,
              }
            })
          },
        })
      } break
      default: {
        actions.push({
          label: "Play Multiworld",
          icon: "mdi-account-multiple-outline",
          hint: userStore.isLoggedIn
            ? "Play online multiworld with friends.\nPlayers in the same world share everything and can find items for other worlds.\nYou can optionally race other teams by creating multiple universes."
            : "You must be logged in to play online games.",
          handler: async () => {
            // TODO
          },
        })
      } break
    }

    actions.push({
      label: "Play Bingo",
      icon: "mdi-checkerboard",
      hint: userStore.isLoggedIn
        ? "Play online bingo alone or with friends.\nWhen playing with friends, players in the same universe work as one team while optionally racing players in other universes."
        : "You must be logged in to play online games.",
      handler: async () => {
        // TODO
      },
    })

    return actions.map((action, index) => ({
      ...action,
      id: index,
      handler: async () => {
        fakeProgressValue.value = 0.0
        runningSeedgenActionId.value = index
        fakeProgressActive.value = true

        try {
          await action.handler()

          if (runningSeedgenActionButtonElement.value !== null) {
            confettiFromElement(runningSeedgenActionButtonElement.value)
          }
        } catch (e) {
          console.error(e)
        }

        fakeProgressActive.value = false
        fakeProgressValue.value = 1.0

        await new Promise(resolve => setTimeout(resolve, 300))

        runningSeedgenActionId.value = null
      },
    }))
  })

  async function updateUniversePresets() {
    universePresets.value = (await seedgenAxios.get('/presets/universe/list')).data
  }

  async function updateWorldPresets() {
    worldPresets.value = (await seedgenAxios.get('/presets/world/list')).data
  }

  async function updateDifficulties() {
    difficulties.value = (await seedgenAxios.get('/settings/difficulties')).data
  }

  async function updateTricks() {
    tricks.value = (await seedgenAxios.get('/settings/tricks')).data
  }

  async function updateSnippetsInfo() {
    snippetsInfo.value = (await seedgenAxios.get('/snippets/info')).data
  }

  async function onWorldSetupComplete(presets: WorldPreset[]) {
    const {data}: { data: WorldSettings } = await seedgenAxios.post('/presets/world/apply', {presets})
    universeSettings.value.worldSettings.push(data)
    selectedWorldIndex.value = universeSettings.value.worldSettings.length - 1
  }
</script>

<style lang="scss" scoped>
  .loading-text {
    font-size: 1.4em;
  }

  .no-transition:deep(*) {
    transition: none !important;
  }
</style>

<template>
  <v-menu v-model="worldContextMenuOpen" :target="[worldContextMenuX, worldContextMenuY]">
    <v-list>
      <v-list-item @click="duplicateWorld(worldContextMenuSelectedWorldIndex)">
        <v-icon start>mdi-content-duplicate</v-icon>
        Duplicate
      </v-list-item>
      <v-list-item @click="universeSettings.worldSettings.splice(worldContextMenuSelectedWorldIndex, 1)">
        <v-icon start>mdi-delete-outline</v-icon>
        Delete
      </v-list-item>
    </v-list>
  </v-menu>

  <v-tabs v-model="selectedWorldIndex" color="primary">
    <v-expand-x-transition group>
      <template v-if="universeSettings.worldSettings.length >= 2 || selectedWorldIndex === null">
        <div v-for="nth in universeSettings.worldSettings.length" :key="nth - 1">
          <v-tab
            :value="nth - 1"
            :variant="worldContextMenuOpen && worldContextMenuSelectedWorldIndex === nth - 1 ? 'tonal' : 'text'"
            @contextmenu="event => onWorldTabContextMenu(nth - 1, event)"
          >
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
      class="ma-4"
      type="article"
    />
    <template v-else>
      <v-window :model-value="selectedWorldIndex ?? universeSettings.worldSettings.length" :show-arrows="false">
        <v-window-item v-for="nth in universeSettings.worldSettings.length" :key="nth - 1" class="pa-4">
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
            :existing-world-settings="universeSettings.worldSettings"
            :loading="worldSetupLoading"
            @presets-selected="onWorldSetupPresetsSelected"
            @settings-selected="onWorldSetupSettingsSelected"
          />
        </v-window-item>
      </v-window>
    </template>
  </v-card>

  <div v-if="universeSettings.worldSettings.length > 0">
    <v-card class="pa-4 mt-2">
      <v-switch v-model="enableRaceMode" inset hide-details color="secondary" append-icon="mdi-timer-play-outline">
        <template #label>
          <div>
            <div>Race Mode</div>
            <div class="text-caption opacity-70">
              Enable an in-game lobby that starts the game for all players at the same time when they are ready.
            </div>
          </div>
        </template>
      </v-switch>
    </v-card>

    <v-card class="mt-2">
      <div class="pa-4">
        <v-switch v-model="enableBingo" inset hide-details color="secondary" append-icon="mdi-checkerboard">
          <template #label>
            <div>
              <div>Play Bingo</div>
              <div class="text-caption opacity-70">
                Play online bingo alone or with friends.
                When playing with friends, players in the same universe work as one team while optionally racing players in other universes.
              </div>
            </div>
          </template>
        </v-switch>
      </div>

      <v-expand-transition>
        <div v-if="enableBingo">
          <v-divider />
          <div class="pa-4">
            <wotw-seedgen-bingo-settings v-model="bingoSettings" />
          </div>
        </div>
      </v-expand-transition>
    </v-card>
  </div>

  <v-dialog :model-value="runningSeedgenActionId !== null" persistent max-width="600" opacity="0.75">
    <v-card class="pa-16 text-center loading-text">
      <div class="generating-message-container">
        <v-scroll-y-reverse-transition>
          <div :key="generatingMessageIndex" class="generating-message">{{ generatingMessages[generatingMessageIndex] }}</div>
        </v-scroll-y-reverse-transition>
      </div>
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
        :variant="action.disabled ? 'tonal' : 'elevated'"
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
    HashMapStringMetadata,
    HashMapStringUniversePreset,
    HashMapStringWorldPreset,
    TrickInfo,
    UniverseSettings,
    WorldPreset,
    WorldSettings,
  } from "@shared/types/seedgen"
  import type {BingoSettings, SeedgenGenerateResponse} from "@shared/types/http-api"
  import type {GroupedPresetIds, Presets} from "~/assets/types/components/seedgen"
  import {useSeedgenAxios} from "~/composables/useSeedgenAxios"
  import {confettiFromElement} from "~/assets/utils/confetti"
  import type {ComponentPublicInstance} from "vue"
  import {shuffleArray} from "~/assets/utils/shuffleArray"
  import {saveAs} from "file-saver"
  import {decode} from "cbor2"
  import {useCloned} from "@vueuse/core"
  import {clone} from "@shared/utils/clone"

  const isElectron = useIsElectron()
  const electronApi = useElectronApi()
  const seedgenAxios = useSeedgenAxios()
  const {axios} = useAxios()
  const worldSetupLoading = ref(false)
  const worldContextMenuOpen = ref(false)
  const worldContextMenuX = ref(0.0)
  const worldContextMenuY = ref(0.0)
  const worldContextMenuSelectedWorldIndex = ref(0)
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
  const enableBingo = ref(false)
  const enableRaceMode = ref(false)
  const bingoSettings = ref<BingoSettings>({
    discovery: null,
    revealFirstNCompletedGoals: 0,
    lockout: false,
    size: 5,
    goalType: "lines",
    goalAmount: 3,
  })
  const userStore = useUserStore()
  const generatingMessageIndex = ref(0)
  const generatingMessages = shuffleArray([
    "Stealing back Burrow from Grom…",
    "Looking for the next Health Fragment…",
    "Hiding Launch…",
    "Waking up Shriek…",
    "Infecting Mora…",
    "Planting seeds in the seed…",
    "Asking Motay for assistance…",
    "Handing out maps to Lupo…",
    "Reviving the Moki Father…",
    "Placing 1 Spirit Light…",
    "Cleaning Water in Luma Pools…",
    "Dumping Poison into the waters…",
    "Petrifying trees in Silent Woods…",
    "Turning off the lights in Mouldwood Depths…",
    "Looking for Gorlek Mines…",
    "Locking Keystone doors…",
    "Restocking shops…",
    "Disassembling huts into Gorlek Ore…",
    "Tearing out plants in Wellspring Glades…",
    "Letting Baur fall asleep…",
    "Placing convenient Grapple Plants…",
    "Pulling back levers…",
    "Distributing Wisps…",
    "Rebuilding walls…",
    "Filling up Kwolok's Hollow…",
    "Blowing out candles…",
    "Placing a snowball…",
    "Stacking up leaf piles…",
    "Cooking soup…",
    "Stealing Kuro's Feather from Ku…",
    "Separating Glide and Flap… (somehow)",
    "Closing Midnight Burrows…",
    "Polishing the Sword…",
    "Stealing Tokk's Compass…",
    "Corrupting the Wellspring…",
    "Coloring item messages…",
    "Deciding the first weapon…",
    "Calculating Spirit Light amounts…",
    "Writing hint notes to NPCs…",
    "Placing something on Rebuild the Glades…",
    "Flipping a coin for Sword or Hammer…",
    "Preventing Keystone Door softlocks…",
    "Fixing strange vanilla bugs…",
    "Dashing and Bashing…",
    "Painting murals in Windtorn Ruins…",
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

  // TODO: Show custom universe presets
  const _groupedUniversePresetIds = computed(
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
          // Interpolate to 0.9 while exponentially becoming slower
          fakeProgressValue.value += (0.9 - fakeProgressValue.value) * Math.min(delta / 1000.0 * 0.7, 1.0)
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

  /**
   * Generates a seed for offline use. This does not necessarily use the local
   * seed generator.
   */
  async function generateOfflineSeedFromCurrentSettings() {
    const {data}: {data: Blob} = await seedgenAxios.post("/generate", universeSettings.value, {
      responseType: "blob",
      params: {
        text_spoiler: true,
      },
    })

    const response: {
      worlds: number[][],
      text_spoiler: string | null,
      json_spoiler: string | null,
    } = decode(await data.bytes())

    return {
      worlds: response.worlds.map(numberArray => new Uint8Array(numberArray)),
      textSpoiler: response.text_spoiler,
      jsonSpoiler: response.json_spoiler,
    } as SeedgenGenerateResponse
  }

  /**
   * Generates a seed from current settings and creates a multiverse with that seed.
   * Always uses the server-side seedgen.
   */
  async function generateOnlineGameFromCurrentSettings() {
    type SeedsResponse = {
      seedId: number,
    }

    const clonedUniverseSettings = clone(universeSettings.value)

    if (enableBingo.value) {
      const goalState = bingoSettings.value.goalType === "lines"
        ? "bingoState.lines"
        : "bingoState.cards"
      const goalTargetValue = bingoSettings.value.goalAmount
      const goalName = bingoSettings.value.goalType === "lines"
        ? "Bingo Lines"
        : "Bingo Cards"

      for (const settings of clonedUniverseSettings.worldSettings) {
        settings.snippets.push("__bingo_generated")
        settings.inlineSnippets["__bingo_generated"] = {
          id: "__bingo_generated",
          content: `
            !tags("Bingo")
            !include("goal_mode_core", write_goal_progress_message, check_goals_completed, write_goals_incomplete_message, update_goals_completed)

            !augment_fun(check_goals_completed, {
                if ${goalState} < ${goalTargetValue} set_boolean("goals_completed", false)
            })

            !augment_fun(write_goals_incomplete_message, {
                if ${goalState} < ${goalTargetValue} {
                    set_string("color", "@")
                    write_bingo_message()
                    set_string("goals_incomplete_message", get_string("goals_incomplete_message") + "\\n" + get_string("bingo_message"))
                }
            })

            on change ${goalState} update_goals_completed()

            fun write_bingo_message() {
                set_string("bingo_message", get_string("color") + "${goalName}: " + ${goalState} + "/${goalTargetValue}" + get_string("color"))
            }
          `
        }
      }
    }

    const {data: seed}: {data: SeedsResponse} = await axios.post("/seeds", clonedUniverseSettings)

    const bingoCreationConfig = enableBingo.value
      ? {
        discovery: bingoSettings.value.discovery,
        revealFirstNCompletedGoals: bingoSettings.value.revealFirstNCompletedGoals,
        lockout: bingoSettings.value.lockout,
        size: bingoSettings.value.size,
      }
      : null

    const {data: multiverseId}: {data: string} = await axios.post("/multiverses", {
      seedId: seed.seedId,
      bingoConfig: bingoCreationConfig,
      raceMode: enableRaceMode.value,
    })

    // Delay a bit to give the dialog a chance to hide...
    setTimeout(() => {
      useRouter().push({
        name: "game-multiverseId",
        params: {
          multiverseId,
        }
      })
    }, 100)
  }

  const seedgenActions = computed(() => {
    const actions: Omit<SeedgenAction, "id">[] = []

    if (universeSettings.value.worldSettings.length > 0) {
      if (universeSettings.value.worldSettings.length === 1) {
        if (isElectron) {
          actions.push({
            label: "Play Offline",
            icon: "mdi-play-outline",
            disabled: enableBingo.value || enableRaceMode.value,
            hint: (enableBingo.value || enableRaceMode.value)
              ? "Unavailable when playing Bingo or with Race Mode enabled"
              : undefined,
            handler: async () => {
              const seed = await generateOfflineSeedFromCurrentSettings()
            },
          })

          actions.push({
            label: "Save",
            icon: "mdi-content-save-outline",
            disabled: enableBingo.value || enableRaceMode.value,
            hint: (enableBingo.value || enableRaceMode.value)
              ? "Unavailable when playing Bingo or with Race Mode enabled"
              : undefined,
            handler: async () => {
              const seed = await generateOfflineSeedFromCurrentSettings()
            },
          })
        } else {
          actions.push({
            label: "Download",
            icon: "mdi-download-outline",
            handler: async () => {
              const seed = await generateOfflineSeedFromCurrentSettings()
            },
          })
        }
      }

      actions.push({
        label: "Play Online",
        icon: "mdi-account-multiple-outline",
        hint: userStore.isLoggedIn
          ? "Play online co-op with and/or race against friends.\nWorlds inside Universes play together. Universes compete against other Universes."
          : "You must be logged in to play online games.",
        handler: async () => {
          await generateOnlineGameFromCurrentSettings()
        },
      })
    }

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

  async function onWorldSetupPresetsSelected(presets: WorldPreset[]) {
    worldSetupLoading.value = true

    try {
      const {data}: { data: WorldSettings } = await seedgenAxios.post('/presets/world/apply', {presets})
      universeSettings.value.worldSettings.push(data)
      selectedWorldIndex.value = universeSettings.value.worldSettings.length - 1
    } catch (e) {
      console.error(e)
    }

    worldSetupLoading.value = false
  }

  function onWorldSetupSettingsSelected(settings: WorldSettings) {
    universeSettings.value.worldSettings.push(settings)
    selectedWorldIndex.value = universeSettings.value.worldSettings.length - 1
  }

  function duplicateWorld(worldIndex: number) {
    universeSettings.value.worldSettings.push(clone(universeSettings.value.worldSettings[worldIndex]!))

    // Workaround for visual glitch
    setTimeout(() => selectedWorldIndex.value = universeSettings.value.worldSettings.length - 1, 0)
  }

  function onWorldTabContextMenu(worldIndex: number, event: MouseEvent) {
    worldContextMenuX.value = event.clientX
    worldContextMenuY.value = event.clientY
    worldContextMenuOpen.value = true
    worldContextMenuSelectedWorldIndex.value = worldIndex
  }
</script>

<style lang="scss" scoped>
  .loading-text {
    font-size: 1.4em;
  }

  .no-transition:deep(*) {
    transition: none !important;
  }

  .generating-message-container {
    position: relative;
    height: 2em;

    .generating-message {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>

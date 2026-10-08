<template>
  <v-menu v-model="worldContextMenuOpen" :target="[worldContextMenuX, worldContextMenuY]">
    <v-list>
      <v-list-item @click="duplicateWorld(worldContextMenuSelectedWorldIndex)">
        <v-icon start>mdi-content-duplicate</v-icon>
        Duplicate
      </v-list-item>
      <v-list-item @click="deleteWorld(worldContextMenuSelectedWorldIndex)">
        <v-icon start>mdi-delete-outline</v-icon>
        Delete
      </v-list-item>
    </v-list>
  </v-menu>

  <v-scroll-y-reverse-transition mode="out-in">
    <div :key="String(seedgenTransitionToggle)">
      <div class="d-flex ga-4">
        <v-tabs v-if="seedgenAssetsError === null" v-model="selectedTab" color="primary" class="flex-grow-1">
          <v-expand-x-transition>
            <div v-show="worldSettings.length >= 2 || selectedTab === 'world-setup'" class="d-flex">
              <v-expand-x-transition group>
                <div v-for="nth in worldSettings.length" :key="nth - 1">
                  <v-tab
                    :value="nth - 1"
                    :variant="worldContextMenuOpen && worldContextMenuSelectedWorldIndex === nth - 1 ? 'tonal' : 'text'"
                    @contextmenu="(event: MouseEvent) => onWorldTabContextMenu(nth - 1, event)"
                  >
                    <v-icon start>mdi-earth</v-icon>
                    {{ nth }}
                  </v-tab>
                </div>
              </v-expand-x-transition>
            </div>
          </v-expand-x-transition>

          <v-tab value="world-setup">
            <v-icon start>mdi-plus</v-icon>
            <template v-if="worldSettings.length === 0">Create World</template>
            <template v-else-if="worldSettings.length === 1">Multiworld</template>
            <template v-else>Add World</template>
          </v-tab>

          <v-expand-x-transition>
            <div v-show="worldSettings.length === 0">
              <v-tab value="universe-setup">
                <v-icon start>mdi-backup-restore</v-icon>
                Load Universe
              </v-tab>
            </div>
          </v-expand-x-transition>
        </v-tabs>
        <v-btn v-if="worldSettings.length > 0" variant="text" @click="resetEverything()">
          <v-icon start>mdi-restore</v-icon>
          Reset everything
        </v-btn>
      </div>
      <v-card :loading="runningSeedgenActionId !== null">
        <v-alert v-if="seedgenAssetsError !== null" color="error" icon="mdi-close-octagon-outline">
          <v-alert-title>Failed to start seedgen server</v-alert-title>
          <div>
            {{ seedgenAssetsError }}
          </div>
          <div>
            More details might have been written to the launcher log.
          </div>

          <div class="mt-2">
            <v-btn variant="tonal" @click="loadSeedgenAssets()">Retry</v-btn>
          </div>
        </v-alert>
        <v-skeleton-loader
          v-else-if="validUniversePresets === null || validWorldPresets === null || difficulties === null || snippetsInfo === null || spawnableAnchors === null"
          class="ma-4"
          type="article"
        />
        <template v-else>
          <v-window :model-value="selectedTab" :show-arrows="false">
            <v-window-item v-for="nth in worldSettings.length" :key="nth - 1" :value="nth - 1">
              <wotw-seedgen-world-settings
                v-model="worldSettings[nth - 1]!"
                :snippets-info="snippetsInfo"
                :difficulties="difficulties"
                :tricks="tricks"
                :spawnable-anchors="spawnableAnchors"
                :world-presets="validWorldPresets ?? {}"
                @delete="deleteWorld(nth - 1)"
                @duplicate="duplicateWorld(nth - 1)"
                @temp-schedule-asset-refresh="scheduleAssetRefresh()"
              />
            </v-window-item>
            <v-window-item :key="worldSettings.length" class="pa-3" value="world-setup" eager>
              <wotw-seedgen-world-setup
                :grouped-world-preset-ids="groupedWorldPresetIds"
                :world-presets="validWorldPresets"
                :existing-world-settings="worldSettings"
                :loading="worldSetupLoading"
                @presets-selected="onWorldSetupPresetsSelected"
                @settings-selected="onWorldSetupSettingsSelected"
                @temp-schedule-asset-refresh="scheduleAssetRefresh()"
              />
            </v-window-item>
            <v-window-item :key="worldSettings.length + 1" class="pa-3" value="universe-setup" eager>
              <wotw-seedgen-universe-setup
                :loading="universeSetupLoading"
                :universe-presets="validUniversePresets"
                @presets-selected="onUniverseSetupPresetsSelected"
                @settings-selected="onUniverseSetupSettingsSelected"
                @temp-schedule-asset-refresh="scheduleAssetRefresh()"
              />
            </v-window-item>
          </v-window>
        </template>
      </v-card>

      <div v-if="worldSettings.length > 0" class="mt-4">
        <v-card class="pa-4 mt-2">
          <v-row>
            <v-col cols="6">
              <div class="d-flex flex-column">
                <div>
                  <span>Seed</span>
                </div>
                <div class="text-caption opacity-70">
                  Value to initialize the random number generator with. Changing the seed even just slightly will result
                  in completely different item placements.
                </div>
              </div>
            </v-col>
            <v-col cols="6" class="d-flex align-center">
              <v-text-field
                v-model="seedStringInput"
                hide-details
                append-icon="mdi-dice-multiple-outline"
                placeholder="Leave empty for random seed"
                clearable
              />
            </v-col>
          </v-row>
        </v-card>
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
                    When playing with friends, players in the same universe work as one team while optionally racing players
                    in other universes.
                  </div>
                </div>
              </template>
            </v-switch>
          </div>

          <v-expand-transition>
            <div v-if="enableBingo">
              <v-divider/>
              <div class="pa-4">
                <wotw-seedgen-bingo-settings v-model="bingoSettings"/>
              </div>
            </div>
          </v-expand-transition>
        </v-card>
      </div>

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

      <div v-if="isElectron && seedgenActions.length > 0" class="mt-8 text-center gap-6">
        <v-btn variant="tonal" @click="openSaveUniversePresetDialog()">
          <v-icon start>mdi-content-save-outline</v-icon>
          Save As Custom Universe Preset
        </v-btn>

        <div class="opacity-30 pt-2 max-width-600 mx-auto">
          When generating a seed, all selected settings will be automatically stored and can be loaded by selecting "Previous Settings" in the seed generator.
        </div>
      </div>
    </div>
  </v-scroll-y-reverse-transition>

  <v-dialog :model-value="runningSeedgenActionId !== null" persistent max-width="600" opacity="0.75">
    <v-card class="pa-16 text-center loading-text">
      <div class="generating-message-container">
        <v-scroll-y-reverse-transition>
          <div :key="generatingMessageIndex" class="generating-message">{{
              generatingMessages[generatingMessageIndex]
            }}
          </div>
        </v-scroll-y-reverse-transition>
      </div>
      <v-progress-linear
        :model-value="fakeProgressValue"
        :max="1"
        class="mt-5"
        :class="{'no-transition': fakeProgressActive}"
      />
    </v-card>
  </v-dialog>

  <v-dialog v-model="saveUniversePresetDialogOpen" max-width="550">
    <v-card title="Save Universe Preset">
      <v-card-text>
        <v-text-field v-model="saveUniversePresetDialogPresetName" :disabled="saveUniversePresetDialogLoading" autofocus label="Preset name" />
        <v-textarea
          v-model="saveUniversePresetDialogPresetDescription"
          :disabled="saveUniversePresetDialogLoading"
          label="Preset description"
          auto-grow
          rows="3"
        />

        <div class="d-flex justify-end">
          <v-btn color="accent" variant="flat" :loading="saveUniversePresetDialogLoading" @click="saveUniversePreset">
            Save
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
  import type {
    Difficulty,
    DifficultyInfo,
    TrickInfo,
    UniverseSettings,
    WorldPreset,
    WorldSettings, SpawnAnchors, HashMapStringSchemaResultWorldPresetInfoString,
    HashMapStringSchemaResultUniversePresetInfoString, HashMapStringSchemaResultSnippetInfoString, UniversePreset,
  } from "@shared/types/seedgen"
  import type {
    BingoSettings,
    SeedgenErrorResponse,
    SeedgenGenerateResponse,
    SeedgenLogRecord,
  } from "@shared/types/http-api"
  import type {GroupedPresetIds, Presets} from "~/assets/types/components/seedgen"
  import {useSeedgenAxios} from "~/composables/useSeedgenAxios"
  import {confettiFromElement} from "~/assets/utils/confetti"
  import type {ComponentPublicInstance} from "vue"
  import {shuffleArray} from "~/assets/utils/shuffleArray"
  import {saveAs} from "file-saver"
  import {decode} from "cbor2"
  import {clone} from "@shared/utils/clone"
  import {type AxiosError, isAxiosError} from "axios"
  import type {ValidUniversePresets, ValidWorldPresets} from "@shared/types/seedgen-extra"

  function getDefaultBingoSettings(): BingoSettings {
    return {
      discovery: null,
      revealFirstNCompletedGoals: 0,
      lockout: false,
      size: 5,
      goalType: "lines",
      goalAmount: 3,
    }
  }

  const isElectron = useIsElectron()
  const electronApi = useElectronApi()
  const seedgenAxios = useSeedgenAxios()
  const {axios} = useAxios()
  const launcherHelper = useLauncherHelper()
  const snackbarStore = useSnackbarStore()
  const seedgenTransitionToggle = ref(false)
  const worldSetupLoading = ref(false)
  const worldContextMenuOpen = ref(false)
  const worldContextMenuX = ref(0.0)
  const worldContextMenuY = ref(0.0)
  const worldContextMenuSelectedWorldIndex = ref(0)
  const universeSetupLoading = ref(false)
  const saveUniversePresetDialogOpen = ref(false)
  const saveUniversePresetDialogPresetName = ref("")
  const saveUniversePresetDialogPresetDescription = ref("")
  const saveUniversePresetDialogLoading = ref(false)
  const seedString = ref<string | null>(null)
  const worldSettings = ref<WorldSettings[]>([])
  const universePresets = ref<HashMapStringSchemaResultUniversePresetInfoString | null>(null)
  const worldPresets = ref<HashMapStringSchemaResultWorldPresetInfoString | null>(null)
  const difficulties = ref<DifficultyInfo[]>([])
  const tricks = ref<TrickInfo[]>([])
  const selectedTab = ref<number | "world-setup" | "universe-setup">("world-setup")  // number = world index
  const snippetsInfo = ref<HashMapStringSchemaResultSnippetInfoString | null>(null)
  const spawnableAnchors = ref<SpawnAnchors | null>(null)
  const enableBingo = ref(false)
  const enableRaceMode = ref(false)
  const bingoSettings = ref<BingoSettings>(getDefaultBingoSettings())
  const userStore = useUserStore()
  const generatingMessageIndex = ref(0)
  const seedgenAssetsError = ref<string | null>(null)
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

  type SeedgenSessionSettings = {
    worldSettings: typeof worldSettings.value,
    seedString: typeof seedString.value,
    bingoSettings: typeof bingoSettings.value,
    enableRaceMode: typeof enableRaceMode.value,
  }

  onMounted(async () => {
    await loadSeedgenAssets()

    const storedSettingsJson = sessionStorage.getItem("seedgen-settings")
    if (storedSettingsJson !== null) {
      const storedSettings = JSON.parse(storedSettingsJson) as SeedgenSessionSettings

      worldSettings.value = storedSettings.worldSettings
      seedString.value = storedSettings.seedString
      bingoSettings.value = storedSettings.bingoSettings
      enableRaceMode.value = storedSettings.enableRaceMode

      if (worldSettings.value.length > 0) {
        selectedTab.value = worldSettings.value.length - 1
      }
    }
  })

  function resetEverything() {
    worldSettings.value = []
    seedString.value = null
    bingoSettings.value = getDefaultBingoSettings()
    enableRaceMode.value = false
    selectedTab.value = "world-setup"
    seedgenTransitionToggle.value = !seedgenTransitionToggle.value
    sessionStorage.removeItem("seedgen-settings")
  }

  function saveSessionSettings() {
    const sessionSettings: SeedgenSessionSettings = {
      worldSettings: worldSettings.value,
      seedString: seedString.value,
      bingoSettings: bingoSettings.value,
      enableRaceMode: enableRaceMode.value,
    }

    sessionStorage.setItem("seedgen-settings", JSON.stringify(sessionSettings))
  }

  watch([worldSettings, seedString, bingoSettings, enableRaceMode], () => {
    saveSessionSettings()
  }, {deep: true})

  const seedStringInput = computed<string>({
    set(value) {
      if (!value) {
        seedString.value = null
      } else {
        seedString.value = value
      }
    },
    get() {
      return seedString.value ?? ""
    }
  })

  const difficultyValuesByName = computed(() => difficulties.value.reduce((map, difficultyInfo: DifficultyInfo, index) => {
    map[difficultyInfo.name] = index
    return map
  }, {} as { [K in Difficulty]: number }))

  async function loadSeedgenAssets() {
    seedgenAssetsError.value = null

    if (electronApi) {
      try {
        await electronApi.seedgenServer.ensureRunning.query()
      } catch (e) {
        seedgenAssetsError.value = String(e)
        throw e
      }
    }

    await Promise.all([updateUniversePresets(), updateWorldPresets(), updateDifficulties(), updateTricks(), updateSnippetsInfo(), updateSpawnableAnchors()])
  }

  function groupPresets(presets: Presets): GroupedPresetIds {
    const groupedPresetIds: GroupedPresetIds = {}

    for (const [presetId, preset] of Object.entries(presets)) {
      const group = preset.content.info?.group ?? null

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

  function getUniverseSettings(): UniverseSettings {
    return {
      seed: seedString.value ?? String(Date.now()),
      worldSettings: worldSettings.value,
      inlineSnippets: {},
    }
  }

  const validUniversePresets = computed(() =>
    universePresets.value === null
      ? null
      : Object.fromEntries(Object.entries(universePresets.value).filter(([, e]) => e.status === "Ok")) as ValidUniversePresets
  )

  const validWorldPresets = computed(() =>
    worldPresets.value === null
      ? null
      : Object.fromEntries(Object.entries(worldPresets.value).filter(([, e]) => e.status === "Ok")) as ValidWorldPresets
  )

  const groupedWorldPresetIds = computed(
    () => {
      const presets = validWorldPresets.value
      if (presets === null) {
        return {}
      }

      const groupedPresets = groupPresets(presets)

      // Sort grouped presets by difficulty and amount of tricks
      for (const presetsInGroup of Object.values(groupedPresets)) {
        presetsInGroup.sort((a, b) => {
          const presetA = presets[a]!.content
          const presetB = presets[b]!.content
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

          if (tricksA === "All" && tricksB !== "All") {
            return -1
          }

          if (tricksA !== "All" && tricksB === "All") {
            return 1
          }

          if (tricksA !== "All" && tricksB !== "All" && tricksA.length !== tricksB.length) {
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
      }, 1200 + Math.random() * 1000)
    }

    jumpToNextGeneratingMessage()
    queueJumpToNextGeneratingMessage()
  })

  function showSeedgenLogMessages(records: SeedgenLogRecord[]) {
    snackbarStore.add({
      text: records.map(record => `${record.level}: ${record.message}`).join("\n"),
      title: "Seed Generator",
      contentClass: "text-pre-wrap",
      prependIcon: "mdi-alert-outline",
      color: "warning",
      timer: "bottom",
      timerColor: "warning-darken-2",
      timeout: 6000,
    })
  }

  /**
   * Generates a seed for offline use. This does not necessarily use the local
   * seed generator.
   */
  async function generateOfflineSeedFromCurrentSettings() {
    if (electronApi !== null) {
      await electronApi.fs.saveLastSeedgenSettings.query({universeSettings: getUniverseSettings()})
    }

    const {data}: { data: Blob } = await seedgenAxios.post("/generate", getUniverseSettings(), {
      responseType: "blob",
      params: {
        text_spoiler: true,
        max_log_level: "WARN",
      },
    })

    const response: {
      worlds: number[][],
      text_spoiler: string | null,
      json_spoiler: string | null,
      logs: {level: SeedgenLogRecord["level"], message: string}[],
    } = decode(await data.bytes())

    if (response.logs.length > 0) {
      showSeedgenLogMessages(response.logs)
    }

    return {
      worlds: response.worlds.map(numberArray => new Uint8Array(numberArray)),
      textSpoiler: response.text_spoiler,
      jsonSpoiler: response.json_spoiler,
      logs: response.logs,
    } as SeedgenGenerateResponse
  }

  /**
   * Generates a seed from current settings and creates a multiverse with that seed.
   * Always uses the server-side seedgen.
   */
  async function generateOnlineGameFromCurrentSettings() {
    const universeSettings = getUniverseSettings()
    const clonedUniverseSettings = clone(universeSettings)

    if (enableBingo.value) {
      for (const settings of clonedUniverseSettings.worldSettings) {
        settings.snippets.push("bingo")
        settings.snippetConfig["bingo"] = {
          "lines": bingoSettings.value.goalType === "lines"
            ? "true"
            : "false",
          "amount": String(bingoSettings.value.goalAmount),
        }
      }
    }

    const {data: universeSettingsWithInlinedUserSnippets} = await seedgenAxios.post("/settings/universe/inline-snippets", clonedUniverseSettings)
    const {data: response}: {
      data: {
        seedId: number,
        logs: SeedgenLogRecord[],
      }
    } = await axios.post("/seeds", universeSettingsWithInlinedUserSnippets)

    if (response.logs.length > 0) {
      showSeedgenLogMessages(response.logs)
    }

    const bingoCreationConfig = enableBingo.value
      ? {
        discovery: bingoSettings.value.discovery,
        revealFirstNCompletedGoals: bingoSettings.value.revealFirstNCompletedGoals,
        lockout: bingoSettings.value.lockout,
        size: bingoSettings.value.size,
      }
      : null

    const {data: multiverseId}: { data: string } = await axios.post("/multiverses", {
      seedId: response.seedId,
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

    if (worldSettings.value.length > 0) {
      if (worldSettings.value.length === 1) {
        if (isElectron) {
          actions.push({
            label: "Play Offline",
            icon: "mdi-play-outline",
            disabled: enableBingo.value || enableRaceMode.value,
            hint: (enableBingo.value || enableRaceMode.value)
              ? "Unavailable when playing Bingo or with Race Mode enabled"
              : undefined,
            handler: async () => {
              if (!electronApi) {
                return
              }
              const seed = await generateOfflineSeedFromCurrentSettings()
              const paths = await electronApi.fs.saveSeed.query({worlds: seed.worlds})
              if (paths[0]) {
                await launcherHelper.launch(`file:${paths[0]}`)
              }
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
              if (!electronApi) {
                return
              }
              const seed = await generateOfflineSeedFromCurrentSettings()
              const paths = await electronApi.fs.saveSeed.query({worlds: seed.worlds})
              if (paths[0]) {
                await electronApi.shell.showPathInExplorer.query({path: paths[0]})
              }
            },
          })
        } else {
          actions.push({
            label: "Download",
            icon: "mdi-download-outline",
            handler: async () => {
              const seed = await generateOfflineSeedFromCurrentSettings()
              if (seed.worlds[0]) {
                saveAs(new Blob([seed.worlds[0]]), "game.wotwr")
              }
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
          let errorMessage = String(e)

          if (isAxiosError(e) && e.response) {
            const axiosError = e as AxiosError

            if (axiosError.response) {
              let response = axiosError.response.data as SeedgenErrorResponse | Blob | string
              if (response instanceof Blob) {
                try {
                  response = JSON.parse(await response.text()) as SeedgenErrorResponse
                } catch (e) {
                  console.warn("Failed to parse error as JSON", e)
                }
              }

              if (typeof response === "string") {
                errorMessage = response
              } else if (response instanceof Blob) {
                errorMessage = await response.text()
              } else {
                errorMessage = [
                  response.message,
                  ...response.logs.map(record => `${record.level}: ${record.message}`)
                ].join("\n")
              }
            }
          }

          snackbarStore.add({
            title: "Error",
            text: errorMessage,
            contentClass: "text-pre-wrap",
            prependIcon: "mdi-close-octagon-outline",
            color: "error",
            timer: "bottom",
            timerColor: "error-darken-2",
            timeout: 6000,
          })

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

  async function updateSpawnableAnchors() {
    spawnableAnchors.value = (await seedgenAxios.get('/logic/spawn-anchors')).data
  }

  async function onWorldSetupPresetsSelected(presets: WorldPreset[]) {
    worldSetupLoading.value = true

    try {
      const {data}: { data: WorldSettings } = await seedgenAxios.post('/presets/world/apply', {presets})
      worldSettings.value.push(data)
      selectedTab.value = worldSettings.value.length - 1
    } catch (e) {
      console.error(e)
    }

    worldSetupLoading.value = false
  }

  function onWorldSetupSettingsSelected(settings: WorldSettings) {
    worldSettings.value.push(settings)
    selectedTab.value = worldSettings.value.length - 1
  }

  function duplicateWorld(worldIndex: number) {
    worldSettings.value.push(clone(worldSettings.value[worldIndex]!))
    setTimeout(() => selectedTab.value = worldSettings.value.length - 1, 0)
  }

  function deleteWorld(worldIndex: number) {
    worldSettings.value.splice(worldIndex, 1)
    setTimeout(() => {
      if (worldSettings.value.length === 0) {
        selectedTab.value = "world-setup"
      } else if (typeof selectedTab.value === "number" && selectedTab.value >= worldIndex) {
        selectedTab.value = Math.max(selectedTab.value - 1, 0)
      }
    }, 0)
  }

  function onWorldTabContextMenu(worldIndex: number, event: MouseEvent) {
    worldContextMenuX.value = event.clientX
    worldContextMenuY.value = event.clientY
    worldContextMenuOpen.value = true
    worldContextMenuSelectedWorldIndex.value = worldIndex
  }

  async function onUniverseSetupPresetsSelected(presets: UniversePreset[]) {
    universeSetupLoading.value = true

    try {
      const {data}: { data: UniverseSettings } = await seedgenAxios.post('/presets/universe/apply', {
        seed: "",
        presets,
      })
      worldSettings.value = data.worldSettings
      selectedTab.value = worldSettings.value.length > 0 ? 0 : "world-setup"
      seedgenTransitionToggle.value = !seedgenTransitionToggle.value
    } catch (e) {
      console.error(e)
    }

    universeSetupLoading.value = false
  }

  function onUniverseSetupSettingsSelected(settings: UniverseSettings) {
    worldSettings.value = settings.worldSettings
    selectedTab.value = worldSettings.value.length > 0 ? 0 : "world-setup"
    seedgenTransitionToggle.value = !seedgenTransitionToggle.value
  }

  function openSaveUniversePresetDialog() {
    saveUniversePresetDialogPresetName.value = ""
    saveUniversePresetDialogPresetDescription.value = ""
    saveUniversePresetDialogOpen.value = true
  }

  async function saveUniversePreset() {
    if (electronApi === null) {
      return
    }

    saveUniversePresetDialogLoading.value = true

    try {
      const trimmedName = saveUniversePresetDialogPresetName.value.trim()
      const trimmedDescription = saveUniversePresetDialogPresetDescription.value.trim()

      const preset: UniversePreset = {
        info: {
          name: trimmedName,
          description: trimmedDescription.length === 0 ? null : trimmedDescription,
          group: null,
        },
        seed: seedString.value,
        worldSettings: worldSettings.value,
      }

      await electronApi.fs.saveUniversePreset.query({
        name: trimmedName,
        preset,
      })

      snackbarStore.add({
        text: "Universe preset saved",
        timer: "bottom",
        timeout: 4000,
      })
      scheduleAssetRefresh()

      saveUniversePresetDialogOpen.value = false
    } catch (e) {
      console.error(e)
    }

    saveUniversePresetDialogLoading.value = false
  }

  // TODO: Temporary until we have a websocket
  function scheduleAssetRefresh() {
    setTimeout(() => loadSeedgenAssets(), 2000)
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

  .max-width-600 {
    max-width: 600px;
  }
</style>

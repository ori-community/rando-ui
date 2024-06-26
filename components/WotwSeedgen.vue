<template>
  <throttled-spinner>
    <div v-if="library !== null">
      <wotw-seedgen-toolbar
        v-model="worldIndex"
        :universe-preset="universeSettings"
        :adding-new-world="addingNewWorld"
        :disabled="loading"
        :load-custom-preset-disabled="!(customPresets?.length > 0)"
        @add-world="addNewWorld()"
        @start-over="resetEverything()"
        @save-as-custom-preset="customPresetSaveDialogOpen = true"
        @load-custom-preset="customPresetLoadDialogOpen = true"
        @delete-world="deleteWorld"
        @copy-world="createNewWorldFromExistingWorld"
        @save-world-as-custom-preset="customPresetCreateFromWorld"
        @import-custom-preset="customPresetImportDialogOpen = true"
      />

      <div class="mb-12">
        <v-slide-y-reverse-transition :duration="{ enter: 200, leave: 0 }" mode="out-in">
          <v-card :key="worldIndex" class="pa-5 seedgen">
            <v-scroll-x-reverse-transition :duration="{ enter: 200, leave: 0 }" mode="out-in">
              <wotw-seedgen-world-preset-setup
                v-if="addingNewWorld"
                :universe-settings="universeSettings"
                :custom-presets="customPresets"
                class="preset-setup"
                @create-new-world="createNewWorldWithPresets"
                @copy-from-world="createNewWorldFromExistingWorld"
                @custom-preset-delete="removeCustomPreset"
                @custom-preset-selected="loadCustomPreset"
              />
              <wotw-seedgen-world-settings
                v-else-if="universeSettings.worldSettings.length > 0"
                v-model="universeSettings.worldSettings[worldIndex]"
              />
            </v-scroll-x-reverse-transition>
          </v-card>
        </v-slide-y-reverse-transition>
      </div>

      <v-scroll-x-reverse-transition :duration="{ enter: 200, leave: 0 }" mode="out-in">
        <div v-if="availableActions.length > 0" key="buttons" class="buttons">
          <v-tooltip v-for="action in availableActions" :key="action.id" :disabled="!action.hint" bottom>
            <template #activator="{ on }">
              <div v-on="on">
                <v-btn
                  :ref="
                    (el) => {
                      if (action.id === runningActionId) {
                        runningActionElement = el
                      }
                    }
                  "
                  :disabled="action.disabled || loading"
                  :loading="loading && action.id === runningActionId"
                  color="accent"
                  x-large
                  @click="action.handler"
                >
                  <v-icon left>{{ action.icon }}</v-icon>
                  {{ action.label }}
                </v-btn>
              </div>
            </template>
            <span class="text-pre">{{ action.hint }}</span>
          </v-tooltip>
        </div>
        <div v-else key="empty"></div>
      </v-scroll-x-reverse-transition>
    </div>

    <!-- bingo settings -->
    <v-dialog v-model="bingoSettingsDialogOpen" :persistent="bingoLoading" max-width="600">
      <v-card class="pa-5">
        <h2 class="mb-5">Bingo Settings</h2>

        <wotw-seedgen-bingo-settings v-model="bingoSettings" />

        <div class="d-flex">
          <v-spacer />
          <v-btn color="accent" :loading="bingoLoading" depressed @click="createBingoGame()">Play Bingo</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- save custom preset -->
    <v-dialog v-model="customPresetSaveDialogOpen" max-width="650">
      <v-card class="pa-5">
        <h2>Save Custom Preset</h2>
        <v-label>Save the current configuration as a custom preset</v-label>
        <div class="mt-5">
          <v-text-field
            v-model="currentCustomPreset.name"
            :counter="customPresetNameMaxLength"
            label="Name"
            autofocus
          />
          <v-textarea
            v-model="currentCustomPreset.description"
            auto-grow
            :counter="customPresetDescriptionMaxLength"
            clearable
            clear-icon="mdi-close-circle"
            label="Description (optional)"
          />
          <v-col>
            <v-row class="mt-1" justify="end">
              <v-btn
                large
                color="accent"
                depressed
                :disabled="
                  !currentCustomPreset.name ||
                  currentCustomPreset.description?.length > customPresetDescriptionMaxLength ||
                  currentCustomPreset.name?.length > customPresetNameMaxLength
                "
                @click="saveCurrentSettingsAsPreset"
              >
                <v-icon left>mdi-content-save-outline</v-icon>
                Save
              </v-btn>
            </v-row>
          </v-col>
          <template v-if="customPresets?.length > 0">
            <v-divider class="mt-3" />
            <h3 class="mt-5">Overwrite Existing Preset</h3>
            <div class="mt-3">
              <wotw-seedgen-custom-preset-select
                :custom-presets="customPresets"
                @delete="removeCustomPreset"
                @selected="setAsCurrentCustomPreset"
              />
            </div>
          </template>
        </div>
      </v-card>
    </v-dialog>

    <!-- load custom preset -->
    <v-dialog v-model="customPresetLoadDialogOpen" max-width="650">
      <v-card class="pa-5">
        <h2 class="mb-3">Load Custom Presets</h2>
        <div>
          <wotw-seedgen-custom-preset-select
            :custom-presets="customPresets"
            @selected="(index) => loadCustomPreset(index, true)"
            @delete="removeCustomPreset"
          />
        </div>
      </v-card>
    </v-dialog>

    <!-- custom preset confirmation -->
    <v-dialog
      v-if="customPresets?.length > 0"
      v-model="customPresetConfirmationDialogOpen"
      width="unset"
      max-width="600"
    >
      <v-card class="pa-5">
        <v-col>
          <v-row>
            <div class="mb-4 confirmation-dialog-info">
              <v-label class="mb-2">{{ customPresetConfirmationText }}</v-label>
              <v-label v-if="selectedCustomPresetIndex >= 0"
                ><strong>{{ customPresets[selectedCustomPresetIndex].name }}</strong></v-label
              >
            </div>
          </v-row>
          <v-row justify="end" class="buttons">
            <v-btn text @click="customPresetConfirmationDialogOpen = false">No</v-btn>
            <v-btn depressed color="accent" @click.native="customPresetConfirmationCallback">Yes</v-btn>
          </v-row>
        </v-col>
      </v-card>
    </v-dialog>

    <!-- custom preset import -->
    <v-dialog v-model="customPresetImportDialogOpen" fullscreen>
      <v-card class="d-flex flex-column">
        <div class="pt-5 px-5 pb-2">
          <h3>Import Custom Preset</h3>
        </div>

        <textarea
          v-model="customPresetImportText"
          no-resize
          autofocus
          clearable
          class="custom-header-import-textarea flex-grow-1 pa-5"
          placeholder="Paste your custom preset here..."
        ></textarea>

        <div class="d-flex pa-5 buttons custom-preset-import-button-area">
          <input ref="presetUploadInput" type="file" accept=".txt" hidden @change="readCustomPresetFromFile" />
          <v-btn type="file" color="accent" depressed @click="selectFileForCustomPresetImport">Open from file</v-btn>

          <v-alert v-if="customPresetImportShowError" dense type="error">{{
            customPresetImportErrorMessageText
          }}</v-alert>
          <div>
            <v-btn
              depressed
              text
              @click="
                customPresetImportDialogOpen = false
                customPresetImportText = ''
              "
              >Cancel</v-btn
            >
            <v-btn
              color="accent"
              :disabled="!customPresetImportText"
              depressed
              @click="importCustomPreset(customPresetImportText)"
              >Import</v-btn
            >
          </div>
        </div>
      </v-card>
    </v-dialog>
  </throttled-spinner>
</template>

<script>
  import { mapGetters, mapState } from 'vuex'
  import cloneDeep from 'lodash.clonedeep'
  import { createFileAccessForLibrary } from '~/assets/seedgen/createFileAccess'
  import { isElectron } from '~/assets/lib/isElectron'
  import { UISeedGenerator } from '~/assets/lib/api/UISeedGenerator'
  import { confettiFromElement } from '~/assets/lib/confettiFromElement'
  import { BingoSettings } from '~/assets/lib/BingoSettings'
  import { EventBus } from '~/assets/lib/EventBus'
  import { getSeedgen } from '~/assets/lib/getSeedgen'

  export const CUSTOM_PRESET_LAST_CONFIG_NAME = 'Last Config'
  const SEEDGEN_CUSTOM_PRESETS_KEY = 'seedgen-custom-presets'
  const SeedgenWASM = getSeedgen()

  const createDefaultUniverseSettings = () => ({
    worldSettings: [],
    disableLogicFilter: false,
    seed: null,
    // online: Added when generating the seed
  })

  const createDefaultCustomPreset = () => ({
    name: null,
    description: null,
    multiverseSettings: null,
  })

  class SilentError extends Error {}

  export default {
    name: 'WotwSeedgen',
    data: () => ({
      universeSettings: createDefaultUniverseSettings(),
      addingNewWorld: true,
      worldIndex: 0,
      loading: false,
      bingoLoading: false,
      runningActionId: null,
      runningActionElement: null, // For confetti
      useLocalSeedgen: false,
      bingoSettings: new BingoSettings(),
      bingoSettingsDialogOpen: false,
      bingoSettingsDialogPromiseResolve: null,
      bingoSettingsDialogPromiseReject: null,
      customPresets: null,
      currentCustomPreset: createDefaultCustomPreset(),
      selectedCustomPresetIndex: 0,
      customPresetConfirmationText: null,
      customPresetConfirmationHandler: null,
      customPresetLoadDialogOpen: false,
      customPresetSaveDialogOpen: false,
      customPresetImportDialogOpen: false,
      customPresetImportText: '',
      customPresetSaveWorldIndex: null,
      customPresetConfirmationDialogOpen: false,
      customPresetImportShowError: false,
      customPresetImportErrorMessageText: '',
      customPresetImportErrorMessageTimeout: null,
      customPresetNameMaxLength: 50,
      customPresetDescriptionMaxLength: 200,
    }),
    computed: {
      isElectron,
      ...mapState('seedgen', ['library']),
      ...mapGetters('user', ['isLoggedIn']),
      availableActions() {
        const actions = []

        /**
         * what can we do after generating seeds?
         *
         * - Launch: If one world and Electron
         * - Download: If one world and Web
         * - Play Online: If one world and logged in
         * - Play Multiworld: If 2+ worlds and logged in
         * - Play Bingo: Any world count and logged in. Ask for board size, lockout, discovery and full clear/lines/CanvasRenderingContext2DSettings
         */

        if (this.universeSettings.worldSettings.length === 0) {
          return actions
        }

        if (this.universeSettings.worldSettings.length === 1) {
          if (this.isElectron) {
            actions.push({
              id: 'play_offline',
              label: 'Play Offline',
              icon: 'mdi-play-outline',
              handler: async () => {
                const seedgenResponse = await this.generateSeed()

                await seedgenResponse.electronApi.downloadSeed({
                  setTo: true,
                })

                await this.$store.dispatch('electron/launch')
              },
            })

            actions.push({
              id: 'save',
              label: 'Save',
              icon: 'mdi-content-save-outline',
              handler: async () => {
                const seedgenResponse = await this.generateSeed()

                await seedgenResponse.electronApi.downloadSeed({
                  setTo: false,
                  showInExplorer: true,
                })
              },
            })
          } else {
            actions.push({
              id: 'download',
              label: 'Download',
              icon: 'mdi-download-outline',
              handler: async () => {
                const seedgenResponse = await this.generateSeed()
                seedgenResponse.webApi.downloadSeed()
              },
            })
          }

          actions.push({
            id: 'play_online',
            label: 'Play Online',
            icon: 'mdi-account-multiple-outline',
            hint: this.isLoggedIn
              ? 'Play online co-op with and/or race against friends.\nAll items are shared in a Universe.'
              : 'You must be logged in to play online games.',
            disabled: !this.isLoggedIn,
            handler: async () => {
              const seedgenResponse = await this.generateSeed(true)

              const multiverseId = await this.$axios.$post('/multiverses', {
                seedId: seedgenResponse.data.result.seedId,
              })

              await this.$router.push({ name: 'game-multiverseId', params: { multiverseId } })
            },
          })
        } else if (this.universeSettings.worldSettings.length >= 2) {
          actions.push({
            id: 'play_multiworld',
            label: 'Play Multiworld',
            icon: 'mdi-account-supervisor-circle-outline',
            hint: this.isLoggedIn
              ? 'Play online multiworld with friends.\nPlayers in the same world share everything and can find items for other worlds.\nYou can optionally race other teams by creating multiple universes.'
              : 'You must be logged in to play online games.',
            disabled: !this.isLoggedIn,
            handler: async () => {
              const seedgenResponse = await this.generateSeed(true)

              const multiverseId = await this.$axios.$post('/multiverses', {
                seedId: seedgenResponse.data.result.seedId,
              })

              await this.$router.push({ name: 'game-multiverseId', params: { multiverseId } })
            },
          })
        }

        actions.push({
          id: 'play_bingo',
          label: 'Play Bingo',
          icon: 'mdi-checkerboard',
          hint: this.isLoggedIn
            ? 'Play online bingo alone or with friends.\nWhen playing with friends, players in the same universe work as one team while optionally racing players in other universes.'
            : 'You must be logged in to play online games.',
          disabled: !this.isLoggedIn,
          handler: async () => {
            await new Promise((resolve, reject) => {
              this.bingoSettingsDialogPromiseResolve = () => {
                this.bingoSettingsDialogPromiseResolve = null
                this.bingoSettingsDialogPromiseReject = null
                resolve()
              }

              this.bingoSettingsDialogPromiseReject = () => {
                this.bingoSettingsDialogPromiseResolve = null
                this.bingoSettingsDialogPromiseReject = null
                this.bingoSettingsDialogOpen = false
                reject(new SilentError('Bingo settings cancelled'))
              }

              this.bingoSettingsDialogOpen = true
            })
          },
        })

        return actions.map((action) => ({
          ...action,
          handler: async () => {
            this.loading = true
            this.runningActionId = action.id

            try {
              await action.handler()

              await this.$nextTick()

              if (this.runningActionElement !== null) {
                confettiFromElement(this.runningActionElement.$el, {
                  disableForReducedMotion: true,
                  zIndex: 100000,
                })
              }
            } catch (e) {
              if (!(e instanceof SilentError)) {
                console.error(e)

                let errorMessage = String(e)

                if (e.response) {
                  errorMessage += `\n<pre>${e.response.data}</pre>`
                }

                EventBus.$emit('notification', {
                  message: errorMessage,
                  color: 'error',
                })
              }
            }

            this.loading = false
          },
        }))
      },
    },
    watch: {
      worldIndex(_value, oldValue) {
        if (this.addingNewWorld && oldValue === this.universeSettings.worldSettings.length) {
          this.addingNewWorld = false
        }
      },
      bingoSettingsDialogOpen(isOpen) {
        if (!isOpen) {
          this.bingoSettingsDialogPromiseReject?.()
        }
      },
    },
    mounted() {
      this.$store.dispatch('seedgen/fetchLibrary')
      this.loadCustomPresets()
    },
    methods: {
      resetEverything() {
        this.createLastConfigPreset()
        this.universeSettings = createDefaultUniverseSettings()
        this.worldIndex = 0
        this.addingNewWorld = true
      },
      addNewWorld() {
        this.addingNewWorld = true
        this.worldIndex = this.universeSettings.worldSettings.length
      },
      async createNewWorldWithPresets(presets) {
        const seedgen = await SeedgenWASM

        const worldSettings = seedgen.WorldSettings.default()
        const fileAccess = await createFileAccessForLibrary(this.library)

        for (const presetName of presets) {
          const presetJson = JSON.stringify(this.library.worldPresets[presetName], null, 2)

          worldSettings.applyWorldPreset(seedgen.WorldPreset.fromJson(presetJson), fileAccess)
        }

        this.universeSettings.worldSettings.push(JSON.parse(worldSettings.toJson()))
        this.worldIndex = this.universeSettings.worldSettings.length - 1
        this.addingNewWorld = false
      },
      createNewWorldFromExistingWorld(worldIndex) {
        const copiedWorld = cloneDeep(this.universeSettings.worldSettings[worldIndex])
        this.universeSettings.worldSettings.push(copiedWorld)
        this.worldIndex = this.universeSettings.worldSettings.length - 1
        this.addingNewWorld = false
      },
      /**
       * @param online
       * @param systemAddedHeaders InlineHeaders {name?, content} that are added by the system, such as the dynamic Bingo header
       * @param snapshotConfig
       * @returns {Promise<SeedgenResponse>}
       */
      async generateSeed(online = false, systemAddedHeaders = [], snapshotConfig = true) {
        this.loading = true

        const settings = cloneDeep(this.universeSettings)
        settings.online = online

        for (const worldSetting of settings.worldSettings) {
          worldSetting.inlineHeaders.push(...systemAddedHeaders)
        }

        const uiSeedGenerator = new UISeedGenerator(this.$axios)

        const seedgenResponse = await uiSeedGenerator.generateSeed(settings)
        this.loading = false

        if (snapshotConfig) {
          this.createLastConfigPreset()
        }

        return seedgenResponse
      },
      async createBingoGame() {
        this.bingoLoading = true

        try {
          const generatedBingoHeaderLines = []

          switch (this.bingoSettings.goalType) {
            case 'cards':
              generatedBingoHeaderLines.push(
                `10|0|4|25|1|6|$(10|0) card completed`,
                `10|0|4|26|1|6|$(10|0) cards completed`,
                `10|0|4|27|1|6|$(10|0) cards completed`,
                `10|0>=${this.bingoSettings.goalAmount}|8|9|104|bool|true`,
              )
              break
            case 'lines':
              generatedBingoHeaderLines.push(
                `10|1|4|25|1|6|$(10|1) line completed`,
                `10|1|4|26|1|6|$(10|1) lines completed`,
                `10|1|4|27|1|6|$(10|1) lines completed`,
                `10|1>=${this.bingoSettings.goalAmount}|8|9|104|bool|true`,
              )
              break
            case 'all':
              generatedBingoHeaderLines.push(
                `10|0|4|25|1|6|$(10|0) card completed`,
                `10|0|4|26|1|6|$(10|0) cards completed`,
                `10|0|4|27|1|6|$(10|0) cards completed`,
                `10|0>=${this.bingoSettings.size * this.bingoSettings.size}|8|9|104|bool|true`,
              )
              break
          }

          generatedBingoHeaderLines.push(
            `9|104|8|34543|11226|bool|true`,
            `9|104|6|Bingo complete! Press Alt+C to warp to credits`,
          )

          const seedgenResponse = await this.generateSeed(true, [
            {
              name: '__bingo_generated',
              content: generatedBingoHeaderLines.join('\n'),
            },
          ])

          const multiverseId = await this.$axios.$post('/multiverses', {
            seedId: seedgenResponse.data.result.seedId,
            bingoConfig: {
              discovery: this.bingoSettings.discovery,
              lockout: this.bingoSettings.lockout,
              size: this.bingoSettings.size,
              revealFirstNCompletedGoals: this.bingoSettings.revealFirstNCompletedGoals,
            },
          })

          this.bingoSettingsDialogPromiseResolve?.()
          await this.$router.push({ name: 'game-multiverseId', params: { multiverseId } })
        } catch (e) {
          console.error(e)
          EventBus.$emit('main.error', e)
        }

        this.bingoLoading = false
      },
      deleteWorld(worldIndex) {
        this.universeSettings.worldSettings.splice(worldIndex, 1)

        this.worldIndex = Math.min(this.worldIndex, this.universeSettings.worldSettings.length - 1)

        if (this.universeSettings.worldSettings.length === 0) {
          this.addingNewWorld = true
        }
      },

      // CUSTOM PRESETS
      storeCustomPresets() {
        window.localStorage.setItem(SEEDGEN_CUSTOM_PRESETS_KEY, JSON.stringify(this.customPresets))
      },
      loadCustomPresets() {
        const storageData = window.localStorage.getItem(SEEDGEN_CUSTOM_PRESETS_KEY)
        if (storageData) {
          this.customPresets = JSON.parse(storageData)
          this.sortCustomPresets()
        }
      },
      sortCustomPresets() {
        this.customPresets.sort((a, b) => {
          if (a.name === CUSTOM_PRESET_LAST_CONFIG_NAME) {
            return -1
          }
          if (b.name === CUSTOM_PRESET_LAST_CONFIG_NAME) {
            return 1
          }

          return a.name.localeCompare(b.name)
        })
      },

      getMultiverseSettings(index = null) {
        return {
          universeSettings: !index
            ? this.universeSettings
            : { ...this.universeSettings, worldSettings: [this.universeSettings.worldSettings[index]] },
          bingoSettings: this.bingoSettings,
        }
      },

      addCurrentCustomPresetToArray() {
        const newCustomPreset = this.currentCustomPreset

        if (!this.customPresets) {
          this.customPresets = []
        }

        if (this.selectedCustomPresetIndex > -1) {
          this.$set(this.customPresets, this.selectedCustomPresetIndex, newCustomPreset)
        } else {
          this.customPresets.push(newCustomPreset)
        }
        this.sortCustomPresets()
        this.storeCustomPresets()
      },

      saveCustomPreset() {
        if (!this.currentCustomPreset?.name) {
          return
        }
        this.selectedCustomPresetIndex = this.customPresets?.findIndex(
          (p) => p.name.toUpperCase() === this.currentCustomPreset.name.toUpperCase(),
        )

        if (this.selectedCustomPresetIndex >= 0) {
          this.customPresetConfirmationCallback = this.saveCustomPresetConfirmed
          this.customPresetConfirmationText = 'Are you sure you want to overwrite this custom preset:'
          this.customPresetConfirmationDialogOpen = true
          return
        }
        this.saveCustomPresetConfirmed()
      },

      saveCustomPresetConfirmed() {
        this.customPresetSaveDialogOpen = false
        this.customPresetConfirmationDialogOpen = false
        if (!this.currentCustomPreset?.name) {
          return
        }
        this.addCurrentCustomPresetToArray()
        this.currentCustomPreset = createDefaultCustomPreset()
      },

      saveCurrentSettingsAsPreset() {
        if (!this.currentCustomPreset?.name) {
          return
        }
        this.currentCustomPreset.multiverseSettings = this.getMultiverseSettings(this.customPresetSaveWorldIndex)
        this.saveCustomPreset()
      },

      createLastConfigPreset() {
        if (this.universeSettings.worldSettings.length === 0) {
          return
        }

        this.currentCustomPreset = createDefaultCustomPreset()
        this.currentCustomPreset.name = CUSTOM_PRESET_LAST_CONFIG_NAME
        this.currentCustomPreset.description = 'Configuration of your last generated seed/game'
        this.selectedCustomPresetIndex = this.customPresets?.findIndex(
          (p) => p.name.toUpperCase() === this.currentCustomPreset.name.toUpperCase(),
        )
        this.currentCustomPreset.multiverseSettings = this.getMultiverseSettings(null)
        this.saveCustomPresetConfirmed()
      },

      customPresetCreateFromWorld(worldIndex) {
        this.customPresetSaveWorldIndex = worldIndex
        this.customPresetSaveDialogOpen = true
      },

      removeCustomPreset(index) {
        this.selectedCustomPresetIndex = index
        this.customPresetConfirmationCallback = this.removeCustomPresetConfirmed
        this.customPresetConfirmationText = 'Are you sure you want to delete this custom preset:'
        this.customPresetConfirmationDialogOpen = true
      },

      removeCustomPresetConfirmed() {
        this.customPresetConfirmationDialogOpen = false
        this.customPresets.splice(this.selectedCustomPresetIndex, 1)
        this.storeCustomPresets()
        this.currentCustomPreset = createDefaultCustomPreset()
        if (!(this.customPresets?.length > 0)) {
          this.customPresetLoadDialogOpen = false
        }
      },

      loadCustomPreset(index, setAllWorlds = false) {
        this.setMultiverseSettings(this.customPresets[index].multiverseSettings, setAllWorlds)
        this.customPresetLoadDialogOpen = false
      },
      setMultiverseSettings(multiverseSettings, setAllWorlds) {
        if (this.universeSettings.worldSettings.length === 0 || setAllWorlds) {
          this.bingoSettings = multiverseSettings.bingoSettings ?? new BingoSettings()
        }

        if (this.universeSettings.worldSettings.length === 0 || setAllWorlds) {
          this.universeSettings = cloneDeep(multiverseSettings.universeSettings) ?? createDefaultUniverseSettings()
          this.worldIndex = 0
        } else {
          this.$set(
            this.universeSettings.worldSettings,
            this.worldIndex,
            multiverseSettings.universeSettings.worldSettings[0],
          )
        }
        this.addingNewWorld = false
      },

      setAsCurrentCustomPreset(index) {
        this.currentCustomPreset = cloneDeep(this.customPresets[index])
      },

      importCustomPreset(jsonString) {
        try {
          this.currentCustomPreset = JSON.parse(jsonString)
        } catch (e) {
          this.importCustomPresetShowError(String(e))
          return
        }

        if (!this.currentCustomPreset.name) {
          this.importCustomPresetShowError('Name has to be set')
          return
        }

        if (!this.currentCustomPreset.multiverseSettings) {
          this.importCustomPresetShowError('Configuration cannot be empty')
          return
        }

        if (this.currentCustomPreset.name.length > this.customPresetNameMaxLength) {
          this.importCustomPresetShowError(
            `Name of custom header is too long (${this.currentCustomPreset.name.length}/${this.customPresetNameMaxLength})`,
          )
          return
        }

        if (this.currentCustomPreset.description?.length > this.customPresetDescriptionMaxLength) {
          this.importCustomPresetShowError(
            `Description of custom header is too long (${this.currentCustomPreset.description.length}/${this.customPresetDescriptionMaxLength})`,
          )
          return
        }

        this.saveCustomPreset()
        this.customPresetImportDialogOpen = false
      },
      importCustomPresetShowError(message) {
        if (this.customPresetImportErrorMessageTimeout !== null) {
          clearTimeout(this.customPresetImportErrorMessageTimeout)
        }

        this.customPresetImportErrorMessageText = message
        this.customPresetImportShowError = true

        this.customPresetImportErrorMessageTimeout = setTimeout(() => {
          this.customPresetImportShowError = false
        }, 5000)
      },
      selectFileForCustomPresetImport() {
        this.$refs.presetUploadInput.click()
      },
      readCustomPresetFromFile(event) {
        const [file] = event.target.files
        const reader = new FileReader()

        reader.addEventListener(
          'load',
          () => {
            // this will then display a text file
            this.customPresetImportText = reader.result
          },
          false,
        )

        if (file) {
          reader.readAsText(file)
        }

        this.$refs.presetUploadInput.value = ''
      },
    },
  }
</script>

<style lang="scss" scoped>
  .seedgen {
    position: relative;
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    flex-grow: 0;
    justify-content: center;
    gap: 0.4em;
  }

  .headers-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4em;
  }
  .confirmation-dialog-info label {
    display: block;
  }

  .custom-header-import-textarea {
    background-color: rgba(255, 255, 255, 0.1);
    width: 100%;
    min-height: 100%;
    border: none;
    outline: none;
    resize: none;
    color: white;
    font-family: 'Fira Code', 'Consolas', monospace;
  }
  .custom-preset-import-button-area {
    min-height: 100px;
    justify-content: space-between;
  }
</style>

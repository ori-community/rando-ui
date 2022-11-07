<template>
  <throttled-spinner>
    <div v-if="library !== null">
      <wotw-seedgen-toolbar
        v-model="currentWorldIndex"
        :universe-preset="universeSettings"
        :adding-new-world="addingNewWorld"
        :disabled="loading"
        @add-world="addNewWorld()"
        @start-over="resetEverything()"
        @restore-last-config="restoreLastConfig()"
        @delete-world="deleteWorld"
        @copy-world="createNewWorldFromExistingWorld"
      />

      <div class="mb-12">
        <v-slide-y-reverse-transition :duration="{ enter: 200, leave: 0 }" mode="out-in">
          <v-card :key="currentWorldIndex" class="pa-5 seedgen">
            <v-scroll-x-reverse-transition :duration="{ enter: 200, leave: 0 }" mode="out-in">
              <wotw-seedgen-world-preset-setup
                v-if="addingNewWorld"
                :universe-settings="universeSettings"
                class="preset-setup"
                @create-new-world="createNewWorldWithPresets"
                @copy-from-world="createNewWorldFromExistingWorld"
              />
              <wotw-seedgen-world-settings
                v-else-if="universeSettings.worldSettings.length > 0"
                v-model="universeSettings.worldSettings[currentWorldIndex]"
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
  </throttled-spinner>
</template>

<script>
  import { mapGetters, mapState } from 'vuex'
  import cloneDeep from 'lodash.clonedeep'
  import { createFileAccessForLibrary } from '~/assets/seedgen/createFileAccess'
  import { isElectron } from '~/assets/lib/isElectron'
  import { UISeedGenerator } from '~/assets/lib/api/UISeedGenerator'
  import { confettiFromElement } from '~/assets/lib/confettiFromElement'
  import { BingoSettings } from '~/components/WotwSeedgen/BingoSettings'
  import { EventBus } from '~/assets/lib/EventBus'

  const SEEDGEN_LAST_CONFIG_KEY = 'seedgen-last-config'
  const SeedgenWASM = import('@ori-rando/wotw-seedgen-wasm-ui')

  const createDefaultUniverseSettings = () => ({
    worldSettings: [],
    disableLogicFilter: false,
    seed: null,
    // online: Added when generating the seed
  })

  class SilentError extends Error {}

  export default {
    name: 'WotwSeedgen',
    data: () => ({
      universeSettings: createDefaultUniverseSettings(),
      addingNewWorld: true,
      currentWorldIndex: 0,
      loading: false,
      bingoLoading: false,
      runningActionId: null,
      runningActionElement: null, // For confetti
      useLocalSeedgen: false,
      bingoSettings: new BingoSettings(),
      bingoSettingsDialogOpen: false,
      bingoSettingsDialogPromiseResolve: null,
      bingoSettingsDialogPromiseReject: null,
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
         * - Play Co-op: If one world and logged in
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
                  setToCurrent: true,
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
                  setToCurrent: false,
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
            id: 'play_coop',
            label: 'Play Co-op',
            icon: 'mdi-account-multiple-outline',
            hint: this.isLoggedIn
              ? 'Play online co-op with friends.\nAll items are shared.\nYou can optionally race other teams.'
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
                EventBus.$emit('notification', {
                  message: String(e),
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
      currentWorldIndex(value, oldValue) {
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
    },
    methods: {
      resetEverything() {
        this.snapshotCurrentConfig()
        this.universeSettings = createDefaultUniverseSettings()
        this.currentWorldIndex = 0
        this.addingNewWorld = true
      },
      addNewWorld() {
        this.addingNewWorld = true
        this.currentWorldIndex = this.universeSettings.worldSettings.length
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
        this.currentWorldIndex = this.universeSettings.worldSettings.length - 1
        this.addingNewWorld = false
      },
      createNewWorldFromExistingWorld(worldIndex) {
        const copiedWorld = cloneDeep(this.universeSettings.worldSettings[worldIndex])
        this.universeSettings.worldSettings.push(copiedWorld)
        this.currentWorldIndex = this.universeSettings.worldSettings.length - 1
        this.addingNewWorld = false
      },
      /**
       * @param online
       * @param systemAddedHeaders InlineHeaders {name?, content} that are added by the system, such as the dynamic Bingo header
       * @param snapshotCurrentConfig
       * @returns {Promise<SeedgenResponse>}
       */
      async generateSeed(online = false, systemAddedHeaders = [], snapshotCurrentConfig = true) {
        this.loading = true

        const settings = cloneDeep(this.universeSettings)
        settings.online = online

        for (const worldSetting of settings.worldSettings) {
          worldSetting.inlineHeaders.push(...systemAddedHeaders)
        }

        const uiSeedGenerator = new UISeedGenerator(this.$axios)

        const seedgenResponse = await uiSeedGenerator.generateSeed(settings)
        this.loading = false

        if (snapshotCurrentConfig) {
          this.snapshotCurrentConfig()
        }

        return seedgenResponse
      },
      /**
       * Used for the "Restore last config" button
       */
      snapshotCurrentConfig() {
        if (this.universeSettings.worldSettings.length === 0) {
          return
        }

        window.localStorage.setItem(SEEDGEN_LAST_CONFIG_KEY, JSON.stringify(this.universeSettings))
      },
      restoreLastConfig() {
        const lastConfigJson = window.localStorage.getItem(SEEDGEN_LAST_CONFIG_KEY)

        if (lastConfigJson) {
          this.universeSettings = JSON.parse(lastConfigJson)
          this.currentWorldIndex = 0
          this.addingNewWorld = false
        }
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

        this.currentWorldIndex = Math.min(this.currentWorldIndex, this.universeSettings.worldSettings.length - 1)

        if (this.universeSettings.worldSettings.length === 0) {
          this.addingNewWorld = true
        }
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
</style>

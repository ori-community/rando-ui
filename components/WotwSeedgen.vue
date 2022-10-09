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

      <v-scroll-y-transition>
        <div v-if="availableActions.length > 0" class="buttons">
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
      </v-scroll-y-transition>
    </div>
  </throttled-spinner>
</template>

<script>
  import { mapState, mapGetters } from 'vuex'
  import cloneDeep from 'lodash.clonedeep'
  import { createFileAccessForLibrary } from '~/assets/seedgen/createFileAccess'
  import { isElectron } from '~/assets/lib/isElectron'
  import { UISeedGenerator } from '~/assets/lib/api/UISeedGenerator'
  import { confettiFromElement } from "~/assets/lib/confettiFromElement";

  const SeedgenWASM = import('@ori-rando/wotw-seedgen-wasm-ui')

  const createDefaultUniverseSettings = () => ({
    worldSettings: [],
    disableLogicFilter: false,
    seed: null,
    // online: Added when generating the seed
  })

  export default {
    name: 'WotwSeedgen',
    data: () => ({
      universeSettings: createDefaultUniverseSettings(),
      addingNewWorld: true,
      currentWorldIndex: 0,
      loading: false,
      runningActionId: null,
      runningActionElement: null, // For confetti
      useLocalSeedgen: false,
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
          handler: async () => {},
        })

        return actions.map((action) => ({
          ...action,
          handler: async () => {
            this.loading = true
            this.runningActionId = action.id
            await action.handler()
            this.loading = false

            await this.$nextTick()

            if (this.runningActionElement !== null) {
              confettiFromElement(this.runningActionElement.$el, {
                disableForReducedMotion: true,
                zIndex: 100000,
              })
            }
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
    },
    mounted() {
      this.$store.dispatch('seedgen/fetchLibrary')
    },
    methods: {
      resetEverything() {
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
       * @returns {Promise<SeedgenResponse>}
       */
      async generateSeed(online = false, systemAddedHeaders = []) {
        this.loading = true

        const settings = cloneDeep(this.universeSettings)
        settings.online = online

        for (const worldSetting of this.universeSettings.worldSettings) {
          worldSetting.inlineHeaders.push(...systemAddedHeaders)
        }

        const uiSeedGenerator = new UISeedGenerator(this.$axios)

        const seedgenResponse = await uiSeedGenerator.generateSeed(settings)
        this.loading = false
        return seedgenResponse
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

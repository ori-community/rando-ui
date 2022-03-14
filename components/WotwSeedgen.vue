<template>
  <div>
    <div class='d-flex justify-end pb-3'>
      <v-btn v-if="" text :disabled='lastConfigLoaded' @click='loadLastSeedgenConfig'>
        <template v-if='lastConfigLoaded'>
          <v-icon left>mdi-check</v-icon>
          Config loaded
        </template>
        <template v-else>
          Load last config
        </template>
      </v-btn>
    </div>

    <v-card v-if='loadedServerConfig' class='mb-4'>
      <v-tabs centered grow color='primary' show-arrows>
        <v-tab>
          <v-icon left>mdi-star-outline</v-icon>
          Presets
        </v-tab>
        <v-tab>
          <v-icon left>mdi-map-marker-path</v-icon>
          Paths
          <v-chip class='ml-1' x-small>{{ seedgenConfig.glitches.length }}</v-chip>
        </v-tab>
        <v-tab>
          <v-icon left>mdi-flag-checkered</v-icon>
          Goals
          <v-chip class='ml-1' x-small>{{ seedgenConfig.goals.length }}</v-chip>
        </v-tab>
        <v-tab>
          <v-icon left>mdi-cog-outline</v-icon>
          Headers
          <v-chip class='ml-1' x-small>{{ seedgenConfig.headers.length }}</v-chip>
        </v-tab>
        <v-tab>
          <v-icon left>mdi-tune-vertical</v-icon>
          Generator
        </v-tab>
        <v-tab-item class='pa-4'>
          <p>
            These presets are collections of <b>recommended randomizer options</b>.
            First, select a base preset and choose additional options as you like,
            apply them and hit "Generate".<br>
            If you want more granular control of your seed's settings, take a look
            at the other tabs.
          </p>

          <wotw-seedgen-preset-select
            :presets='availablePresets'
            @apply='applyPresets'
            @any-preset-selected='v => anyPresetSelected = v'
          />
        </v-tab-item>
        <v-tab-item class='pa-4'>
          <v-select
            v-model='seedgenConfig.difficulty'
            :items='availableDifficultiesArray'
            label='Difficulty'
            item-value='id'
            item-text='name'
          >
            <template #item='{item}'>
              <div>
                <v-list-item-title>{{ item.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.description }}</v-list-item-subtitle>
              </div>
            </template>
          </v-select>

          <p>
            Select which glitches should be required to complete the seed and where you would like to spawn.
          </p>
          <wotw-seedgen-glitch-select v-model='seedgenConfig.glitches' class='mb-6' :glitches='availableGlitches' />

          <v-select v-model='seedgenConfig.spawn' :items='availableSpawns' label='Spawn'>
            <template #item='{item}'>
              <v-icon v-if='!!item.icon' left>{{ item.icon }}</v-icon>
              <span>{{ item.text }}</span>
            </template>
          </v-select>
        </v-tab-item>
        <v-tab-item class='pa-4'>
          <p>
            Select goals you want to be required to complete the seed.
          </p>
          <wotw-seedgen-goal-select v-model='seedgenConfig.goals' :goals='availableGoals' />
        </v-tab-item>
        <v-tab-item class='pa-4'>
          <p>
            Headers let you customize the seed further.
          </p>
          <wotw-seedgen-header-select
            v-model='seedgenConfig.headers'
            :headers='availableHeaders'
            :header-args.sync='seedgenConfig.headerArgs'
          />

          <h3 class='mt-5 mb-2'>Custom headers</h3>
          <wotw-seedgen-custom-header-select v-model='seedgenConfig.customHeaders' />
        </v-tab-item>
        <v-tab-item class='pa-4'>
          <v-row>
            <v-col cols='12' md='6'>
              <v-text-field
                v-model='seedgenConfig.seed'
                label='Seed'
                persistent-placeholder
                placeholder='leave empty for random seed'
              />
              <wotw-seedgen-flag-checkbox
                v-model='seedgenConfig.flags'
                flag='--hard'
                hint='The seed generator will adjust damage boosts for you'
                label='I want to play on Hard Mode'
                persistent-hint
              />
              <wotw-seedgen-flag-checkbox
                v-model='seedgenConfig.flags'
                flag='--race'
                hint='Useful for races'
                label='Disable Spoilers'
                persistent-hint
              />
            </v-col>
            <v-col cols='12' md='6'>
              <wotw-seedgen-flag-checkbox
                v-model='seedgenConfig.flags'
                flag='--multiplayer'
                hint='Enable this if you want to play with friends (Co-op, Multiworld) or Bingo and select the appropriate game type below'
                label='Multiplayer / Bingo'
                persistent-hint
              />
              <v-expand-transition>
                <div v-if='seedgenConfig.flags.includes("--multiplayer")'>
                  <div class='mt-4'>
                    <v-select
                      v-model='createOnlineGame'
                      :items="[
                          {text: 'None', value: 'none'},
                          {text: 'Normal', value: 'normal'},
                          {text: 'Bingo', value: 'bingo'},
                          {text: 'Discovery Bingo', value: 'discovery_bingo'},
                          {text: 'Lockout Bingo', value: 'lockout_bingo'},
                        ]"
                      :disabled='!isLoggedIn'
                      :persistent-hint='!isLoggedIn'
                      :hint='!isLoggedIn ? "Only available when logged in" : ""'
                      label='Automatically create online game'
                    />
                  </div>

                  <v-combobox
                    v-model='seedgenConfig.multiNames'
                    :items='[]'
                    hint='If you specify world names here, this seed will be a multiworld seed. Press Enter to add players.'
                    label='Multiworld world names'
                    multiple
                    persistent-hint
                  >
                    <template #selection='data'>
                      <v-chip
                        :key='JSON.stringify(data.item)'
                        v-bind='data.attrs'
                        :disabled='data.disabled'
                        :input-value='data.selected'
                        @click:close='data.parent.selectItem(data.item)'
                      >
                        <v-avatar
                          class='accent white--text'
                          left
                          v-text='data.item.slice(0, 1).toUpperCase()'
                        ></v-avatar>
                        {{ data.item }}
                      </v-chip>
                    </template>
                  </v-combobox>
                </div>
              </v-expand-transition>
            </v-col>
          </v-row>
        </v-tab-item>
      </v-tabs>
    </v-card>

    <div class='text-center'>
      <v-tooltip :disabled='!anyPresetSelected' bottom>
        <template #activator='{on}'>
          <div v-on='on'>
            <v-btn
              ref='generateButton'
              :disabled='anyPresetSelected'
              :loading='loading'
              color='accent'
              class='mb-3'
              x-large
              @click='generateSeed()'
            >
              {{ isElectron && !seedgenConfig.flags.includes('--multiplayer') ? 'Generate and Launch' : 'Generate' }}
            </v-btn>
          </div>
        </template>
        <span>Apply or unselect selected presets first</span>
      </v-tooltip>

<!--      <v-btn text small @click='saveAsCustomPreset'>Save as custom preset</v-btn>-->
    </div>

    <v-dialog v-model='showResultDialog' persistent max-width='400'>
      <v-card class='relative pa-5'>
        <v-btn
          class='close-button'
          color='background lighten-5'
          icon
          @click='$router.push({query: {result: undefined}})'
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <wotw-seedgen-result-view v-if='!!seedgenResult' ref='resultView' :result='seedgenResult' />
      </v-card>
    </v-dialog>

    <v-dialog v-model='showBingoHeaderWarningDialog' max-width='700'>
      <v-card>
        <v-btn
          class='close-button'
          color='background lighten-5'
          icon
          @click='showBingoHeaderWarningDialog = false'
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-card-title>No Bingo header selected</v-card-title>
        <v-card-text>
          You are about to create a Bingo game but have not selected the Bingo header.
          We recommend that you enable the Bingo header so you can warp to credits after you completed the goal.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click='generateSeed(true)'>Continue without</v-btn>
          <v-btn depressed color='accent' @click='addBingoHeaderAndGenerateSeed()'>Add header and generate</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import { saveAs } from 'file-saver'
  import { mapGetters } from 'vuex'
  import glitches from '~/assets/seedgen/glitches.yaml'
  import goals from '~/assets/seedgen/goals.yaml'
  import spawns from '~/assets/seedgen/spawns.yaml'
  import difficulties from '~/assets/seedgen/difficulties.yaml'
  import { confettiFromElement } from '~/assets/lib/confettiFromElement'
  import { getDb } from '~/assets/db/database'
  import { isElectron } from '~/assets/lib/isElectron'
  import { EventBus } from '~/assets/lib/EventBus'

  const BINGO_HEADER_NAME = 'bingo'
  const LAST_SEEDGEN_CONFIG_LOCALSTORAGE_KEY = 'last_seedgen_config'

  const generateNewSeedgenConfig = () => ({
    flags: [],
    headers: [],
    customHeaders: [],
    glitches: [],
    difficulty: 'moki',
    goals: [],
    multiNames: [],
    seed: null,
    headerArgs: {},
    spawn: 'MarshSpawn.Main',
  })

  export default {
    name: 'WotwSeedgen',
    data: () => ({
      seedgenConfig: generateNewSeedgenConfig(),
      availableGlitches: glitches,
      availableGoals: goals,
      availableDifficulties: difficulties,
      availableHeaders: null, // Fetched from server
      availablePresets: null, // Fetched from server
      createOnlineGame: 'none',
      loading: false,
      showResultDialog: false,
      seedgenResult: null,
      anyPresetSelected: false,
      showBingoHeaderWarningDialog: false,
      lastConfigLoaded: false,
    }),
    computed: {
      isElectron,
      ...mapGetters('user', ['isLoggedIn']),
      loadedServerConfig() {
        return !!this.availableHeaders && !!this.availablePresets
      },
      availableSpawns() {
        const availableSpawns = [{
          text: 'Random',
          value: 'random',
          icon: 'mdi-shuffle',
        }]

        availableSpawns.push(...spawns.map(s => ({
          text: s.name,
          value: s.id,
        })))

        return availableSpawns
      },
      availableDifficultiesArray() {
        // Flatten Object and map object keys to id
        return Object.entries(difficulties).map(d => ({
          id: d[0].toLowerCase(),
          ...d[1],
        }))
      },
      hasLastSeedgenConfig() {
        return window.localStorage.getItem(LAST_SEEDGEN_CONFIG_LOCALSTORAGE_KEY) !== null
      }
    },
    watch: {
      'seedgenConfig.flags'(flags, oldFlags) {
        if (flags.includes('--multiplayer') && !oldFlags.includes('--multiplayer') && this.createOnlineGame === 'none' && this.isLoggedIn) {
          this.createOnlineGame = 'normal'
        }
      },
      '$route.query.seedId'() {
        this.updateSeedgenResultDialogState()
      },
      isLoggedIn(isLoggedIn) {
        if (isLoggedIn && this.createOnlineGame === 'none') {
          this.createOnlineGame = 'normal'
        } else if (!isLoggedIn) {
          this.createOnlineGame = 'none'
        }
      },
    },
    async mounted() {
      await this.fetchServerConfig()
      this.updateSeedgenResultDialogState()

      this.$emit('loaded')
    },
    methods: {
      async fetchServerConfig() {
        this.availableHeaders = await this.$axios.$get('/seedgen/headers')
        this.availablePresets = await this.$axios.$get('/seedgen/presets')
      },
      async addBingoHeaderAndGenerateSeed() {
        if (!this.seedgenConfig.headers.includes(BINGO_HEADER_NAME)) {
          this.seedgenConfig.headers.push(BINGO_HEADER_NAME)
        }

        await this.generateSeed()
      },
      loadLastSeedgenConfig() {
        this.seedgenConfig = JSON.parse(window.localStorage.getItem(LAST_SEEDGEN_CONFIG_LOCALSTORAGE_KEY))
        this.lastConfigLoaded = true
        setTimeout(() => {
          this.lastConfigLoaded = false
        }, 4000)
      },
      async generateSeed(ignoreMissingBingoHeader = false) {
        if (this.loading) {
          return
        }

        // Save as last config
        window.localStorage.setItem(LAST_SEEDGEN_CONFIG_LOCALSTORAGE_KEY, JSON.stringify(this.seedgenConfig))

        if (
          ['bingo', 'discovery_bingo'].includes(this.createOnlineGame) &&
          !this.seedgenConfig.headers.includes(BINGO_HEADER_NAME) &&
          !ignoreMissingBingoHeader
        ) {
          this.showBingoHeaderWarningDialog = true
          return
        }

        this.showBingoHeaderWarningDialog = false

        this.loading = true

        try {
          const additionalParameters = {}

          // Convert empty string seed to null
          if (!this.seedgenConfig.seed) {
            this.seedgenConfig.seed = null
          }

          // Remove multiNames if netcode is disabled
          if (!this.seedgenConfig.flags.includes('--multiplayer')) {
            this.seedgenConfig.multiNames = []
          }

          // Fetch custom headers from IndexedDB
          additionalParameters.customHeaders = (await (await getDb).customHeaders.bulkGet(this.seedgenConfig.customHeaders))
            .map(h => h.content)

          const response = await this.$axios.$post('/seeds', {
            ...this.seedgenConfig,
            ...additionalParameters,
          })

          if (this.seedgenConfig.flags.includes('--multiplayer')) {
            switch (this.createOnlineGame) {
              case 'normal':
                response.result.multiverseId = await this.$axios.$post('/multiverses', {
                  seedId: response.result.seedId,
                })
                break
              case 'bingo':
                response.result.multiverseId = await this.$axios.$post('/multiverses', {
                  bingo: {},
                  seedId: response.result.seedId,
                })
                break
              case 'discovery_bingo':
                response.result.multiverseId = await this.$axios.$post('/multiverses', {
                  bingo: { discovery: 2 },
                  seedId: response.result.seedId,
                })
                break
              case 'lockout_bingo':
                response.result.multiverseId = await this.$axios.$post('/multiverses', {
                  bingo: { lockout: true },
                  seedId: response.result.seedId,
                })
                break
            }
          }

          this.seedgenResult = response.result

          if (response.warnings && response.warnings.includes('WARN')) {
            EventBus.$emit('notification', {
              message: response.warnings,
              color: 'warning',
            })
          }

          const hasMultiverse = typeof this.seedgenResult.multiverseId === 'number'

          // Download the seed instantly for single player, non-networked games
          // and show the download dialog otherwise
          if (!hasMultiverse && response.result.files.length === 1) {
            const url = `${this.$axios.defaults.baseURL}/seeds/${response.result.seedId}/files/${response.result.files[0]}`
            const fileName = `seed_${response.result.seedId}.wotwr`

            confettiFromElement(this.$refs.generateButton.$el, {
              disableForReducedMotion: true,
              zIndex: 100000,
            })

            if (isElectron()) {
              try {
                await window.electronApi.invoke('launcher.downloadSeedFromUrl', {
                  url, fileName,
                })
                await this.$store.dispatch('electron/launch')
              } catch (e) {
                console.error(e)
              }
            } else {
              saveAs(url, fileName)
            }
          } else if (!hasMultiverse) {
            await this.$router.replace({ query: { seedId: response.result.seedId } })
          } else {
            await this.$router.push({
              name: 'game-multiverseId',
              params: { multiverseId: this.seedgenResult.multiverseId },
            })
          }
        } catch (e) {
          console.error(e)
          EventBus.$emit('notification', {
            message: 'Error while generating the seed.\n' + String(e.response?.data ?? e),
            color: 'error',
          })
        }

        this.loading = false
      },
      applyPresets({ presets, override }) {
        if (override) {
          this.seedgenConfig = generateNewSeedgenConfig()
        }

        const glitches = new Set(this.seedgenConfig.glitches)
        const headers = new Set(this.seedgenConfig.headers)
        const goals = new Set(this.seedgenConfig.goals)
        const playerNames = new Set(this.seedgenConfig.multiNames)
        const flags = new Set(this.seedgenConfig.flags)
        let spawn = this.seedgenConfig.spawn

        for (const preset of presets) {
          preset.glitches.forEach(p => glitches.add(p))
          preset.headerList.forEach(h => headers.add(h))
          preset.goalmodes.forEach(g => goals.add(g))
          preset.players.forEach(p => playerNames.add(p))
          spawn = preset.spawnLoc
        }

        const maxWorlds = presets.reduce((acc, value) => Math.max(acc, value), 0)
        const disableSpoilers = presets.some(p => !p.spoilers)
        const enableHardMode = presets.some(p => p.hard)
        const enableNetcode = presets.some(p => p.webConn)
        const randomSpawn = presets.some(p => p.spawnLoc === 'random')

        // Generate multiworld names if not given
        // e.g. if the preset requests 3 worlds but only has one player name given,
        // it will append 'Player1' and 'Player2' to it
        if (maxWorlds > 1) {
          for (let i = playerNames.size; i++; i < maxWorlds) {
            let playerIndex = 1
            while (playerNames.has(`Player${playerIndex}`)) {
              playerIndex++
            }
            playerNames.add(`Player${playerIndex}`)
          }
        }

        if (disableSpoilers) {
          flags.add('--race')
        }

        if (enableHardMode) {
          flags.add('--hard')
        }

        if (enableNetcode) {
          flags.add('--multiplayer')
        }

        if (randomSpawn) {
          spawn = 'random'
        }

        for (const preset of presets) {
          const currentDifficultyLevel = difficulties[this.seedgenConfig.difficulty.toUpperCase()].level
          const presetDifficultyLevel = difficulties[preset.difficulty.toUpperCase()].level

          if (presetDifficultyLevel > currentDifficultyLevel) {
            this.seedgenConfig.difficulty = preset.difficulty.toLowerCase()
          }
        }

        this.seedgenConfig.glitches = Array.from(glitches)
        this.seedgenConfig.headers = Array.from(headers)
        this.seedgenConfig.goals = Array.from(goals)
        this.seedgenConfig.flags = Array.from(flags)
        this.seedgenConfig.spawn = spawn
      },
      async updateSeedgenResultDialogState() {
        if (this.$route.query.seedId) {
          this.seedgenResult = await this.$axios.$get(`/seeds/${this.$route.query.seedId}`)
          this.showResultDialog = true
        } else {
          this.seedgenResult = null
          this.showResultDialog = false
        }
      },
    },
  }
</script>

<style lang='scss' scoped>
  .relative {
    position: relative;
  }

  .close-button {
    position: absolute;
    top: 1em;
    right: 1em;
    z-index: 10;
  }
</style>

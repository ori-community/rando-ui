<template>
  <div>
    <div class='d-flex justify-end pb-3 gapped'>
      <v-btn text :disabled="configReset" @click='resetConfig'>
        <template v-if="configReset">
          <v-icon left>mdi-check</v-icon>
          Config reset
        </template>
        <template v-else>
          <v-icon left>mdi-restore</v-icon>
          Reset config
        </template>
      </v-btn>
      <v-btn v-if='hasLastSeedgenConfig' text :disabled='lastConfigLoaded' @click='loadLastSeedgenConfig'>
        <template v-if='lastConfigLoaded'>
          <v-icon left>mdi-check</v-icon>
          Config loaded
        </template>
        <template v-else>
          <v-icon left>mdi-tray-arrow-up</v-icon>
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
        <v-tab :disabled="anyPresetSelected">
          <v-icon left>mdi-map-marker-path</v-icon>
          Paths
          <v-chip class='ml-1' x-small>{{ seedgenConfig.glitches.length }}</v-chip>
        </v-tab>
        <v-tab :disabled="anyPresetSelected">
          <v-icon left>mdi-flag-checkered</v-icon>
          Goals
          <v-chip class='ml-1' x-small>{{ seedgenConfig.goals.length }}</v-chip>
        </v-tab>
        <v-tab :disabled="anyPresetSelected">
          <v-icon left>mdi-cog-outline</v-icon>
          Headers
          <v-chip class='ml-1' x-small>{{ seedgenConfig.headers.length }}</v-chip>
        </v-tab>
        <v-tab :disabled="anyPresetSelected">
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
          <wotw-seedgen-glitch-select v-model='seedgenConfig.glitches' class='mb-6' :glitches='availableGlitches'/>

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
          <wotw-seedgen-goal-select v-model='seedgenConfig.goals' :goals='availableGoals'/>
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
          <wotw-seedgen-custom-header-select v-model='seedgenConfig.customHeaders'/>
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
                      v-model='createOnlineGameType'
                      :items="[
                          {text: 'No', value: 'none'},
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

                    <v-expand-transition>
                      <div v-if="['bingo', 'discovery_bingo', 'lockout_bingo'].includes(createOnlineGameType)">
                        <div class='pb-5'>
                          <v-slider
                            v-model="bingoSize"
                            :tick-labels='["1", "2", "3", "4", "5", "6", "7"]'
                            hide-details
                            min="1"
                            max="7"
                            label="Bingo Board size"
                          />
                        </div>
                      </div>
                    </v-expand-transition>
                  </div>

                  <v-combobox
                    v-if='createOnlineGameType !== "none"'
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
              v-if="isElectron"
              ref='launchButton'
              :disabled='anyPresetSelected || !canLaunchSeed || loading'
              :loading='loading && launchAfterGenerating'
              color='accent'
              class='mb-3'
              x-large
              @click='launchAfterGenerating = true; generate()'
            >
              <v-icon left>mdi-play</v-icon>
              Launch
            </v-btn>
            <v-btn
              ref='createOrDownloadButton'
              :disabled='anyPresetSelected || loading'
              :loading='loading && !launchAfterGenerating'
              color='accent'
              class='mb-3 ml-1'
              x-large
              @click='launchAfterGenerating = false; generate()'
            >
              <v-icon left>{{ createOnlineGame || seedgenConfig.multiNames.length > 1 ? 'mdi-hammer' : 'mdi-download' }}</v-icon>
              {{ createOnlineGame || seedgenConfig.multiNames.length > 1 ? 'Create' : 'Download' }}
            </v-btn>
          </div>
        </template>
        <span>Apply or unselect selected presets first</span>
      </v-tooltip>

      <!--      <v-btn text small @click='saveAsCustomPreset'>Save as custom preset</v-btn>-->
    </div>

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
          <v-spacer/>
          <v-btn text @click='generate(true)'>Continue without</v-btn>
          <v-btn depressed color='accent' @click='addBingoHeaderAndGenerateSeed()'>Add header and generate</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import glitches from '~/assets/seedgen/glitches.yaml'
  import goals from '~/assets/seedgen/goals.yaml'
  import spawns from '~/assets/seedgen/spawns.yaml'
  import difficulties from '~/assets/seedgen/difficulties.yaml'
  import {confettiFromElement} from '~/assets/lib/confettiFromElement'
  import {isElectron} from '~/assets/lib/isElectron'
  import {EventBus} from '~/assets/lib/EventBus'
  import {SeedGeneratorAPI} from '@/assets/lib/SeedGenerator'
  import {GAME_TYPE_NONE, MultiverseAPIClient} from '~/assets/lib/api/MultiverseAPIClient'

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
      createOnlineGameType: 'none',
      bingoSize: 5,
      loading: false,
      anyPresetSelected: false,
      showBingoHeaderWarningDialog: false,
      launchAfterGenerating: true,
      lastConfigLoaded: false,
      configReset: false,
      hasLastSeedgenConfig: false,
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
      canLaunchSeed() {
        if (!isElectron()) {
          return false
        }

        if (this.createOnlineGameType !== GAME_TYPE_NONE) {
          return false
        }

        if (this.seedgenConfig.multiNames.length > 1) {
          return false
        }

        return true
      },
      createOnlineGame() {
        return this.createOnlineGameType !== GAME_TYPE_NONE
      }
    },
    watch: {
      'seedgenConfig.flags'(flags, oldFlags) {
        if (flags.includes('--multiplayer') && !oldFlags.includes('--multiplayer') && this.createOnlineGameType === 'none' && this.isLoggedIn) {
          this.createOnlineGameType = 'normal'
        } else if (!flags.includes('--multiplayer') && oldFlags.includes('--multiplayer')) {
          this.createOnlineGameType = 'none'
        }
      },
      isLoggedIn(isLoggedIn) {
        if (isLoggedIn && this.createOnlineGameType === 'none') {
          this.createOnlineGameType = 'normal'
        } else if (!isLoggedIn) {
          this.createOnlineGameType = 'none'
        }
      },
      createOnlineGameType(type) {
        if (type === GAME_TYPE_NONE) {
          this.seedgenConfig.multiNames = []
        }
      },
    },
    async mounted() {
      await this.fetchServerConfig()

      this.$emit('loaded')

      this.hasLastSeedgenConfig = window.localStorage.getItem(LAST_SEEDGEN_CONFIG_LOCALSTORAGE_KEY) !== null
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

        await this.generate()
      },
      loadLastSeedgenConfig() {
        this.seedgenConfig = JSON.parse(window.localStorage.getItem(LAST_SEEDGEN_CONFIG_LOCALSTORAGE_KEY))
        this.lastConfigLoaded = true
        setTimeout(() => {
          this.lastConfigLoaded = false
        }, 4000)
      },
      resetConfig() {
        this.seedgenConfig = generateNewSeedgenConfig()
        this.configReset = true
        setTimeout(() => {
          this.configReset = false
        }, 1000)
      },

      async generate(ignoreMissingBingoHeader = false) {
        if (this.loading) {
          return
        }

        // Save as last config
        window.localStorage.setItem(LAST_SEEDGEN_CONFIG_LOCALSTORAGE_KEY, JSON.stringify(this.seedgenConfig))
        this.hasLastSeedgenConfig = true

        // check if bingo game selected and bingo headers missing
        if (
          ['bingo', 'discovery_bingo'].includes(this.createOnlineGameType) &&
          !this.seedgenConfig.headers.includes(BINGO_HEADER_NAME) &&
          !ignoreMissingBingoHeader
        ) {
          this.showBingoHeaderWarningDialog = true
          return
        }

        this.showBingoHeaderWarningDialog = false

        this.loading = true

        try {
          const seedGenerator = new SeedGeneratorAPI()
          const result = await seedGenerator.generateSeeds(this.seedgenConfig)

          if (!this.createOnlineGame) {
            if (result.hasMultipleSeeds) {
              throw new Error('You somehow managed to generate a multi without an online game. This is not supported. Please report this bug.')
            } else {
              if (isElectron()) {
                if (this.launchAfterGenerating) {
                  await result.saveSeed(0, true)
                } else {
                  await result.saveAllSeeds(true)
                }
              } else {
                result.downloadSeed(0)
              }

              confettiFromElement(
                (this.launchAfterGenerating ? this.$refs.launchButton : this.$refs.createOrDownloadButton).$el, {
                disableForReducedMotion: true,
                zIndex: 100000,
              })

              if (isElectron() && this.launchAfterGenerating) {
                await this.$store.dispatch('electron/launch')
              }
            }
          } else { // We have an online game...
            const multiverseId = await MultiverseAPIClient.createMultiverse(result.seedGroupId, this.createOnlineGameType, this.bingoSize)

            await this.$router.push({
              name: 'game-multiverseId',
              params: {multiverseId},
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
      applyPresets({presets, override}) {
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

  .gapped {
    gap: 0.2em;
  }
</style>

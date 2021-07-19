<template>
  <div>
    <throttled-spinner>
      <v-card v-if='loadedServerConfig' class='mb-4'>
        <v-tabs centered grow color='primary' show-arrows>
          <v-tab>
            <v-icon left>mdi-star-outline</v-icon>
            Presets
            <v-chip class='ml-1' x-small>{{ seedgenConfig.logic.length }}</v-chip>
          </v-tab>
          <v-tab>
            <v-icon left>mdi-map-marker-path</v-icon>
            Paths
            <v-chip class='ml-1' x-small>{{ seedgenConfig.logic.length }}</v-chip>
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
              If you're getting started with the Randomizer, select some presets and apply the seedgen settings.
              You can also add your own presets soon™.
            </p>

            <wotw-seedgen-preset-select :presets='availablePresets' @apply='applyPresets' />
          </v-tab-item>
          <v-tab-item class='pa-4'>
            <p>
              Select which paths should be required to complete the seed and where you would like to spawn.
            </p>
            <wotw-seedgen-logic-select v-model='seedgenConfig.logic' class='mb-6' :logic-sets='availableLogicSets' />

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
            <wotw-seedgen-header-select v-model='seedgenConfig.headers' :headers='availableHeaders' />
          </v-tab-item>
          <v-tab-item class='pa-4'>
            <v-row>
              <v-col cols='12' md='6'>
                <v-text-field label='Seed' persistent-placeholder placeholder='leave empty for random seed' />
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
                  hint='Enable Netcode if you want to play with friends (Co-op, Multiworld) or Bingo'
                  label='Enable Netcode'
                  persistent-hint
                />
                <v-expand-transition>
                  <div v-if='seedgenConfig.flags.includes("--multiplayer")'>
                    <div class='mb-3'>
                      <v-combobox
                        v-model='seedgenConfig.multiNames'
                        :items='[]'
                        hint='If you specify player names here, this seed will be a multiworld seed. Press Enter to add players.'
                        label='Multiworld player names'
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

                    <v-select
                      v-model='createOnlineGame'
                      :items="[
                        {text: 'None', value: 'none'},
                        {text: 'Co-op', value: 'coop'},
                        {text: 'Multiworld', value: 'multi'},
                        {text: 'Bingo (soon™)', value: 'bingo', disabled: true},
                      ]"
                      label='Automatically create online game'
                    />
                  </div>
                </v-expand-transition>
              </v-col>
            </v-row>
          </v-tab-item>
        </v-tabs>
      </v-card>
    </throttled-spinner>

    <div class='text-center'>
      <v-btn ref='generateButton' :loading='loading' color='accent' x-large @click='generateSeed'>
        Generate
      </v-btn>
    </div>

    <v-dialog v-model='showResultDialog' persistent max-width='400'>
      <div class='relative'>
        <v-btn class='close-button' color='background lighten-5' icon @click='$router.push({query: {result: undefined}})'>
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <wotw-seedgen-result-view v-if='!!seedgenResult' ref='resultView' :result='seedgenResult' />
      </div>
    </v-dialog>
  </div>
</template>

<script>
  import { saveAs } from 'file-saver'
  import logicSets from '~/assets/seedgen/logic.yaml'
  import goals from '~/assets/seedgen/goals.yaml'
  import spawns from '~/assets/seedgen/spawns.yaml'
  import { confettiFromElement } from '~/assets/lib/confettiFromElement'

  const generateNewSeedgenConfig = () => ({
    flags: [],
    headers: [],
    logic: [],
    goals: [],
    multiNames: [],
    seed: null,
    spawn: 'MarshSpawn.Main',
  })

  export default {
    name: 'WotwSeedgen',
    data: () => ({
      seedgenConfig: generateNewSeedgenConfig(),
      availableLogicSets: logicSets,
      availableGoals: goals,
      availableHeaders: null, // Fetched from server
      availablePresets: null, // Fetched from server
      createOnlineGame: 'coop',
      loading: false,
      showResultDialog: false,
      seedgenResult: null,
    }),
    computed: {
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
      }
    },
    watch: {
      'seedgenConfig.multiNames'(multiNames) {
        if (multiNames && multiNames.length > 0) {
          this.createOnlineGame = 'multi'
        }
      },
      '$route.query.result'() {
        this.updateSeedgenResultDialogState()
      },
    },
    mounted() {
      this.fetchServerConfig()
      this.updateSeedgenResultDialogState()
    },
    methods: {
      async fetchServerConfig() {
        this.availableHeaders = await this.$axios.$get('/seedgen/headers')
        this.availablePresets = await this.$axios.$get('/seedgen/presets')
      },
      async generateSeed() {
        if (this.loading) {
          return
        }

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
          } else if (this.createOnlineGame === 'coop') {
            additionalParameters.isCoop = true
          } else if (this.createOnlineGame === 'multi') {
            additionalParameters.isMulti = true
          }

          const result = await this.$axios.$post('/seeds', {
            ...this.seedgenConfig,
            ...additionalParameters,
          })

          this.seedgenResult = result

          // Download the seed instantly for single player, non-networked games
          // and show the download dialog otherwise
          if (result.gameId === null && result.playerList.length === 0) {
            saveAs(`${this.$axios.defaults.baseURL}/seeds/${result.seedId}`, `seed_${result.seedId}.wotwr`)
          } else {
            this.showResultDialog = true
            await this.$router.replace({query: {result: JSON.stringify(result)}})

            await this.$nextTick()
            confettiFromElement(this.$refs.resultView.$el, {
              disableForReducedMotion: true,
              zIndex: 100000,
            })
          }
        } catch (e) {
          console.error(e)
        }

        this.loading = false
      },
      applyPresets({ presets, merge }) {
        if (!merge) {
          this.seedgenConfig = generateNewSeedgenConfig()
        }

        const paths = new Set(this.seedgenConfig.logic)
        const headers = new Set(this.seedgenConfig.headers)
        const goals = new Set(this.seedgenConfig.goals)
        const playerNames = new Set(this.seedgenConfig.multiNames)
        const flags = new Set(this.seedgenConfig.flags)
        let spawn = this.seedgenConfig.spawn

        for (const preset of presets) {
          preset.pathsets.forEach(p => paths.add(p))
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

        this.seedgenConfig.logic = Array.from(paths)
        this.seedgenConfig.headers = Array.from(headers)
        this.seedgenConfig.goals = Array.from(goals)
        this.seedgenConfig.flags = Array.from(flags)
        this.seedgenConfig.spawn = spawn
      },
      updateSeedgenResultDialogState() {
        if (this.$route.query.result) {
          this.seedgenResult = JSON.parse(String(this.$route.query.result))
          this.showResultDialog = true
        } else {
          this.seedgenResult = null
          this.showResultDialog = false
        }
      }
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

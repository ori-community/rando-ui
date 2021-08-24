<template>
  <div>
    <throttled-spinner>
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
              If you're just getting started with the Randomizer, select the Moki preset and click "Apply Presets"
              button.
              You can also add your own presets soon™.
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
            <wotw-seedgen-header-select v-model='seedgenConfig.headers' :headers='availableHeaders' />

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
                            {text: 'Co-op', value: 'coop'},
                            {text: 'Multiworld', value: 'multi'},
                            {text: 'Bingo', value: 'bingo'},
                            {text: 'Discovery Bingo', value: 'discovery_bingo'},
                            {text: 'Lockout Bingo', value: 'lockout_bingo'},
                          ]"
                        hide-details
                        label='Automatically create online game'
                      />
                    </div>

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
                </v-expand-transition>
              </v-col>
            </v-row>
          </v-tab-item>
        </v-tabs>
      </v-card>
    </throttled-spinner>

    <div class='text-center'>
      <v-tooltip :disabled='!anyPresetSelected' bottom>
        <template #activator='{on}'>
          <div v-on='on'>
            <v-btn
              ref='generateButton'
              :disabled='anyPresetSelected'
              :loading='loading'
              color='accent'
              x-large
              @click='generateSeed'
            >
              Generate
            </v-btn>
          </div>
        </template>
        <span>Apply or deselect selected presets first</span>
      </v-tooltip>
    </div>

    <v-dialog v-model='showResultDialog' persistent max-width='400'>
      <div class='relative'>
        <v-btn
          class='close-button'
          color='background lighten-5'
          icon
          @click='$router.push({query: {result: undefined}})'
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <wotw-seedgen-result-view v-if='!!seedgenResult' ref='resultView' :result='seedgenResult' />
      </div>
    </v-dialog>
  </div>
</template>

<script>
  import { saveAs } from 'file-saver'
  import glitches from '~/assets/seedgen/glitches.yaml'
  import goals from '~/assets/seedgen/goals.yaml'
  import spawns from '~/assets/seedgen/spawns.yaml'
  import difficulties from '~/assets/seedgen/difficulties.yaml'
  import { confettiFromElement } from '~/assets/lib/confettiFromElement'
  import { db } from '~/assets/db/database'

  const generateNewSeedgenConfig = () => ({
    flags: [],
    headers: [],
    customHeaders: [],
    glitches: [],
    difficulty: 'moki',
    goals: [],
    multiNames: [],
    seed: null,
    headerArgs: [],
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
      createOnlineGame: 'coop',
      loading: false,
      showResultDialog: false,
      seedgenResult: null,
      anyPresetSelected: false,
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
      },
      availableDifficultiesArray() {
        // Flatten Object and map object keys to id
        return Object.entries(difficulties).map(d => ({
          id: d[0].toLowerCase(),
          ...d[1],
        }))
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
          }

          // Fetch custom headers from IndexedDB
          additionalParameters.customHeaders = (await db.customHeaders.bulkGet(this.seedgenConfig.customHeaders))
            .map(h => h.content)

          const result = await this.$axios.$post('/seeds', {
            ...this.seedgenConfig,
            ...additionalParameters,
          })

          if (this.seedgenConfig.flags.includes('--multiplayer')) {
            switch (this.createOnlineGame) {
              case 'coop':
                result.gameId = await this.$axios.$post('/games', {isCoop: true})
                break
              case 'multi':
                result.gameId = await this.$axios.$post('/games', {isMulti: true})
                break
              case 'bingo':
                result.gameId = await this.$axios.$post('/bingo')
                break
              case 'discovery_bingo':
                result.gameId = await this.$axios.$post('/bingo', {discovery: 2})
                break
              case 'lockout_bingo':
                result.gameId = await this.$axios.$post('/bingo', {lockout: true})
                break
            }
          }

          this.seedgenResult = result

          // Download the seed instantly for single player, non-networked games
          // and show the download dialog otherwise
          if (this.seedgenResult.gameId === null && result.playerList.length === 0) {
            saveAs(`${this.$axios.defaults.baseURL}/seeds/${result.seedId}`, `seed_${result.seedId}.wotwr`)
            confettiFromElement(this.$refs.generateButton.$el, {
              disableForReducedMotion: true,
              zIndex: 100000,
            })

          } else {
            await this.$router.replace({ query: { result: JSON.stringify(result) } })

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
      updateSeedgenResultDialogState() {
        if (this.$route.query.result) {
          this.seedgenResult = JSON.parse(String(this.$route.query.result))
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

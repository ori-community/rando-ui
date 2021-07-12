<template>
  <div>
    <throttled-spinner>
      <v-card v-if='loadedServerConfig' class='mb-4'>
        <v-tabs centered grow color='primary' show-arrows>
          <v-tab>
            <v-icon left>mdi-map-marker-path</v-icon>
            Paths <v-chip class='ml-1' x-small>{{ seedgenConfig.logic.length }}</v-chip>
          </v-tab>
          <v-tab>
            <v-icon left>mdi-flag-checkered</v-icon>
            Goals <v-chip class='ml-1' x-small>{{ seedgenConfig.goals.length }}</v-chip>
          </v-tab>
          <v-tab>
            <v-icon left>mdi-cog-outline</v-icon>
            Headers <v-chip class='ml-1' x-small>{{ seedgenConfig.headers.length }}</v-chip>
          </v-tab>
          <v-tab>
            <v-icon left>mdi-tune-vertical</v-icon>
            Generator settings
          </v-tab>
          <v-tab-item class='pa-4'>
            <p>
              Select which paths should be required to complete the seed.
            </p>
            <wotw-seedgen-logic-select v-model='seedgenConfig.logic' :logic-sets='availableLogicSets' />
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
      <v-btn ref='generateButton' :loading='loading' color='accent' x-large @click='generateSeed'>
        Generate
      </v-btn>
    </div>
  </div>
</template>

<script>
  import { saveAs } from 'file-saver';
  import logicSets from '~/assets/seedgen/logic.yaml'
  import goals from '~/assets/seedgen/goals.yaml'
  import { confettiFromElement } from '~/assets/lib/confettiFromElement'

  const generateNewSeedgenConfig = () => ({
    flags: [],
    headers: [],
    presets: [],
    logic: [],
    goals: [],
    multiNames: null,
    seed: null,
  })

  export default {
    name: 'WotwSeedgen',
    data: () => ({
      seedgenConfig: generateNewSeedgenConfig(),
      availableLogicSets: logicSets,
      availableGoals: goals,
      availableHeaders: null, // Fetched from server
      loading: false,
    }),
    computed: {
      loadedServerConfig() {
        return !!this.availableHeaders
      },
    },
    mounted() {
      this.fetchServerConfig()
    },
    methods: {
      async fetchServerConfig() {
        this.availableHeaders = await this.$axios.$get('/seedgen/headers')
      },
      async generateSeed() {
        if (this.loading) {
          return
        }

        this.loading = true

        try {
          // Convert empty string seed to null
          if (!this.seedgenConfig.seed) {
            this.seedgenConfig.seed = null
          }

          const seedId = await this.$axios.$post('/seeds', this.seedgenConfig)

          console.log(seedId)
          confettiFromElement(this.$refs.generateButton.$el, {
            disableForReducedMotion: true,
          })

          saveAs(`${this.$axios.defaults.baseURL}/seeds/${seedId}/`, 'seed.wotwr')
        } catch (e) {
          console.error(e)
        }

        this.loading = false
      }
    },
  }
</script>

<style scoped>

</style>

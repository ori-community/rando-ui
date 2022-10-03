<template>
  <throttled-spinner>
    <div v-if="library !== null">
      <wotw-seedgen-toolbar
        v-model="currentWorldIndex"
        :universe-preset="universeSettings"
        :adding-new-world="addingNewWorld"
        @add-world="addNewWorld()"
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
                v-else-if="universeSettings.world_settings.length > 0"
                v-model="universeSettings.world_settings[currentWorldIndex]"
              />
            </v-scroll-x-reverse-transition>
          </v-card>
        </v-slide-y-reverse-transition>
      </div>

      <div class="buttons">
        <v-tooltip v-for="(action, index) in availableActions" :key="index" :disabled="!action.hint" bottom>
          <template #activator="{ on }">
            <div v-on="on">
              <v-btn :disabled="action.disabled" color="accent" x-large @click="action.handler">
                <v-icon left>{{ action.icon }}</v-icon>
                {{ action.label }}
              </v-btn>
            </div>
          </template>
          <span class="text-pre">{{ action.hint }}</span>
        </v-tooltip>
      </div>
    </div>
  </throttled-spinner>
</template>

<script>
  import { mapState, mapGetters } from 'vuex'
  import cloneDeep from 'lodash.clonedeep'
  import { createFileAccessForLibrary } from '~/assets/seedgen/createFileAccess'
  import { isElectron } from '~/assets/lib/isElectron'

  const SeedgenWASM = import('@ori-rando/wotw-seedgen-wasm-ui')

  const createDefaultUniverseSettings = () => ({
    world_settings: [],
    disable_logic_filter: false,
    seed: null,
  })

  export default {
    name: 'WotwSeedgen',
    data: () => ({
      universeSettings: createDefaultUniverseSettings(),
      addingNewWorld: true,
      currentWorldIndex: 0,
    }),
    computed: {
      isElectron,
      ...mapState('seedgen', ['library']),
      ...mapGetters('user', ['isLoggedIn']),
      availableActions() {
        const actions = []

        /*

        what can we do after generating seeds?

        - Launch: If one world and Electron
        - Download: If one world and Web
        - Play Co-op: If one world and logged in
        - Play Multiworld: If 2+ worlds and logged in
        - Play Bingo: Any world count and logged in. Ask for board size, lockout, discovery and full clear/lines/cards

        anything else?

        */

        if (this.universeSettings.world_settings.length === 0) {
          return actions
        }

        if (this.universeSettings.world_settings.length === 1) {
          if (this.isElectron) {
            actions.push({
              label: 'Play Offline',
              icon: 'mdi-start',
              handler: () => {},
            })
          } else {
            actions.push({
              label: 'Download',
              icon: 'mdi-download',
              handler: () => {},
            })
          }

          actions.push({
            label: 'Play Co-op',
            icon: 'mdi-account-multiple-outline',
            hint: this.isLoggedIn
              ? 'Play online co-op with friends.\nAll items are shared.\nYou can optionally race other teams.'
              : 'You must be logged in to play online games.',
            disabled: !this.isLoggedIn,
            handler: () => {},
          })
        } else if (this.universeSettings.world_settings.length >= 2) {
          actions.push({
            label: 'Play Multiworld',
            icon: 'mdi-account-supervisor-circle-outline',
            hint: this.isLoggedIn
              ? 'Play online multiworld with friends.\nPlayers in the same world share everything and can find items for other worlds.\nYou can optionally race other teams by creating multiple universes.'
              : 'You must be logged in to play online games.',
            disabled: !this.isLoggedIn,
            handler: () => {},
          })
        }

        actions.push({
          label: 'Play Bingo',
          icon: 'mdi-checkerboard',
          hint: this.isLoggedIn
            ? 'Play online bingo alone or with friends.\nWhen playing with friends, players in the same universe work as one team while optionally racing players in other universes.'
            : 'You must be logged in to play online games.',
          disabled: !this.isLoggedIn,
          handler: () => {},
        })

        return actions
      },
    },
    watch: {
      currentWorldIndex(value, oldValue) {
        if (this.addingNewWorld && oldValue === this.universeSettings.world_settings.length) {
          this.addingNewWorld = false
        }
      },
    },
    mounted() {
      this.$store.dispatch('seedgen/fetchLibrary')
    },
    methods: {
      addNewWorld() {
        this.addingNewWorld = true
        this.currentWorldIndex = this.universeSettings.world_settings.length
      },
      async createNewWorldWithPresets(presets) {
        const seedgen = await SeedgenWASM

        const worldSettings = seedgen.WorldSettings.default()
        const fileAccess = await createFileAccessForLibrary(this.library)

        for (const presetName of presets) {
          const presetJson = JSON.stringify(this.library.worldPresets[presetName], null, 2)

          worldSettings.applyWorldPreset(seedgen.WorldPreset.fromJson(presetJson), fileAccess)
        }

        this.universeSettings.world_settings.push(JSON.parse(worldSettings.toJson()))
        this.currentWorldIndex = this.universeSettings.world_settings.length - 1
        this.addingNewWorld = false
      },
      createNewWorldFromExistingWorld(worldIndex) {
        const copiedWorld = cloneDeep(this.universeSettings.world_settings[worldIndex])
        this.universeSettings.world_settings.push(copiedWorld)
        this.currentWorldIndex = this.universeSettings.world_settings.length - 1
        this.addingNewWorld = false
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

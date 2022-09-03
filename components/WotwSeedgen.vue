<template>
  <throttled-spinner>
    <div v-if="library !== null">
      <wotw-seedgen-toolbar
        v-model="currentWorldIndex"
        :universe-preset="universeSettings"
        :adding-new-world="addingNewWorld"
        @add-world="addNewWorld()"
      />

      <v-card class="pa-5 seedgen">
        <wotw-seedgen-world-preset-setup
          v-if="addingNewWorld"
          class="preset-setup"
          @done="onWorldSetupDone"
        />
        <wotw-seedgen-world-settings
          v-else-if="universeSettings.world_settings.length > 0"
          v-model="universeSettings.world_settings[currentWorldIndex]"
        />
      </v-card>
    </div>
  </throttled-spinner>
</template>

<script>
  import { mapState } from 'vuex'
  import { createFileAccessForLibrary } from '~/assets/seedgen/createFileAccess'

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
      ...mapState('seedgen', ['library']),
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
      async onWorldSetupDone(presets) {
        const seedgen = await SeedgenWASM

        const worldSettings = seedgen.WorldSettings.default()
        const fileAccess = await createFileAccessForLibrary(this.library)

        for (const presetName of presets) {
          const presetJson = JSON.stringify(this.library.worldPresets[presetName], null, 2)

          worldSettings.applyWorldPreset(
            seedgen.WorldPreset.fromJson(presetJson),
            fileAccess,
          )
        }

        this.universeSettings.world_settings.push(
          JSON.parse(worldSettings.toJson()),
        )
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
</style>

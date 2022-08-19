<template>
  <throttled-spinner>
    <div v-if="library !== null">
      <wotw-seedgen-toolbar
        v-model="currentWorldIndex"
        :preset="gameSettings"
        :disabled="addingNewWorld"
        @add-world="addingNewWorld = true"
      />

      <v-card class="pa-5 seedgen">
        <wotw-seedgen-world-preset-setup
          v-if="addingNewWorld"
          class="preset-setup"
          @done="onWorldSetupDone"
        />
        <wotw-seedgen-world-settings
          v-else-if="gameSettings.world_settings.length > 0"
          v-model="gameSettings.world_settings[currentWorldIndex]"
        />
      </v-card>
    </div>
  </throttled-spinner>
</template>

<script>
  import { mapState } from 'vuex'
  import { createFileAccessForLibrary } from '~/assets/seedgen/createFileAccess'

  const SeedgenWASM = import('@ori-rando/wotw-seedgen-wasm-ui')

  const createDefaultGameSettings = () => ({
    world_settings: [],
    disable_logic_filter: false,
    seed: null,
  })

  export default {
    name: 'WotwSeedgen',
    data: () => ({
      gameSettings: createDefaultGameSettings(),
      addingNewWorld: true,
      currentWorldIndex: 0,
    }),
    computed: {
      ...mapState('seedgen', ['library']),
    },
    mounted() {
      this.$store.dispatch('seedgen/fetchLibrary')
    },
    methods: {
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

        this.gameSettings.world_settings.push(
          JSON.parse(worldSettings.toJson()),
        )
        this.currentWorldIndex = this.gameSettings.world_settings.length - 1
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

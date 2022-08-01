<template>
  <div>
    <wotw-seedgen-toolbar
      v-model="currentWorldIndex"
      :preset="preset"
      @add-world="addWorld()"
    />

    <v-card class='pa-5'>
      <wotw-seedgen-world-settings
        v-model="preset.world_settings[currentWorldIndex]"
      />
    </v-card>
  </div>
</template>

<script>
  const createDefaultWorldPreset = () => ({
    spawn: 'random',
    difficulty: 'moki',
    tricks: [],
    hard: false,
    headers: [],
    inline_headers: [],
    header_config: [],
  })

  const createDefaultPreset = () => ({
    world_settings: [createDefaultWorldPreset()],
    disable_logic_filter: false,
    seed: null,
  })

  export default {
    name: 'WotwSeedgen',
    data: () => ({
      preset: createDefaultPreset(),
      currentWorldIndex: 0,
    }),
    methods: {
      addWorld() {
        this.preset.world_settings.push(createDefaultWorldPreset())
        this.currentWorldIndex = this.preset.world_settings.length - 1
      },
    },
  }
</script>

<style lang="scss" scoped>

</style>

<template>
  <div>
    <wotw-seedgen-toolbar
      v-model="currentWorldIndex"
      :preset="gamePreset"
      @add-world="addWorld()"
    />

    <v-card class="pa-5">
      <wotw-seedgen-preset-setup />
      <wotw-seedgen-world-settings
        v-model="gamePreset.world_settings[currentWorldIndex]"
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

  const createDefaultGamePreset = () => ({
    world_settings: [createDefaultWorldPreset()],
    disable_logic_filter: false,
    seed: null,
  })

  export default {
    name: 'WotwSeedgen',
    data: () => ({
      gamePreset: createDefaultGamePreset(),
      showPresetSetup: true,
      currentWorldIndex: 0,
    }),
    methods: {
      addWorld() {
        this.gamePreset.world_settings.push(createDefaultWorldPreset())
        this.currentWorldIndex = this.gamePreset.world_settings.length - 1
      },
    },
  }
</script>

<style lang="scss" scoped></style>

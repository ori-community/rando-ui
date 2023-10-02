<template>
  <div>
    <v-window vertical :value="state">
      <v-window-item value="select_base_preset" active-class="active-window-item">
        <template v-if="universeSettings.worldSettings.length > 0">
          <h2 class="mb-3">Copy settings from an existing world</h2>

          <div class="mb-5">
            <v-btn
              v-for="(world, index) in universeSettings.worldSettings"
              :key="index"
              depressed
              color="background lighten-2"
              class="mr-2"
              @click="onCopyFromWorldClicked(index)"
            >
              <v-icon left>mdi-earth</v-icon>
              {{ index + 1 }}
            </v-btn>
          </div>
        </template>

        <div class="mb-5" v-if="singleWorldPresets?.length > 0 || (universeSettings.worldSettings.length === 0 && customPresets?.length > 0)">
          <h2 class="mb-3">Select a custom preset</h2>
          <wotw-seedgen-custom-preset-select
            class="mb-3"
            :custom-presets='customPresets'
            :display-multiworlds='universeSettings.worldSettings.length === 0'
            @delete='index => $emit("custom-preset-delete", index)' 
            @selected='index => $emit("custom-preset-selected", index)'
            />

        </div>

        <h2 class="mb-3">Select a base preset</h2>

        <v-card
          v-for="(preset, presetId) in basePresets"
          :key="presetId"
          elevation="0"
          class="mb-2 px-4 py-3 d-flex base-preset-card"
          @click="selectBasePreset(presetId)"
        >
          <div>
            <h3>{{ preset.info?.name }}</h3>
            {{ preset.info?.description }}
          </div>
          <v-spacer />
          <div class="d-flex align-center pl-3">
            <v-icon>mdi-chevron-right</v-icon>
          </div>
        </v-card>

        <div class="mt-5 text-right">
          or <a @click="$emit('create-new-world', [])">start from scratch</a>
        </div>
      </v-window-item>

      <v-window-item value="select_overlay_presets" active-class="active-window-item">
        <div class="d-flex align-center">
          <h2 class="mr-3">
            Good choice! Anything else?
          </h2>
          <v-spacer />
          <v-btn small text @click="state = 'select_base_preset'">
            <v-icon left>mdi-arrow-left</v-icon>
            Back
          </v-btn>
        </div>
        <div class="mb-4">
          Select any amount of additional configuration presets to apply in
          addition to the
          <b>{{
            library.worldPresets[selectedBasePresetId]?.info?.name ??
            selectedBasePresetId
          }}</b>
          preset.
        </div>

        <div class="overlay-presets-container">
          <wotw-seedgen-toggleable-button
            v-for="(preset, presetId) in nonBasePresets"
            :key="presetId"
            :value="selectedOverlayPresets.includes(presetId)"
            @input="(v) => setOverlayPresetSelected(presetId, v)"
          >
            {{ preset.info?.name ?? presetId }}
          </wotw-seedgen-toggleable-button>
        </div>

        <div class="mt-4 text-center">
          <v-btn depressed color="accent" large @click="onDoneClicked">
            <v-icon left>mdi-check</v-icon>
            Done
          </v-btn>
        </div>
      </v-window-item>
    </v-window>
  </div>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'WorldPresetSetup',
    props: {
      universeSettings: {
        type: Object,
        required: true,
      },
      customPresets: {
        type: Array,
        default: null,
      }
    },
    data: () => ({
      selectedBasePresetId: null,
      selectedOverlayPresets: [],
      state: 'select_base_preset',
    }),
    computed: {
      ...mapState('seedgen', ['library']),
      basePresets() {
        return Object.fromEntries(
          Object.entries(this.library.worldPresets).filter(
            ([, preset]) => preset.info?.group === 'Base',
          ),
        )
      },
      nonBasePresets() {
        return Object.fromEntries(
          Object.entries(this.library.worldPresets).filter(
            ([, preset]) => preset.info?.group !== 'Base',
          ),
        )
      },
      singleWorldPresets() {
        return this.customPresets?.filter((p) => p.multiverseSettings.universeSettings.worldSettings.length === 1)
      },
    },
    methods: {
      selectBasePreset(presetId) {
        this.selectedBasePresetId = presetId
        this.state = 'select_overlay_presets'
      },
      setOverlayPresetSelected(presetId, selected) {
        const alreadySelected = this.selectedOverlayPresets.includes(presetId)

        if (selected && !alreadySelected) {
          this.selectedOverlayPresets.push(presetId)
        } else if (!selected && alreadySelected) {
          this.selectedOverlayPresets.splice(
            this.selectedOverlayPresets.indexOf(presetId),
            1,
          )
        }
      },
      onDoneClicked() {
        this.$emit(
          'create-new-world',
          [this.selectedBasePresetId].concat(this.selectedOverlayPresets),
        )
      },
      onCopyFromWorldClicked(worldIndex) {
        this.$emit('copy-from-world', worldIndex)
      },
    },
  }
</script>

<style lang="scss" scoped>
  .base-preset-card {
    cursor: pointer;
    transition: background-color 150ms;
    background-color: var(--v-background-lighten2) !important;

    &:hover {
      background-color: var(--v-background-lighten3) !important;
    }
  }

  .overlay-presets-container {
    display: flex;
    gap: 0.3em;
  }

  :deep(.active-window-item) {
    z-index: 1;
    background-color: var(--v-background-lighten1);
  }
</style>

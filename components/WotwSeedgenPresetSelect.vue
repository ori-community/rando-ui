<template>
  <div>
    <h2 class='mb-3'>Select base preset</h2>
    <div class='difficulty-presets'>
      <v-card
        v-for='presetName in difficultyPresets'
        :key='presetName'
        elevation='0'
        ripple
        hover
        class='pa-4'
        :color='presetStates[presetName] ? "secondary" : "background lighten-2"'
        @click.native='setDifficultyPreset(presetName)'
      >
        <h2>{{ presetMeta[presetName].name }}</h2>
        <span>{{ presetMeta[presetName].description }}</span>
      </v-card>
    </div>

    <h3 class='mt-8 mb-3'>Additional options</h3>
    <div
      v-for='preset in sortedPresets'
      :key='preset.name'
      class='d-inline-block mr-1 mb-1'
    >
      <wotw-seedgen-preset-button
        v-model='presetStates[preset.name]'
        :preset='preset'
      />
    </div>
    <div class='text-center'>
      <v-expand-transition>
        <div v-show='anyPresetSelected || presetsApplied'>
          <div v-if='anyPresetSelected || !presetsApplied' class='mt-6'>
            <v-tooltip bottom :disabled='overrideSettings'>
              <template #activator='{on}'>
                <v-btn color='accent' depressed x-large v-on='on' @click='onApplyPresetsButtonClick'>
                  <v-icon left>{{ overrideSettings ? 'mdi-call-merge' : 'mdi-file-replace-outline' }}</v-icon>
                  {{ overrideSettings ? 'Override presets' : 'Apply Presets' }}
                </v-btn>
              </template>
              <span>Hold <kbd>Ctrl</kbd> to override existing settings</span>
            </v-tooltip>
          </div>
          <div v-else class='mt-6'>
            <v-btn x-large disabled>
              <v-icon left>mdi-check</v-icon>
              Presets applied
            </v-btn>
          </div>
        </div>
      </v-expand-transition>
    </div>
  </div>
</template>

<script>
  import presetMeta from '@/assets/seedgen/presets.yaml'

  const difficultyPresets = ['moki', 'gorlek']

  export default {
    name: 'WotwSeedgenPresetSelect',
    props: {
      presets: {
        type: Array,
        required: true,
      },
    },
    data: () => ({
      presetStates: {},
      overrideSettings: false,
      presetsApplied: false,
      presetMeta,
      difficultyPresets,
    }),
    computed: {
      anyPresetSelected() {
        return Object.values(this.presetStates).some(s => s)
      },
      sortedPresets() {
        const keys = Object
          .keys(presetMeta)
          .filter(p => !difficultyPresets.includes(p.toLowerCase()))
        return [...this.presets]
          .filter(p => keys.includes(p.name.toLowerCase()))
          .sort((a, b) => keys.indexOf(a.name) - keys.indexOf(b.name))
      },
    },
    watch: {
      presetStates: {
        deep: true,
        handler() {
          this.$emit('any-preset-selected', this.anyPresetSelected)
        },
      }
    },
    created() {
      this.resetPresetStates()
    },
    mounted() {
      window.addEventListener('keydown', this.onKeyDown)
      window.addEventListener('keyup', this.onKeyUp)
      window.addEventListener('blur', this.onWindowBlur)
      window.addEventListener('mousemove', this.onMouseMove)
      window.addEventListener('mouseout', this.onMouseLeave)
    },
    beforeDestroy() {
      window.removeEventListener('keydown', this.onKeyDown)
      window.removeEventListener('keyup', this.onKeyUp)
      window.removeEventListener('blur', this.onWindowBlur)
      window.removeEventListener('mousemove', this.onMouseMove)
      window.removeEventListener('mouseout', this.onMouseLeave)
    },
    methods: {
      resetPresetStates() {
        const presetStates = {}
        for (const preset of this.presets) {
          presetStates[preset.name] = false
        }
        this.presetStates = presetStates
      },
      onKeyDown(event) {
        if (event.key === 'Control') {
          this.overrideSettings = true
        }
      },
      onKeyUp(event) {
        if (event.key === 'Control') {
          this.overrideSettings = false
        }
      },
      onMouseMove(event) {
        this.overrideSettings = event.ctrlKey
      },
      onMouseLeave() {
        this.overrideSettings = false
      },
      onWindowBlur() {
        this.overrideSettings = false
      },
      onApplyPresetsButtonClick(event) {
        if (event.ctrlKey) {
          this.overrideSettings = true
        }

        const selectedPresets = []
        for (const preset of this.presets) {
          if (this.presetStates[preset.name]) {
            selectedPresets.push(preset)
          }
        }

        this.$emit('apply', { presets: selectedPresets, override: this.overrideSettings })
        this.resetPresetStates()
        this.presetsApplied = true
      },
      setDifficultyPreset(name) {
        for (const difficultyPreset of difficultyPresets) {
          this.presetStates[difficultyPreset] = difficultyPreset === name && !this.presetStates[difficultyPreset]
        }
      },
    },
  }
</script>

<style lang='scss' scoped>
  .difficulty-presets {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 0.4em;

    > * {
      cursor: pointer;
    }
  }
</style>

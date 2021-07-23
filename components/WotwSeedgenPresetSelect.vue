<template>
  <div>
    <div>
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
    </div>
    <div v-if='anyPresetSelected' class='mt-2'>
      <v-tooltip bottom :disabled='mergeSettings'>
        <template #activator='{on}'>
          <v-btn color='accent' depressed x-large v-on='on' @click='onApplyPresetsButtonClick'>
            <v-icon left>{{ mergeSettings ? 'mdi-call-merge' : 'mdi-file-replace-outline' }}</v-icon>
            {{ mergeSettings ? 'Merge presets' : 'Apply Presets' }}
          </v-btn>
        </template>
        <span>Hold <kbd>Ctrl</kbd> to merge settings</span>
      </v-tooltip>
    </div>
    <div v-else-if='settingsApplied' class='mt-2'>
      <v-btn x-large disabled>
        <v-icon left>mdi-check</v-icon>
        Settings applied
      </v-btn>
    </div>
  </div>
</template>

<script>
  import presetMeta from '@/assets/seedgen/presets.yaml'

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
      mergeSettings: false,
      settingsApplied: false,
    }),
    computed: {
      anyPresetSelected() {
        return Object.values(this.presetStates).some(s => s)
      },
      sortedPresets() {
        const keys = Object.keys(presetMeta)
        return [...this.presets].sort((a, b) => keys.indexOf(a.name) - keys.indexOf(b.name))
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
          this.mergeSettings = true
        }
      },
      onKeyUp(event) {
        if (event.key === 'Control') {
          this.mergeSettings = false
        }
      },
      onMouseMove(event) {
        this.mergeSettings = event.ctrlKey
      },
      onMouseLeave() {
        this.mergeSettings = false
      },
      onWindowBlur() {
        this.mergeSettings = false
      },
      onApplyPresetsButtonClick(event) {
        if (event.ctrlKey) {
          this.mergeSettings = true
        }

        const selectedPresets = []
        for (const preset of this.presets) {
          if (this.presetStates[preset.name]) {
            selectedPresets.push(preset)
          }
        }

        this.$emit('apply', { presets: selectedPresets, merge: this.mergeSettings })
        this.resetPresetStates()
        this.settingsApplied = true
      },
    },
  }
</script>

<style scoped>

</style>

<template>
  <div>
    <div>
      <wotw-seedgen-preset-button
        v-for='preset in presets'
        :key='preset.name'
        v-model='presetStates[preset.name]'
        :preset='preset'
        class='mr-1 mb-1'
      />
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
      }
    },
    created() {
      this.resetPresetStates()
    },
    mounted() {
      window.addEventListener('keydown', this.onKeyDown)
      window.addEventListener('keyup', this.onKeyUp)
    },
    beforeDestroy() {
      window.removeEventListener('keydown', this.onKeyDown)
      window.removeEventListener('keyup', this.onKeyUp)
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
      onApplyPresetsButtonClick() {
        const selectedPresets = []
        for (const preset of this.presets) {
          if (this.presetStates[preset.name]) {
            selectedPresets.push(preset)
          }
        }

        this.$emit('apply', {presets: selectedPresets, merge: this.mergeSettings})
        this.resetPresetStates()
        this.settingsApplied = true
      }
    },
  }
</script>

<style scoped>

</style>

<template>
  <div>
    <v-col>
      <v-row
        v-if="singleWorldPresets?.length > 0"
        :class="{'mb-3': multiWorldPresets?.length > 0 && displayMultiworlds}"
      >
        <div>
          <v-label>Single Worlds</v-label>
          <div class="mt-1 custom-presets-group">
            <wotw-seedgen-custom-preset-button
              v-for="customPreset in singleWorldPresets"
              :key="customPreset.name"
              :custom-preset="customPreset"
              @selected="$emit('selected', customPresets.indexOf(customPreset))"
              @contextmenu.native.prevent="openContextMenu($event, customPresets.indexOf(customPreset))"
            >
              <template v-if="customPreset.name === CUSTOM_PRESET_LAST_CONFIG_NAME" #prepend>
                <v-icon left>mdi-restore</v-icon>
              </template>
            </wotw-seedgen-custom-preset-button>
          </div>
        </div>
      </v-row>
      <v-row v-if="multiWorldPresets?.length > 0 && displayMultiworlds">
        <div>
          <v-label>Multiworlds</v-label>
          <div class="mt-1 custom-presets-group">
            <wotw-seedgen-custom-preset-button
              v-for="customPreset in multiWorldPresets"
              :key="customPreset.name"
              :custom-preset="customPreset"
              @selected="$emit('selected', customPresets.indexOf(customPreset))"
              @contextmenu.native.prevent="openContextMenu($event, customPresets.indexOf(customPreset))"
            >
              <template v-if="customPreset.name === CUSTOM_PRESET_LAST_CONFIG_NAME" #prepend>
                <v-icon left>mdi-restore</v-icon>
              </template>
            </wotw-seedgen-custom-preset-button>
          </div>
        </div>
      </v-row>
    </v-col>
    <v-menu v-model="contextMenuOpen" :position-x="contextMenuX" :position-y="contextMenuY" absolute offset-y>
      <v-list>
        <v-list-item @click="$emit('delete', contextMenuCustomPresetIndex)">
          <v-icon left>mdi-delete-outline</v-icon>
          Delete
        </v-list-item>
        <v-list-item @click="copyToClipboard(contextMenuCustomPresetIndex)">
          <v-icon left>mdi-content-copy</v-icon>
          Copy to Clipboard
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
  import { EventBus } from '~/assets/lib/EventBus'
  import { CUSTOM_PRESET_LAST_CONFIG_NAME } from '~/components/WotwSeedgen.vue'

  export default {
    name: 'PresetSelect',
    props: {
      customPresets: {
        type: Array,
        required: true,
      },
      displayMultiworlds: {
        type: Boolean,
        default: true,
      },
    },
    data: () => ({
      CUSTOM_PRESET_LAST_CONFIG_NAME,
      contextMenuCustomPresetIndex: null,
      contextMenuOpen: false,
      contextMenuX: 0,
      contextMenuY: 0,
    }),
    computed: {
      multiWorldPresets() {
        return this.customPresets?.filter((p) => p.multiverseSettings.universeSettings.worldSettings.length > 1)
      },
      singleWorldPresets() {
        return this.customPresets?.filter((p) => p.multiverseSettings.universeSettings.worldSettings.length === 1)
      },
    },
    methods: {
      openContextMenu(event, customPresetIndex) {
        this.contextMenuCustomPresetIndex = customPresetIndex
        this.contextMenuOpen = false
        this.contextMenuX = event.clientX
        this.contextMenuY = event.clientY
        this.$nextTick(() => {
          this.contextMenuOpen = true
        })
      },
      async copyToClipboard(customPresetIndex) {
        await window.navigator.clipboard.writeText(JSON.stringify(this.customPresets[customPresetIndex], null, 2))
        EventBus.$emit('notification', {
          message: `Copied to clipboard`,
          color: 'success darken-3',
          timeout: 1000,
        })
      },
    },
  }
</script>

<style lang="scss" scoped>
  .custom-presets-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4em;
  }
</style>

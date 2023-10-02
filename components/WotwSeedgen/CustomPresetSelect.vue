<template>
  <div>
    <v-col>
      <v-row :class="multiWorldPresets?.length > 0 && displayMultiworlds ? 'mb-3' : ''" v-if="singleWorldPresets?.length > 0">
        <div>
          <v-label>Single Worlds</v-label>
            <div class="mt-1 custom-presets-group">
              <wotw-seedgen-custom-preset-button 
                v-for='customPreset in singleWorldPresets' 
                :key='customPreset.name' 
                :custom-preset='customPreset' 
                @selected='$emit("selected", customPresets.indexOf(customPreset))'
                @contextmenu='openContextMenu($event, customPresets.indexOf(customPreset))'  />
            </div>
        </div>
      </v-row>
      <v-row v-if="multiWorldPresets?.length > 0 && displayMultiworlds">
        <div>
          <v-label>Multiworlds</v-label>
            <div class="mt-1 custom-presets-group">
              <wotw-seedgen-custom-preset-button 
                v-for='customPreset in multiWorldPresets' 
                :key='customPreset.name' 
                :custom-preset='customPreset' 
                @selected='$emit("selected", customPresets.indexOf(customPreset))'
                @contextmenu='openContextMenu($event, customPresets.indexOf(customPreset))' />
            </div>
        </div>
      </v-row>
    </v-col>
    <v-menu v-model="contextMenuOpen" :position-x="contextMenuX" :position-y="contextMenuY" absolute offset-y>
      <v-list>
        <v-list-item @click='$emit("delete", contextMenuCustomPresetIndex)'>
          <v-icon left>mdi-delete-outline</v-icon>
          Delete
        </v-list-item>
        <v-list-item @click='copyToClipboard(contextMenuCustomPresetIndex)'>
          <v-icon left>mdi-clipboard-arrow-up-outline</v-icon>
          Copy to clipboard
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
  import { EventBus } from '~/assets/lib/EventBus'

  export default {
    name: 'PresetSelect',
    props: {
      customPresets: {
        type: Array,
        required: true,
      },
      displayMultiworlds: {
        type: Boolean,
        default: true
      },
    },
    data: () => ({
      contextMenuCustomPresetIndex: null,  
      contextMenuOpen: false,
      contextMenuX: 0,
      contextMenuY: 0,
    }),
    computed:{
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
        event.preventDefault()
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
          color: 'success',
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

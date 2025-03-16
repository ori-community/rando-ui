<template>
  <div class="d-flex align-center">
    <v-tabs v-if="displayedWorldCount >= 2" v-model="model" background-color="transparent">
      <v-tab
        v-for="(worldPreset, index) in universePreset.worldSettings"
        :key="index"
        :disabled="disabled"
        @contextmenu="(event) => openWorldContextMenu(event, index)"
      >
        <v-icon left>mdi-earth</v-icon>
        {{ index + 1 }}
      </v-tab>

      <v-tab v-if="addingNewWorld" key="new-world" :disabled="disabled">
        <v-icon left>mdi-earth</v-icon>
        new
      </v-tab>

      <div v-if="!addingNewWorld" class="d-flex align-center pl-3">
        <v-btn :disabled="disabled" icon @click="$emit('add-world')">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
    </v-tabs>
    <v-btn
      v-else
      class="my-1"
      :disabled="disabled || universePreset.worldSettings.length === 0"
      text
      @click="$emit('add-world')"
    >
      <v-icon left>mdi-plus</v-icon>
      Multiworld
    </v-btn>

    <v-spacer />

    <!-- custom presets -->
    <v-menu offset-y left close-on-content-click>
      <template #activator="{ on, attrs }">
        <v-btn text v-bind="attrs" class="ml-2" v-on="on">Custom Presets</v-btn>
      </template>
      <v-list>
        <v-list-item :disabled="loadCustomPresetDisabled" @click="$emit('load-custom-preset')"> Load </v-list-item>
        <v-list-item :disabled="!(universePreset.worldSettings.length > 0)" @click="$emit('save-as-custom-preset')">
          Save
        </v-list-item>
        <v-list-item @click="$emit('import-custom-preset')"> Import </v-list-item>
      </v-list>
    </v-menu>

    <v-menu v-model="worldMenuOpen" :position-x="worldMenuX" :position-y="worldMenuY" absolute offset-y>
      <v-list>
        <v-list-item :disabled="disabled" @click="$emit('copy-world', worldMenuWorldIndex)">
          <v-icon left>mdi-content-duplicate</v-icon>
          Duplicate
        </v-list-item>
        <v-list-item :disabled="disabled" @click="$emit('delete-world', worldMenuWorldIndex)">
          <v-icon left>mdi-delete-outline</v-icon>
          Delete
        </v-list-item>
        <v-list-item :disabled="disabled" @click="$emit('save-world-as-custom-preset', worldMenuWorldIndex)">
          <v-icon left>mdi-content-save-outline</v-icon>
          Save as Custom Preset
        </v-list-item>
      </v-list>
    </v-menu>

    <v-tooltip bottom open-delay="300">
      <template #activator="{ on }">
        <v-btn
          icon
          v-on="on"
          :disabled="!(universePreset.worldSettings.length > 0)"
          @click="$emit('copy-current-settings-to-clipboard')"
          ><v-icon>mdi-content-copy</v-icon></v-btn
        >
      </template>
      <span>Copy current Settings to Clipboard</span>
    </v-tooltip>

    <v-tooltip bottom open-delay="300">
      <template #activator="{ on }">
        <v-btn icon v-on="on" @click="$emit('past-settings')"><v-icon>mdi-clipboard-outline</v-icon></v-btn>
      </template>
      <span>Paste Settings</span>
    </v-tooltip>

    <v-tooltip bottom open-delay="300">
      <template #activator="{ on }">
        <v-btn
          icon
          @click="$emit('start-over')"
          class="ml-2"
          :disabled="disabled || universePreset.worldSettings.length === 0"
          v-on="on"
        >
          <v-icon>mdi-restart</v-icon>
        </v-btn>
      </template>
      <span>Start over</span>
    </v-tooltip>
  </div>
</template>

<script>
  import { hasModelObject } from '~/assets/lib/hasModelObject'

  export default {
    name: 'WotwSeedgenToolbar',
    mixins: [hasModelObject],
    props: {
      universePreset: {
        type: Object,
        required: true,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      addingNewWorld: {
        type: Boolean,
        default: false,
      },
      loadCustomPresetDisabled: {
        type: Boolean,
        default: true,
      },
    },
    data: () => ({
      worldMenuWorldIndex: null,
      worldMenuOpen: false,
      worldMenuX: 0,
      worldMenuY: 0,
    }),
    computed: {
      displayedWorldCount() {
        return this.universePreset.worldSettings.length + (this.addingNewWorld ? 1 : 0)
      },
    },
    methods: {
      openWorldContextMenu(event, worldMenuWorldIndex) {
        this.worldMenuWorldIndex = worldMenuWorldIndex
        event.preventDefault()
        this.worldMenuOpen = false
        this.worldMenuX = event.clientX
        this.worldMenuY = event.clientY
        this.$nextTick(() => {
          this.worldMenuOpen = true
        })
      },
    },
  }
</script>

<style lang="scss" scoped></style>

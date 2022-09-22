<template>
  <div class="d-flex align-center">
    <v-tabs
      v-if="displayedWorldCount >= 2"
      v-model='model'
      background-color="transparent"
    >
      <v-tab
        v-for="(worldPreset, index) in universePreset.world_settings"
        :key="index"
        :disabled="disabled"
      >
        <v-icon left>mdi-earth</v-icon>
        {{ index + 1 }}
      </v-tab>

      <v-tab
        v-if="addingNewWorld"
        key="new-world"
        :disabled="disabled"
      >
        <v-icon left>mdi-earth</v-icon>
        new
      </v-tab>

      <div v-if="!addingNewWorld" class='d-flex align-center pl-3'>
        <v-btn :disabled="disabled" icon @click="$emit('add-world')">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
    </v-tabs>
    <v-btn v-else class='my-1' :disabled="disabled" text @click="$emit('add-world')">
      <v-icon left>mdi-plus</v-icon>
      Multiworld
    </v-btn>

    <v-spacer/>

    <v-menu offset-y left close-on-content-click :disabled="disabled">
      <template #activator="{ on, attrs }">
        <v-btn icon v-bind="attrs" class='ml-2' :disabled="disabled" v-on="on">
          <v-icon>mdi-dots-vertical</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item x-large depressed text :disabled="disabled">
          <v-icon left>mdi-restore</v-icon>
          Start over
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
  import {hasModelObject} from '~/assets/lib/hasModelObject'

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
    },
    computed: {
      displayedWorldCount() {
        return this.universePreset.world_settings.length + (this.addingNewWorld ? 1 : 0)
      }
    }
  }
</script>

<style lang="scss" scoped></style>

<template>
  <div class="d-flex align-center">
    <v-tabs
      v-if="preset.world_settings.length >= 2"
      background-color="transparent"
      :value="value"
      @input="(value) => $emit('input', value)"
    >
      <v-tab
        v-for="(worldPreset, index) in preset.world_settings"
        :key="index"
        :disabled="disabled"
      >
        <v-icon left>mdi-earth</v-icon>
        {{ index + 1 }}
      </v-tab>

      <div class='d-flex align-center pl-3'>
        <v-btn :disabled="disabled" icon @click="$emit('add-world')">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
    </v-tabs>
    <v-btn v-else class='my-1' :disabled="disabled" text @click="$emit('add-world')">
      <v-icon left>mdi-plus</v-icon>
      Multiworld
    </v-btn>

    <v-spacer />

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
  export default {
    name: 'WotwSeedgenToolbar',
    props: {
      value: {
        type: Number,
        required: true,
      },
      preset: {
        type: Object,
        required: true,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
    },
  }
</script>

<style lang="scss" scoped></style>

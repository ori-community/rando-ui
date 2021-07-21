<template>
  <v-tooltip
    top
    :disabled='!presetDescription'
    open-delay='500'
  >
    <template #activator='{on}'>
      <v-btn
        depressed
        :color='value ? "secondary" : "background lighten-2"'
        class='text-none'
        v-on='on'
        @click='onButtonClick'
      >
        {{ presetName }}
      </v-btn>
    </template>
    <span>{{ presetDescription }}</span>
  </v-tooltip>
</template>

<script>
  import presetMeta from '@/assets/seedgen/presets.yaml'

  export default {
    name: 'WotwSeedgenPresetButton',
    props: {
      preset: {
        type: Object,
        required: true,
      },
      value: {
        type: Boolean,
        required: true,
      }
    },
    computed: {
      presetName() {
        return presetMeta[this.preset.name]?.name ?? this.preset.name
      },
      presetDescription() {
        return presetMeta[this.preset.name]?.description ?? null
      },
    },
    methods: {
      onButtonClick(event) {
        this.$emit("input", !this.value)
      },
    },
  }
</script>

<style scoped>

</style>

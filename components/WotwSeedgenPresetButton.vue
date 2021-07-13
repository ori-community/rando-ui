<template>
  <v-btn
    depressed
    :color='value ? "secondary" : "background lighten-2"'
    @click='onButtonClick'
  >
    {{ preset.name }}
  </v-btn>
</template>

<script>
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
    methods: {
      onButtonClick(event) {
        this.$emit("input", !this.value)
      },
    },
  }
</script>

<style scoped>

</style>

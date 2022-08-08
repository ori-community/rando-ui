<template>
  <div></div>
</template>

<script>
  export default {
    name: 'PresetSetup',
    data: () => ({
      availablePresets: [],
    }),
    async mounted() {
      this.availablePresets = await this.$axios.$get('/seedgen/world-presets')
    },
  }
</script>

<style scoped></style>

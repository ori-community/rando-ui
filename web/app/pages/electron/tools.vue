<template>
  <div class="fill-height d-flex flex-column">
    <v-tabs v-model="tab" height="28">
      <v-tab value="map">Paths</v-tab>
      <v-tab value="hierarchy">Hierarchy</v-tab>
      <v-tab value="uberstates">Uberstate Log</v-tab>
      <!--   TODO show TAS if dev (dev because feature unfinished)   -->
    </v-tabs>
    <wotw-tools-hierarchy v-if="tab === 'hierarchy'"/>
    <wotw-tools-uberstate-log v-else-if="tab === 'uberstates'"/>
    <wotw-tools-areas-map v-else-if="tab === 'map'"/>
  </div>
</template>

<script lang="ts" setup>

  definePageMeta({
    layout: 'plain'
  })

  useHead({title: "Tools"})

  const tab = ref("map")

</script>

<style lang="scss" scoped>

</style>

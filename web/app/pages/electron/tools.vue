<template>
  <div>

    <v-tabs v-model="tab" class="flex-shrink-1 flex-grow-0" height="28">
      <v-tab value="hierarchy">Hierarchy</v-tab>
      <v-tab value="uberstates">Uberstate Log</v-tab>
      <v-tab value="map">Paths</v-tab>
      <!--   TODO show TAS if dev (dev because feature unfinished)   -->
    </v-tabs>
    <v-divider/>

    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="hierarchy">
        <wotw-tools-hierarchy/>
      </v-tabs-window-item>
      <v-tabs-window-item value="uberstates">
        <wotw-tools-uberstate-log/>
      </v-tabs-window-item>
      <v-tabs-window-item value="map">
        <wotw-tools-areas-map/>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>

</template>

<script lang="ts" setup>

  definePageMeta({
    layout: 'plain'
  })

  useHead({title: "Tools"})

  const tab = ref(1)

</script>

<style lang="scss" scoped>

</style>

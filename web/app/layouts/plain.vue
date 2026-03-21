<template>
  <v-app dark>
    <v-main class='main'>
      <nuxt-page/>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>

</script>

<style lang="scss">
  .v-application {
    // Mainly used for transparent item trackers.
    // The "plain" layout is only used by Electron windows anyway
    // and these set their background color.
    background: none !important;
  }
</style>

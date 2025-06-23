<template>
  <v-app>
    <div id="backdrop" class="backdrop"/>
    <v-container class="toolbar">
      <rando-page-toolbar/>
    </v-container>

    <v-main class="content">
      <nuxt-page/>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>

</script>

<style lang="scss" scoped>
  .backdrop {
    z-index: 0;
  }

  .toolbar,
  .content {
    z-index: 1;
  }

</style>

<template>
  <v-app>
    <div id="backdrop" class="backdrop"/>

    <wotw-launcher-helper-dialogs/>

    <!--    TODO always show toolbar / keep visible on scroll -->
    <v-container class="toolbar">
      <rando-page-toolbar/>
    </v-container>

    <v-main class="content">
      <nuxt-page/>
    </v-main>

    <footer v-if="!hideFooter">
      <img src='@shared/images/footer.png' alt="">
    </footer>

  </v-app>
</template>

<script lang="ts" setup>
  withDefaults(defineProps<{
    hideFooter?: boolean,
  }>(), {
    hideFooter: false,
  })
</script>

<style lang="scss" scoped>
  .backdrop {
    z-index: 0;
  }

  .toolbar,
  .content {
    z-index: 1;
  }

  .content {
    min-height: 100vh;
  }

  footer {
    margin-top: -20vw;
    position: relative;
    pointer-events: none;

    img {
      width: 100vw;
      opacity: 0.5;
    }
  }

</style>

<template>
  <v-app dark>
    <v-main class='main'>
      <v-container>
        <wotw-page-toolbar />
      </v-container>

      <Nuxt />
    </v-main>

    <footer>
      <img src='../assets/images/footer.png'>
    </footer>
  </v-app>
</template>

<script>
  export default {
    mounted() {
      this.$store.dispatch('user/updateUser')
    }
  }
</script>

<style lang='scss'>
  // Global styles

  @import "@fontsource/nunito-sans/index.css";

  ::-webkit-scrollbar {
    width: 12px;
  }

  ::-webkit-scrollbar-track {
    background-color: var(--v-background-base);
  }

  ::-webkit-scrollbar-thumb {
    background-color: var(--v-background-lighten1);
  }

  .inherit--text {
    color: inherit !important;
  }

  .list-move {
    transition: 400ms;
    z-index: 1;
  }
</style>

<style lang='scss' scoped>
  .main {
    z-index: 1;
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

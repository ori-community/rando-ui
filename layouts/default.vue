<template>
  <v-app dark>
    <v-main class='main'>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>

    <footer>
      <img src='../assets/images/footer.png'>
    </footer>
  </v-app>
</template>

<script>
  export default {
    data() {
      return {
        clipped: false,
        drawer: false,
        fixed: false,
        items: [
          {
            icon: 'mdi-apps',
            title: 'Welcome',
            to: '/',
          },
          {
            icon: 'mdi-chart-bubble',
            title: 'Inspire',
            to: '/inspire',
          },
        ],
        miniVariant: false,
        right: true,
        rightDrawer: false,
        title: 'Vuetify.js',
      }
    },
  }
</script>

<style lang='scss'>
  // Global styles

  @import "@fontsource/nunito-sans/index.css";

  ::-webkit-scrollbar {
    width: 12px;
  }

  ::-webkit-scrollbar-track {
    background-color: var(--color-background);
  }

  ::-webkit-scrollbar-thumb {
    background-color: var(--color-background-light);
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

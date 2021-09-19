<template>
  <v-app dark>
    <v-main class='main'>
      <v-container v-if='!shouldHideToolbar'>
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
  import { mapState } from 'vuex'
  import { isElectron } from '~/assets/lib/isElectron'

  export default {
    computed: {
      ...mapState(['user/user']),
      shouldHideToolbar() {
        return !!this.$route.query.hideToolbar && !!this.user
      }
    },
    beforeMount() {
      if (isElectron()) {
        window.electronApi.on('main.openSeed', (event, seedFile) => {
          this.$router.push({ name: 'electron', query: { seedFile } })
        })

        window.electronApi.on('main.openUrl', async (event, url) => {
          url = new URL(url)

          if (url.protocol === 'ori-rando:') {
            switch (url.pathname) {
              case '//authenticate/':
                await this.$router.push({ name: 'auth-callback', query: { jwt: url.searchParams.get('jwt') } })
                break
              case '//seedgen/':
                await this.$router.push({ name: 'seedgen', query: { result: url.searchParams.get('result') } })
                break
              default:
                console.warn('Could not handle URL', url)
            }
          }
        })
      }
    },
    mounted() {
      this.$store.dispatch('user/updateUser')
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

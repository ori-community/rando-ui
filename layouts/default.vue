<template>
  <v-app dark>
    <v-main class='main'>
      <v-container v-if='!shouldHideToolbar'>
        <wotw-page-toolbar />
      </v-container>

      <v-snackbar
        v-model='showError'
        timeout='7000'
        top
        centered
        max-width='100%'
        :multi-line='errorMessage.includes("\n")'
        color='error'
      >
        <span class='error-text'>{{ errorMessage }}</span>
      </v-snackbar>

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
  import { EventBus } from '~/assets/lib/EventBus'

  export default {
    data: () => ({
      showError: false,
      errorMessage: '',
    }),
    computed: {
      ...mapState('user', ['user']),
      isElectron,
      shouldHideToolbar() {
        return !!this.$route.query.hideToolbar && !!this.user && isElectron()
      }
    },
    async beforeMount() {
      EventBus.$on('error', error => {
        this.errorMessage = String(error)
        this.showError = true
      })

      if (isElectron()) {
        window.electronApi.on('main.error', (event, e) => {
          EventBus.$emit('error', e)
        })

        window.electronApi.on('main.settingsChanged', (event, settings) => {
          this.$store.commit('electron/setSettings', settings)
        })

        window.electronApi.on('main.currentSeedChanged', (event, {currentSeedInfo}) => {
          if (currentSeedInfo) {
            if (!currentSeedInfo.webConn) {
              this.$store.commit('nav/setLastMultiverseId', { id: null, seedgenResult: null })
            }
          }
        })

        window.electronApi.on('main.openSeed', (event, seedFile) => {
          this.$router.push({ name: 'electron', query: { seedFile } })
        })

        window.electronApi.on('main.crashDetected', (event, crashZipName) => {
          this.$router.push({ name: 'electron', query: { crashZipName } })
        })

        window.electronApi.on('main.goToSettings', () => {
          this.$router.push({ name: 'electron-settings' })
        })

        window.electronApi.on('main.openUrl', async (event, url) => {
          url = new URL(url)

          if (url.protocol === 'ori-rando:') {
            const topPath = url.pathname.match(/\/\/(?<topPath>[^/]*)\//)?.groups.topPath
            switch (topPath) {
              case 'authenticate':
                await this.$router.push({ name: 'auth-callback', query: { jwt: url.searchParams.get('jwt') } })
                break
              case 'seedgen':
                await this.$router.push({ name: 'seedgen', query: { result: url.searchParams.get('result') } })
                break
              case 'game':
                const gameId = url.pathname.match(/.*\/(?<gameId>\d*)$/)?.groups.gameId
                if (gameId) {
                  await this.$router.push({ name: 'seedgen', query: { result: url.searchParams.get('result') } })
                } else {
                  console.warn('Could not read game ID from URL', url)
                }
                break
              default:
                console.warn('Could not handle URL', url)
            }
          }
        })

        this.$store.commit('electron/setSettings', await window.electronApi.invoke('settings.readSettings'))
      }
    },
    async mounted() {
      await this.$store.dispatch('user/updateUser')

      if (isElectron()) {
        const currentSeedInfo = window.electronApi.invoke('launcher.getCurrentSeedInfo')
        if (currentSeedInfo && currentSeedInfo.webConn) {
          this.$store.commit('nav/setLastMultiverseId', {
            id: this.user?.currentMultiverseId ?? null,
            seedgenResult: null,
          })
        }
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

  .error-text {
    white-space: pre-wrap;
  }
</style>

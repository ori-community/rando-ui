<template>
  <v-app dark>
    <v-main class='main'>
      <div class="full-height d-flex flex-column">
        <v-container v-if='!shouldHideToolbar'>
          <wotw-page-toolbar />
        </v-container>

        <v-snackbars :objects.sync='notifications'>
          <template #default='{message}'>
            <span class='notification-text'>{{ message }}</span>
          </template>
        </v-snackbars>

        <Nuxt />
      </div>
    </v-main>

    <global-dialogs />

    <footer v-if="!hideFooter">
      <img src='@/assets/images/footer.png'>
    </footer>
  </v-app>
</template>

<script>
  import VSnackbars from 'v-snackbars'
  import { mapState } from 'vuex'
  import { isElectron } from '~/assets/lib/isElectron'
  import { EventBus } from '~/assets/lib/EventBus'

  export default {
    name: 'LayoutDefault',
    components: {
      VSnackbars,
    },
    props: {
      hideFooter: {
        type: Boolean,
        default: false,
      }
    },
    data: () => ({
      notifications: [],
    }),
    computed: {
      ...mapState('user', ['user']),
      ...mapState('electron', ['settings', 'settingsLoaded']),
      isElectron,
      shouldHideToolbar() {
        return !!this.$route.query.hideToolbar && !!this.user && isElectron()
      },
    },
    async beforeMount() {
      EventBus.$on('notification', ({ message, color = 'accent', timeout = 10000 }) => {
        this.notifications.push({
          message,
          color,
          timeout,
          multiLine: message.includes('\n'),
          top: true,
          centered: true,
        })
      })

      if (isElectron()) {
        const registerInteractiveHandlers = this.$route.query.registerInteractiveHandlers !== 'false'

        if (registerInteractiveHandlers) {
          window.electronApi.on('main.error', (_event, e) => {
            EventBus.$emit('notification', {
              message: String(e),
              color: 'error',
            })
          })

          window.electronApi.on('main.openSeed', (_event, seedFile) => {
            this.$store.dispatch('electron/launch', {
              seedFile,
            })
          })

          window.electronApi.on('main.crashDetected', (_event, supportBundleName) => {
            this.$store.commit('electron/setCurrentSupportBundleName', supportBundleName)
            window.electronApi.invoke('launcher.focusMainWindow')
          })

          window.electronApi.on('main.goToSettings', () => {
            this.$router.push({ name: 'electron-settings' })
            window.electronApi.invoke('launcher.focusMainWindow')
          })

          window.electronApi.on('game.gameFinished', () => {
            if (this.settingsLoaded && this.settings['Flags.ShowStatsAfterFinish']) {
              this.$router.push({ name: 'electron-stats' })
              window.electronApi.invoke('launcher.focusMainWindow')
            }
          })

          window.electronApi.on('main.openUrl', async (_event, url) => {
            url = new URL(url)

            if (url.protocol === 'ori-rando:') {
              window.electronApi.invoke('launcher.focusMainWindow')
              const topPath = url.pathname.match(/\/\/(?<topPath>[^/]*)\//)?.groups.topPath
              switch (topPath) {
                case 'authenticate':
                  await this.$router.push({ name: 'auth-callback', query: { jwt: url.searchParams.get('jwt') } })
                  break
                case 'seedgen':
                  await this.$router.push({ name: 'seedgen', query: { seedGroupId: url.searchParams.get('seedGroupId') } })
                  break
                case 'game': {
                  const gameId = url.pathname.match(/.*\/(?<gameId>\d*)$/)?.groups.gameId
                  if (gameId) {
                    await this.$router.push({ name: 'game-multiverseId', params: { multiverseId: gameId } })
                  } else {
                    console.warn('Could not read game ID from URL', url)
                  }
                  break
                }
                default:
                  console.warn('Could not handle URL', url)
              }
            }
          })
        }

        window.electronApi.on('main.settingsChanged', (_event, settings) => {
          this.$store.commit('electron/setSettings', settings)
        })

        window.electronApi.on('main.currentSeedChanged', (_event, { currentSeedPath }) => {
          this.$store.commit('electron/setCurrentSeedPath', currentSeedPath)
        })

        window.electronApi.on('localTracker.setIsRunning', (_event, isRunning) => {
          this.$store.commit('electron/setLocalTrackerRunning', isRunning)
        })

        window.electronApi.on('randoIpc.setConnected', (_event, connected) => {
          this.$store.commit('electron/setRandoIpcConnected', connected)
        })

        window.electronApi.invoke('ready')

        this.$store.commit('electron/setSettings', await window.electronApi.invoke('settings.getSettings'))
        this.$store.commit('electron/setLocalTrackerRunning', await window.electronApi.invoke('localTracker.isTrackerRunning'))
        this.$store.commit('electron/setRandoIpcConnected', await window.electronApi.invoke('randoIpc.isConnected'))
      }
    },
    async mounted() {
      await this.$store.dispatch('user/updateUser')

      if (isElectron()) {
        await this.$store.dispatch('electron/checkForUpdatesOnce')
        await this.$store.dispatch('auth/restoreJwtWhenHostChanged')
      }
    },
  }
</script>

<style lang='scss'>
  // Global styles

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
  .full-height {
    height: 100%;
  }

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

  .notification-text {
    white-space: pre-wrap;
  }
</style>

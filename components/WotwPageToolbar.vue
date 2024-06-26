<template>
  <div class="page-toolbar d-flex align-center my-4">
    <v-scale-transition group tag="div" class="flex-gap align-center">
      <v-btn key="home" depressed exact text :to="`${isElectron ? `/electron` : `/`}`" x-large>
        <v-icon>mdi-home-outline</v-icon>
      </v-btn>
      <v-btn key="seedgen" x-large depressed text to="/seedgen">
        <v-icon class="main-button-icon">mdi-dice-multiple</v-icon>
        <v-icon class="main-button-icon-left" left>mdi-dice-multiple</v-icon>
        <span class="main-button-text"> Seed Generator </span>
      </v-btn>
      <v-btn key="league" x-large depressed text to="/league/seasons">
        <v-badge :value="pendingGamesCount > 0" class="d-flex" :content="pendingGamesCount" color="deep-purple">
          <v-icon class="main-button-icon">mdi-trophy</v-icon>
          <v-icon class="main-button-icon-left" left>mdi-trophy</v-icon>
          <span class="main-button-text">
            League
          </span>
        </v-badge>
      </v-btn>
      <v-btn v-if="isLoggedIn" key="my-games" exact x-large depressed text :to="{ name: 'my-games' }">
        <v-icon class="main-button-icon">mdi-gamepad-variant-outline</v-icon>
        <v-icon class="main-button-icon-left" left>mdi-gamepad-variant-outline</v-icon>
        <span class="main-button-text"> My Games </span>
      </v-btn>
      <template v-if="isElectron">
        <v-btn v-if="randoIpcConnected" key="stats" x-large depressed text @click="showStats">
          <v-icon left>mdi-chart-box-outline</v-icon>
          Stats
        </v-btn>
        <v-btn key="settings" x-large depressed text to="/electron/settings">
          <v-icon left>mdi-cog-outline</v-icon>
          Settings
        </v-btn>
        <v-menu key="electron-menu" offset-y>
          <template #activator="{ on, attrs }">
            <v-btn icon v-bind="attrs" v-on="on">
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item :disabled="!localTrackerRunning" x-large depressed text @click="openLocalTrackerWindow">
              <v-icon left :disabled="!localTrackerRunning">mdi-radar</v-icon>
              Tracker
            </v-list-item>
            <v-list-item
              :disabled="!localTrackerRunning"
              x-large
              depressed
              text
              @click="
                remoteTrackerSettings.remote = isLoggedIn
                showRemoteTrackerDialog = true
              "
            >
              <v-icon left :disabled="!localTrackerRunning"> mdi-leak </v-icon>
              Create Web Tracker
            </v-list-item>
            <!--
            <v-list-item x-large depressed disabled text @click="openChatControl">
              <v-icon left>mdi-message-flash-outline</v-icon>
              Chat Control
            </v-list-item>
            -->
            <v-list-item
              v-if="settingsLoaded && settings['Flags.Dev']"
              exact
              x-large
              depressed
              text
              @click="openRandoDevtools"
            >
              <v-icon left>mdi-application-braces-outline</v-icon>
              Rando Devtools
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-scale-transition>
    <v-spacer />
    <throttled-spinner no-margin>
      <div v-if="userLoaded" class="d-flex align-center">
        <template v-if="isLoggedIn">
          <div class="mr-4 user-info">
            <div class="text-no-wrap">{{ randomGreeting }}, {{ user.name }}!</div>
          </div>
          <v-menu offset-y left nudge-bottom="6">
            <template #activator="{ on }">
              <v-btn x-large class="ma-0 mr-1" icon v-on="on">
                <discord-avatar :user="user" size="48" />
              </v-btn>
            </template>
            <v-list v-if="isLoggedIn">
              <v-list-item @click="openChangeNicknameDialog">
                <v-icon left>mdi-account-edit-outline</v-icon>
                Change Nickname
              </v-list-item>
              <v-list-item v-if="isDeveloper" @click="toggleDevtools">
                <v-icon left>mdi-code-braces</v-icon>
                {{ devtoolsEnabled ? 'Disable' : 'Enable' }} Server Devtools
              </v-list-item>
              <v-list-item @click="logout">
                <v-icon left>mdi-logout-variant</v-icon>
                Log out
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
        <template v-else>
          <v-btn x-large depressed text @click="login">
            <v-icon left>mdi-login-variant</v-icon>
            Log in
          </v-btn>
        </template>
      </div>
    </throttled-spinner>

    <v-dialog v-model="changeNicknameDialogIsOpen" :persistent="nicknameDialogLoading" max-width="500">
      <v-card>
        <v-card-title>Change Nickname</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="currentNickname"
            autofocus
            label="Nickname"
            counter="32"
            @keydown.enter="saveNickname"
          />

          <div class="d-flex">
            <v-spacer />
            <v-btn class="mr-1" text :disabled="nicknameDialogLoading" @click="changeNicknameDialogIsOpen = false">
              Cancel
            </v-btn>
            <v-btn
              depressed
              color="accent"
              :disabled="!nicknameIsValid"
              :loading="nicknameDialogLoading"
              @click="saveNickname"
            >
              Save
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showRemoteTrackerDialog" max-width="500px">
      <v-card>
        <v-card-title>Create Web Tracker</v-card-title>
        <v-card-text>
          <div class="mb-6">
            <v-tooltip bottom open-delay="300" :disabled="isLoggedIn">
              <template #activator="{ on }">
                <div v-on="on">
                  <v-checkbox
                    :disabled="!isLoggedIn"
                    v-model="remoteTrackerSettings.remote"
                    label="For Remote Access"
                    messages="Create tracker to share with others. Not needed if streaming it yourself."
                  />
                </div>
              </template>
              <span>Log in to create remote tracker</span>
            </v-tooltip>
            <v-checkbox v-model="remoteTrackerSettings.timer" label="Show Timer" messages="Show the run timer." />
            <v-checkbox
              v-model="remoteTrackerSettings.willowHearts"
              label="Show Willow Hearts"
              messages="Shows the amount of destroyed willow hearts."
            />
            <v-checkbox
              :disabled="!remoteTrackerSettings.willowHearts"
              v-model="remoteTrackerSettings.hideHeartsUntilFirstHeart"
              label="Hide counter until first heart is destroyed"
              messages="Only shows the amount of willow hearts when at least one heart is destroyed."
            />
          </div>
          <div class="d-flex justify-end">
            <v-btn color="accent" depressed :loading="remoteTrackerUrlCopying" @click="exposeTracker"
              >Create Link</v-btn
            >
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex'
  import { isElectron } from '~/assets/lib/isElectron'
  import { EventBus } from '~/assets/lib/EventBus'

  export default {
    name: 'WotwPageToolbar',
    data: () => ({
      changeNicknameDialogIsOpen: false,
      currentNickname: '',
      nicknameDialogLoading: false,
      remoteTrackerUrlCopying: false,
      remoteTrackerUrlCopied: false,
      showRemoteTrackerDialog: false,
      remoteTrackerSettings: {
        remote: true,
        timer: true,
        willowHearts: true,
        hideHeartsUntilFirstHeart: true,
      },
      updatedPendingLeagueGamesOnce: false,
    }),
    computed: {
      ...mapGetters('user', ['isLoggedIn', 'isDeveloper']),
      ...mapState('user', ['user', 'userLoaded']),
      ...mapGetters('league', ['pendingGamesCount']),
      ...mapState('dev', ['devtoolsEnabled']),
      ...mapState('electron', ['localTrackerRunning', 'settings', 'settingsLoaded', 'randoIpcConnected']),
      isElectron,
      nicknameIsValid() {
        const trimmedNickname = this.currentNickname.trim()
        return trimmedNickname.length > 0 && trimmedNickname.length <= 32
      },
      currentMultiverseId() {
        return this.user?.currentMultiverseId ?? null
      },
      randomGreeting() {
        const greetings = ['Hi', 'Hello', 'Hey', 'Hiya', 'Yo', 'Ahoy', 'Howdy', 'oriHi']
        return greetings[Math.floor(Math.random() * greetings.length)]
      },
    },
    watch: {
      isLoggedIn: {
        immediate: true,
        async handler(value) {
          if (value) {
            if (!this.updatedPendingLeagueGamesOnce) {
              this.updatedPendingLeagueGamesOnce = true
              await this.$store.dispatch('league/updatePendingGames')
            }
          } else {
            this.updatedPendingLeagueGamesOnce = false
          }
        },
      },
    },
    methods: {
      buildAbsoluteUrl(relativeUrl) {
        return `${window.location.origin}${relativeUrl}`
      },
      async login(event) {
        this.$store.commit('auth/setRedirectPath', this.$route.fullPath)

        if (isElectron()) {
          try {
            const jwt = await window.electronApi.invoke(
              'auth.startOAuthFlow',
              this.$axios.defaults.baseURL,
              event.ctrlKey,
            )
            await this.$router.push({ name: 'auth-callback', query: { jwt } })
          } catch (e) {
            console.error(e)
            EventBus.$emit('notification', {
              message: 'Login failed.',
              color: 'error',
            })
          }
        } else {
          window.location.href = `${this.$axios.defaults.baseURL}/login?redirect=${this.buildAbsoluteUrl(
            '/auth/callback',
          )}`
        }
      },
      async logout() {
        await this.$store.dispatch('auth/setJwt', null)
        this.$store.commit('user/setUser', null)
      },
      openChangeNicknameDialog() {
        this.currentNickname = this.user.name
        this.changeNicknameDialogIsOpen = true
      },
      async saveNickname() {
        if (!this.nicknameIsValid) {
          return
        }

        this.nicknameDialogLoading = true

        const user = await this.$axios.$put('/users/me/nickname', this.currentNickname, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        })
        this.$store.commit('user/setUser', user)

        this.nicknameDialogLoading = false
        this.changeNicknameDialogIsOpen = false
      },
      async exposeTracker() {
        this.remoteTrackerUrlCopying = true

        const args = {}

        // remote
        if (this.remoteTrackerSettings.remote) {
          const remoteId = await window.electronApi.invoke('localTracker.expose', {
            baseUrl: this.$paths.WS_BASE_URL,
            jwt: this.$store.state.auth.jwt,
          })
          args.source = remoteId
        }

        // timer
        if (this.remoteTrackerSettings.timer) {
          args.timer = 'true'
        }

        // willow hearts
        if (this.remoteTrackerSettings.willowHearts) {
          args.hearts = 'true'

          // hide willow hearts until first is destroyed
          if (this.remoteTrackerSettings.hideHeartsUntilFirstHeart) {
            args.hideHeartsUntilFirst = 'true'
          }
        }

        const targetRoute = this.$router.resolve({
          name: 'tracker',
          query: args,
        })

        const url = new URL(targetRoute.href.replace('#/', ''), this.$paths.UI_BASE_URL)

        await window.navigator.clipboard.writeText(url.toString())
        this.remoteTrackerUrlCopying = false
        this.showRemoteTrackerDialog = false

        EventBus.$emit('notification', {
          message: `Copied to clipboard`,
          color: 'success darken-3',
          timeout: 1000,
        })
      },
      openLocalTrackerWindow() {
        window.electronApi.invoke('localTracker.openWindow')
      },
      openChatControl() {
        window.electronApi.invoke('chatControl.openWindow')
      },
      toggleDevtools() {
        this.$store.commit('dev/setDevtoolsEnabled', !this.devtoolsEnabled)
      },
      openRandoDevtools() {
        window.electronApi.invoke('devtools.open')
      },
      showStats() {
        this.$store.commit('electron/setShowStatsDialog', true)
      },
    },
  }
</script>

<style lang="scss" scoped>
  .user-info {
    line-height: 1.2;
    text-align: right;
  }

  .page-toolbar {
    gap: 0.2em;
  }

  .flex-gap {
    display: flex;
    gap: 0.2em;
  }

  .main-button-icon {
    display: none;
  }
  .main-button-icon-left {
    display: inherit;
  }

  @media (max-width: 1100px) {
    .main-button-text {
      display: none;
    }
    .main-button-icon {
      display: inherit;
    }
    .main-button-icon-left {
      display: none;
    }
  }
</style>

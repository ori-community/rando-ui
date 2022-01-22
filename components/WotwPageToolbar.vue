<template>
  <div class='page-toolbar d-flex align-center my-4'>
    <v-scale-transition group tag='div' class='flex-gap'>
      <v-btn v-if='isElectron' key='home' depressed exact text to='/electron' x-large>
        <v-icon>mdi-home-outline</v-icon>
      </v-btn>
      <v-btn v-if='isElectron && currentMultiverseId !== null' key='game' exact x-large depressed text :to='{name: "game-multiverseId", params: {multiverseId: currentMultiverseId}}'>
        <v-icon left>mdi-gamepad-variant-outline</v-icon>
        {{ currentMultiverseId }}
      </v-btn>
      <v-btn key='seedgen' x-large depressed text to='/seedgen'>
        <v-icon left>mdi-dice-multiple</v-icon>
        Seed Generator
      </v-btn>
      <v-btn v-if='isElectron' key='stats' x-large depressed text to='/electron/stats'>
        <v-icon left>mdi-chart-box-outline</v-icon>
        Stats
      </v-btn>
      <v-btn v-if='isElectron' key='settings' exact x-large depressed text to='/electron/settings'>
        <v-icon left>mdi-application-cog-outline</v-icon>
        Settings
      </v-btn>
    </v-scale-transition>
    <v-spacer />
    <throttled-spinner>
      <div v-if='userLoaded' class='d-flex align-center'>
        <template v-if='isLoggedIn'>
          <div class='mr-4'>
            Hi, {{ user.name }}!
          </div>
          <v-menu offset-y left nudge-bottom='6'>
            <template #activator='{on}'>
              <v-btn x-large class='ma-0 mr-1' icon v-on='on'>
                <discord-avatar :user='user' size='48' />
              </v-btn>
            </template>
            <v-list v-if='isLoggedIn'>
              <v-list-item @click='openChangeNicknameDialog'>
                <v-icon left>mdi-account-edit-outline</v-icon>
                Change Nickname
              </v-list-item>
              <v-list-item @click='logout'>
                <v-icon left>mdi-logout-variant</v-icon>
                Log out
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
        <template v-else>
          <v-btn x-large depressed text @click='login'>
            <v-icon left>mdi-login-variant</v-icon>
            Log in
          </v-btn>
        </template>
      </div>
    </throttled-spinner>

    <v-dialog v-model='changeNicknameDialogIsOpen' :persistent='nicknameDialogLoading' max-width='500'>
      <v-card>
        <v-card-title>Change Nickname</v-card-title>
        <v-card-text>
          <v-text-field v-model='currentNickname' autofocus label='Nickname' counter='32' @keydown.enter='saveNickname' />

          <div class='d-flex'>
            <v-spacer />
            <v-btn class='mr-1' text :disabled='nicknameDialogLoading' @click='changeNicknameDialogIsOpen = false'>
              Cancel
            </v-btn>
            <v-btn
              depressed
              color='accent'
              :disabled='!nicknameIsValid'
              :loading='nicknameDialogLoading'
              @click='saveNickname'
            >
              Save
            </v-btn>
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
    }),
    computed: {
      ...mapGetters('user', ['isLoggedIn']),
      ...mapState('user', ['user', 'userLoaded']),
      isElectron,
      nicknameIsValid() {
        const trimmedNickname = this.currentNickname.trim()
        return trimmedNickname.length > 0 && trimmedNickname.length <= 32
      },
      currentMultiverseId() {
        return this.user?.currentMultiverseId ?? null
      }
    },
    methods: {
      buildAbsoluteUrl(relativeUrl) {
        return `${window.location.origin}${relativeUrl}`
      },
      async login(event) {
        if (isElectron()) {
          try {
            const jwt = await window.electronApi.invoke('auth.startOAuthFlow', this.$axios.defaults.baseURL, event.ctrlKey)
            await this.$router.push({ name: 'auth-callback', query: { jwt } })
          } catch (e) {
            console.error(e)
            EventBus.$emit('notification', {
              message: 'Login failed.',
              color: 'error',
            })
          }
        } else {
          window.location.href = `${this.$axios.defaults.baseURL}/login?redir=${this.buildAbsoluteUrl('/auth/callback')}`
        }
      },
      logout() {
        if (isElectron()) {
          window.electronApi.invoke('auth.deleteClientJwt')
        }

        this.$store.commit('auth/setJwt', null)
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
            'Content-Type': 'text/plain; charset=utf-8'
          }
        })
        this.$store.commit('user/setUser', user)

        this.nicknameDialogLoading = false
        this.changeNicknameDialogIsOpen = false
      },
    },
  }
</script>

<style lang='scss' scoped>
  .page-toolbar {
    gap: 0.2em
  }

  .flex-gap {
    display: flex;
    gap: 0.2em;
  }
</style>

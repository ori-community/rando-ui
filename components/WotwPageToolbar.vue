<template>
  <div class='page-toolbar d-flex align-center my-4'>
    <v-btn v-if='isElectron' exact x-large depressed text to='/electron'>
      <v-icon left>mdi-home-outline</v-icon>
      Home
    </v-btn>
    <v-btn x-large depressed text to='/seedgen'>
      <v-icon left>mdi-dice-multiple</v-icon>
      Seed generator
    </v-btn>
    <v-btn v-if='isElectron' exact x-large depressed text to='/electron/settings'>
      <v-icon left>mdi-application-cog-outline</v-icon>
      Settings
    </v-btn>
    <v-spacer />
    <template v-if='isLoggedIn'>
      <div class='mr-4'>
        Hi, {{ user.name }}!
      </div>
      <v-menu offset-y>
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

    <v-dialog v-model='changeNicknameDialogIsOpen' :persistent='nicknameDialogLoading' max-width='500'>
      <v-card>
        <v-card-title>Change Nickname</v-card-title>
        <v-card-text>
          <v-text-field v-model='currentNickname' autofocus label='Nickname' @keydown.enter='saveNickname' />

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

  export default {
    name: 'WotwPageToolbar',
    data: () => ({
      changeNicknameDialogIsOpen: false,
      currentNickname: '',
      nicknameDialogLoading: false,
    }),
    computed: {
      ...mapGetters('user', ['isLoggedIn']),
      ...mapState('user', ['user']),
      isElectron,
      nicknameIsValid() {
        return this.currentNickname.trim().length > 0
      },
    },
    methods: {
      buildAbsoluteUrl(relativeUrl) {
        return `${window.location.origin}${relativeUrl}`
      },
      async login() {
        this.$store.commit('auth/setRedirectPath', this.$router.resolve(this.$route).href)

        if (isElectron()) {
          const jwt = await window.electronApi.invoke('auth.startOAuthFlow', this.$axios.defaults.baseURL)
          await this.$router.push({ name: 'auth-callback', query: { jwt } })
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
</style>

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
</template>

<script>
  import { mapGetters, mapState } from 'vuex'
  import { isElectron } from '~/assets/lib/isElectron'

  export default {
    name: 'WotwPageToolbar',
    computed: {
      ...mapGetters('user', ['isLoggedIn']),
      ...mapState('user', ['user']),
      isElectron,
    },
    methods: {
      buildAbsoluteUrl(relativeUrl) {
        return `${window.location.origin}${relativeUrl}`
      },
      login() {
        this.$store.commit('auth/setRedirectPath', this.$router.resolve(this.$route).href)
        window.location.href = `${this.$axios.defaults.baseURL}/login?redir=${this.buildAbsoluteUrl('/auth/callback')}`
      },
      logout() {
        this.$store.commit('auth/setJwt', null)
        this.$store.commit('user/setUser', null)
      },
    },
  }
</script>

<style lang='scss' scoped>
  .page-toolbar {
    gap: 0.2em
  }
</style>

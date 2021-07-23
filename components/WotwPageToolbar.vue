<template>
  <div class='d-flex align-center my-4'>
    <template v-if='isLoggedIn'>
      <v-menu offset-y>
        <template #activator='{on}'>
          <v-btn depressed text v-on='on'>
            <v-icon left>mdi-plus</v-icon>
            New Game
          </v-btn>
        </template>
        <v-list disabled>
          <v-list-item>Menu under construction™</v-list-item>
          <v-list-item>Bingo</v-list-item>
          <v-list-item>Discovery Bingo</v-list-item>
          <v-list-item>Lockout Bingo</v-list-item>
          <v-list-item>Co-op</v-list-item>
          <v-list-item>Multiworld</v-list-item>
        </v-list>
      </v-menu>
    </template>
    <v-spacer />
    <template v-if='isLoggedIn'>
      <div class='mr-4'>
        Hi, {{ user.name }}!
      </div>
      <v-menu offset-y>
        <template #activator='{on}'>
          <v-btn x-large class='ma-0 mr-1' icon v-on='on'>
            <v-avatar color='accent'>
              <v-img v-if='discordAvatarUrl !== null' :src='discordAvatarUrl' />
              <v-icon v-else>mdi-account</v-icon>
            </v-avatar>
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

  export default {
    name: 'WotwPageToolbar',
    computed: {
      ...mapGetters('user', ['isLoggedIn']),
      ...mapState('user', ['user']),
      discordAvatarUrl() {
        if (!this.isLoggedIn || !this.user.avatarId) {
          return null
        }

        return `https://cdn.discordapp.com/avatars/${this.user.id}/${this.user.avatarId}.png`
      },
    },
    methods: {
      login() {
        window.location.href = `${this.$axios.defaults.baseURL}/login?redir=${window.location.pathname}`
      },
      logout() {
        window.location.href = `${this.$axios.defaults.baseURL}/logout?redir=${window.location.pathname}`
      },
    },
  }
</script>

<style scoped>

</style>

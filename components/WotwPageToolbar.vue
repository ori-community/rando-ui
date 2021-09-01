<template>
  <div class='page-toolbar d-flex align-center my-4'>
    <v-btn x-large depressed text to='/seedgen'>
      <v-icon left>mdi-dice-multiple</v-icon>
      Seed generator
    </v-btn>
    <v-btn x-large depressed text to='/settings'>
      <v-icon left>mdi-cog</v-icon>
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
    },
    methods: {
      login() {
        window.location.href = `${this.$axios.defaults.baseURL}/login?redir=${window.location.pathname}`
      },
      logout() {
        window.location.href = `${this.$axios.defaults.baseURL}/logout/?redir=${window.location.pathname}`
      },
    },
  }
</script>

<style lang='scss' scoped>
  .page-toolbar {
    gap: 0.2em
  }
</style>

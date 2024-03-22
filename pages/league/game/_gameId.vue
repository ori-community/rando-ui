<template>
  <v-container>
    <throttled-spinner>
      <div v-if="leagueGame !== null">
        <h1>Game {{ leagueGame.gameNumber }}</h1>

        <v-btn :loading="actionLoading">Play</v-btn>

        <pre>{{ leagueGame }}</pre>
      </div>
    </throttled-spinner>
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex'

  export default {
    data: () => ({
      leagueGame: null,
      actionLoading: false,
    }),
    computed: {
      ...mapState('user', ['user']),
      ...mapGetters('user', ['isLoggedIn']),
      canSubmit() {
        return this.leagueGame !== null &&
          this.leagueGame.permissions?.canSubmit
      }
    },
    watch: {
      '$route.params.gameId': {
        immediate: true,
        handler() {
          this.loadGame()
        }
      }
    },
    methods: {
      async loadGame() {
        try {
          this.leagueGame = await this.$axios.$get(`/league/games/${this.$route.params.gameId}`)
        } catch (e) {
          console.error(e)
        }
      },
    }
  }
</script>

<style lang="scss" scoped>

</style>

<template>
  <v-container>
    <throttled-spinner>
      <div v-if="leagueSeason !== null">
        <h1>{{ leagueSeason.name }}</h1>

        <template v-if="isLoggedIn">
          <v-btn :loading="actionLoading" :disabled="!canJoin" @click="joinSeason">Join</v-btn>
          <v-btn
            :loading="actionLoading"
            :disabled="!isJoined || leagueSeason.currentGameId === null"
            :to="{name: 'league-game-gameId', params: {gameId: leagueSeason.currentGameId}}"
          >
            Go to current game
          </v-btn>
        </template>

        <pre>{{ leagueSeason }}</pre>
      </div>
    </throttled-spinner>
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex'

  export default {
    data: () => ({
      leagueSeason: null,
      actionLoading: false,
    }),
    computed: {
      ...mapState('user', ['user']),
      ...mapGetters('user', ['isLoggedIn']),
      isJoined() {
        return this.leagueSeason.memberships.some(m => m.user.id === this.user.id)
      },
      canJoin() {
        return this.leagueSeason !== null &&
          this.leagueSeason.canJoin &&
          this.isLoggedIn &&
          !this.isJoined
      }
    },
    watch: {
      '$route.params.seasonId': {
        immediate: true,
        handler() {
          this.loadSeason()
        }
      }
    },
    methods: {
      async loadSeason() {
        try {
          this.leagueSeason = await this.$axios.$get(`/league/seasons/${this.$route.params.seasonId}`)
        } catch (e) {
          console.error(e)
        }
      },
      async joinSeason() {
        this.actionLoading = true

        try {
          this.leagueSeason = await this.$axios.$post(`/league/seasons/${this.$route.params.seasonId}/membership`)
        } catch (e) {
          console.error(e)
        }

        this.actionLoading = false
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>

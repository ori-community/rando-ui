<template>
  <div>
    <h1 class='text-center mt-12 mb-6'>Game <small>#</small>{{ gameId }}</h1>

    <throttled-spinner>
      <div v-if='isLoggedIn && teams !== null'>
        <div class='teams'>
          <wotw-team-view v-for='team in teams' :key='team.id' :disabled='loading' :team='team' @join='join(team)' />
        </div>

        <div class='text-center mt-4'>
          <v-btn large text :disabled='loading' @click='createTeam'>
            <v-icon left>mdi-plus</v-icon>
            New team
          </v-btn>
        </div>
      </div>
    </throttled-spinner>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'GamePage',
    data: () => ({
      teams: null,
      loading: false,
    }),
    computed: {
      ...mapGetters('user', ['isLoggedIn']),
      gameId() {
        return this.$route.params.gameId
      },
    },
    mounted() {
      this.fetchGame()
    },
    methods: {
      async fetchGame() {
        this.teams = (await this.$axios.$get(`/games/${this.gameId}/teams`)).teams
      },
      async join(team) {
        try {
          await this.$axios.post(`/games/${this.gameId}/teams/${team.id}`)
        } catch (e) {
          console.error(e)
        }

        await this.fetchGame()
      },
      async createTeam() {
        try {
          await this.$axios.post(`/games/${this.gameId}/teams`)
        } catch (e) {
          console.error(e)
        }

        await this.fetchGame()
      },
    },
  }
</script>

<style lang='scss' scoped>
  .teams {
    display: flex;
    gap: 2em;
    justify-content: center;
  }
</style>

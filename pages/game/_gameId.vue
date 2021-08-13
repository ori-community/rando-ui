<template>
  <div>
    <h1 class='text-center mt-12 mb-6'>Game <small>#</small>{{ gameId }}</h1>

    <throttled-spinner>
      <div v-if='isLoggedIn && gameReady'>
        <div class='teams'>
          <wotw-team-view
            v-for='team in games[gameId].teams'
            :key='team.id'
            :color='teamColors[team.id]'
            :disabled='loading'
            :team='team'
            @join='join(team)'
          />
        </div>

        <div class='text-center mt-4'>
          <v-btn large text :disabled='loading' @click='createTeam'>
            <v-icon left>mdi-plus</v-icon>
            New team
          </v-btn>
        </div>

        <template v-if='!!games[gameId].bingoBoard'>
          <h2 class='text-center mb-3 mt-8'>Bingo board</h2>

          <div class='text-center mb-1'>
            <v-btn text @click='centerBoard'>
              <template v-if='showBoard'>
                <v-icon left>mdi-image-filter-center-focus-strong-outline</v-icon>
                Center on screen
              </template>
              <template v-else>
                <v-icon left>mdi-eye-outline</v-icon>
                Show board
              </template>
            </v-btn>
          </div>

          <div ref='boardContainer' class='board-container'>
            <wotw-bingo-board
              v-if='showBoard'
              :game='games[gameId]'
              :team-colors='teamColors'
            />
          </div>
        </template>
      </div>
      <div v-if='!isLoggedIn && userLoaded' class='text-center'>
        <v-alert class='d-inline-block' color='error darken-3'>
          You need to be logged in to view this game.
        </v-alert>
      </div>
    </throttled-spinner>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex'
  import { colors } from 'vuetify/lib'

  export default {
    name: 'GamePage',
    data: () => ({
      loading: false,
      gameReady: false,
      showBoard: false,
    }),
    computed: {
      ...mapGetters('user', ['isLoggedIn']),
      ...mapState('user', ['user', 'userLoaded']),
      ...mapState('gameState', ['games']),
      gameId() {
        return this.$route.params.gameId
      },
      game() {
        return this.games[this.gameId]
      },
      teamColors() {
        if (!this.game) {
          return {}
        }

        const teamIds = this.game.teams.map(t => t.id).sort()
        const teamColors = {}
        const colorPool = [
          colors.orange.darken2,
          colors.red.darken2,
          colors.pink.darken3,
          colors.green.darken2,
          colors.blue.darken3,
        ]

        for (const teamId of teamIds) {
          teamColors[teamId] = colorPool.pop()
        }

        return teamColors
      }
    },
    watch: {
      isLoggedIn: {
        immediate: true,
        async handler(isLoggedIn) {
          if (isLoggedIn) {
            await this.$store.dispatch('gameState/fetchGame', this.gameId)
            await this.$store.dispatch('gameState/connectGame', {
              userId: this.user?.id,
              gameId: this.gameId,
            })
            this.gameReady = true
          }
        },
      }
    },
    methods: {
      async join(team) {
        await this.$axios.post(`/games/${this.gameId}/teams/${team.id}`)
      },
      async createTeam() {
        await this.$axios.post(`/games/${this.gameId}/teams`)
      },
      centerBoard() {
        this.$refs.boardContainer.scrollIntoView({
          behavior: this.showBoard ? 'smooth' : 'auto',
          block: 'start'
        })
        this.showBoard = true
      }
    },
  }
</script>

<style lang='scss' scoped>
  .teams {
    display: flex;
    gap: 2em;
    justify-content: center;
    align-items: flex-start;
  }

  .board-container {
    display: flex;
    height: 100vh;
    width: 100%;
  }
</style>

<template>
  <div>
    <v-container>
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
              class='team-view'
              @join='join(team)'
            />
          </div>

          <div class='text-center mt-4'>
            <v-btn large text :disabled='loading' @click='createTeam'>
              <v-icon left>mdi-plus</v-icon>
              New team
            </v-btn>
          </div>
        </div>
        <div v-if='!isLoggedIn && userLoaded' class='text-center'>
          <v-alert class='d-inline-block' color='error darken-3'>
            You need to be logged in to view this game.
          </v-alert>
        </div>
      </throttled-spinner>
    </v-container>

    <template v-if='isLoggedIn && gameReady && !!games[gameId].bingoBoard'>
      <v-container>
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
          <v-btn text @click='boardSettingsOpen = true'>
            <v-icon left>mdi-cog-outline</v-icon>
            Settings
          </v-btn>
        </div>
      </v-container>

      <div ref='boardContainer' class='board-container px-1'>
        <template v-if='showBoard'>
          <wotw-bingo-board
            class='board'
            :game='games[gameId]'
            :team-colors='teamColors'
            :edge-labels='boardSettings.edgeLabels'
          />
          <div class='sidebar px-5'>
            <transition-group name='list' class='bingo-teams'>
              <div
                v-for='(bingoTeam, index) in sortedBingoTeams'
                :key='bingoTeam.teamId'
                class='relative'
                :style='{zIndex: sortedBingoTeams.length - index}'
              >
                <wotw-bingo-team-view
                  :color='teamColors[bingoTeam.teamId]'
                  :team='games[gameId].teams.find(t => t.id === bingoTeam.teamId)'
                  :bingo-team='bingoTeam'
                />
              </div>
            </transition-group>
          </div>
        </template>
      </div>

      <v-dialog v-model='boardSettingsOpen' max-width='500'>
        <v-card class='pa-5 relative'>
          <h2>Bingo settings</h2>

          <v-btn
            class='close-button'
            color='background lighten-5'
            icon
            @click='boardSettingsOpen = false'
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>

          <v-checkbox
            v-model='boardSettings.edgeLabels'
            label='Edge Labels'
            hint='Show coordinates around the board'
            persistent-hint
          />
        </v-card>
      </v-dialog>
    </template>
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
      boardSettingsOpen: false,
      boardSettings: {
        edgeLabels: false,
      },
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
      sortedBingoTeams() {
        if (!this.game) {
          return []
        }

        return [...this.game.bingoTeams].sort((a, b) => {
          return b.squares - a.squares
        })
      },
      teamColors() {
        if (!this.game) {
          return {}
        }

        const teamIds = this.game.teams.map(t => t.id).sort()
        const teamColors = {}
        const colorPool = [
          colors.brown.darken1,
          colors.indigo.darken2,
          colors.teal.darken2,
          colors.orange.darken2,
          colors.red.darken2,
          colors.pink.darken3,
          colors.green.darken2,
          colors.blue.darken3,
        ]

        for (const teamId of teamIds) {
          teamColors[teamId] = colorPool.pop() ?? 'transparent'
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
      },
      boardSettings: {
        deep: true,
        handler(boardSettings) {
          window.localStorage.setItem('boardSettings', JSON.stringify(boardSettings))
        },
      }
    },
    mounted() {
      try {
        this.boardSettings = {
          ...this.boardSettings,
          ...JSON.parse(window.localStorage.getItem('boardSettings')),
        }
      } catch (e) {
        console.error('Could not load board settings', e)
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
    flex-wrap: wrap;

    .team-view {
      min-width: 15vw;
    }
  }

  .board-container {
    display: flex;
    min-height: 100vh;

    .board {
      flex-grow: 0;
      flex-shrink: 0;
      height: 100vh;
      width: 100vh;
    }

    .sidebar {
      flex-grow: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;

      .bingo-teams {
        display: flex;
        justify-content: stretch;
        gap: 0.3em;
        flex-direction: column;
      }
    }
  }

  .relative {
    .close-button {
      position: absolute;
      top: 1em;
      right: 1em;
      z-index: 10;
    }
  }
</style>

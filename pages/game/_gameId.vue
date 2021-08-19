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
            <v-tooltip bottom :disabled='canCreateTeam'>
              <span>
                Bingo games currently don't support more than 8 teams.
              </span>
              <template #activator='{on}'>
                <div class='d-inline-block' v-on='on'>
                  <v-btn large text :disabled='loading || !canCreateTeam' @click='createTeam'>
                    <v-icon left>mdi-plus</v-icon>
                    New team
                  </v-btn>
                </div>
              </template>
            </v-tooltip>
          </div>
        </div>
        <div v-if='!isLoggedIn && userLoaded' class='text-center'>
          <v-alert class='d-inline-block' color='error darken-3'>
            You need to be logged in to view this game.
            <template v-if='isOBS'>
              <br>
              <br>
              Log in by right clicking the Browser Source and click 'Interact'.
            </template>
          </v-alert>
        </div>
      </throttled-spinner>
    </v-container>

    <template v-if='isLoggedIn && gameReady && !!game.bingoBoard'>
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

      <div ref='boardContainer' class='board-container' :class='{"px-1": !boardSettings.obsMode}'>
        <template v-if='showBoard'>
          <wotw-bingo-board
            class='board'
            :game='games[gameId]'
            :team-colors='teamColors'
            :edge-labels='boardSettings.edgeLabels'
            :hidden-teams='hiddenTeams'
            :highlight-team='highlightedTeamId'
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
                  :team-hidden='hiddenTeams.includes(bingoTeam.teamId)'
                  :team='games[gameId].teams.find(t => t.id === bingoTeam.teamId)'
                  :bingo-team='bingoTeam'
                  @click.native.ctrl.capture.stop='toggleTeamVisibility(bingoTeam.teamId, true)'
                  @click='toggleTeamVisibility(bingoTeam.teamId)'
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

          <v-checkbox
            v-model='boardSettings.highlightOwnTeam'
            label='Highlight own team'
            hint='Reserve bottom left parts of bingo squares for your team. Greatly improves overview of your progress.'
            persistent-hint
          />

          <div class='mt-3'>
            To have Bingo Boards in OBS, just add this page as a Browser source
            and follow the instructions.
          </div>
        </v-card>
      </v-dialog>
    </template>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex'
  import { colors } from 'vuetify/lib'

  const isOBS = () => !!window?.obsstudio?.pluginVersion

  const obsModeStyle = `
  html {
    overflow: hidden; /* doesn't work sometimes for reasons */
  }

  .v-application {
    background-color: transparent !important;
  }
  `

  export default {
    name: 'GamePage',
    data: () => ({
      loading: false,
      gameReady: false,
      showBoard: false,
      hiddenTeams: [], // Array of team IDs
      boardSettingsOpen: false,
      boardSettings: {
        edgeLabels: false,
        highlightOwnTeam: true,
      },
    }),
    computed: {
      ...mapGetters('user', ['isLoggedIn']),
      ...mapState('user', ['user', 'userLoaded']),
      ...mapState('gameState', ['games']),
      isOBS() {
        return isOBS()
      },
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

        // Only return bingo teams for which we have a team
        const teams = this.game.teams
        return [
          ...this.game.bingoTeams.filter(b => teams.some(t => t.id === b.teamId)),
        ].sort((a, b) => {
          const rankDifference = b.rank - a.rank

          if (rankDifference === 0) {
            return a.teamId - b.teamId
          }

          return rankDifference
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
      },
      canCreateTeam() {
        return this.sortedBingoTeams.length < 8
      },
      ownTeam() {
        return this.game.teams.find(
          team => team.members.find(
            player => player.id === this.user?.id
          )
        )
      },
      ownTeamId() {
        return this.ownTeam?.id
      },
      highlightedTeamId() {
        if (!this.boardSettings.highlightOwnTeam) {
          return null
        }

        return this.ownTeamId
      },
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
      },
      'game.teams'() { // TODO: Temporary workaround for orirando/wotw-server#5
        if (this.game.bingoBoard) {
          this.$store.dispatch('gameState/fetchBingoBoard', this.gameId)
        }
      },
      gameReady: {
        immediate: true,
        handler(gameReady) {
          if (gameReady && this.game.bingoBoard) {
            this.$nextTick(() => {
              if (isOBS()) {
                const styleElement = document.createElement('style')
                styleElement.innerHTML = obsModeStyle
                styleElement.id = 'obs-mode-style'
                document.head.appendChild(styleElement)

                this.centerBoard()
              }
            })
          }
        }
      },
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
          block: 'start',
        })
        this.showBoard = true
      },
      toggleTeamVisibility(teamId, exclusive = false) {
        if (exclusive) {
          if (this.hiddenTeams.length === this.sortedBingoTeams.length - 1 && !this.hiddenTeams.includes(teamId)) {
            this.hiddenTeams = []
          } else {
            this.hiddenTeams = this.sortedBingoTeams.map(t => t.teamId).filter(t => t !== teamId)
          }
        } else if (this.hiddenTeams.includes(teamId)) {
          this.hiddenTeams = this.hiddenTeams.filter(t => t !== teamId)
        } else {
          this.hiddenTeams.push(teamId)
        }
      },
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

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
              :can-join='!isSpectating'
              :color='teamColors[team.id]'
              :disabled='loading'
              :team='team'
              class='team-view'
              @join='join(team)'
            />
          </div>

          <div v-if='!isSpectating' class='text-center mt-4'>
            <v-tooltip :disabled='canCreateTeam' bottom>
              <span>
                Bingo games currently don't support more than 8 teams.
              </span>
              <template #activator='{on}'>
                <div class='d-inline-block' v-on='on'>
                  <v-btn :disabled='loading || !canCreateTeam' large text @click='createTeam'>
                    <v-icon left>mdi-plus</v-icon>
                    New team
                  </v-btn>
                </div>
              </template>
            </v-tooltip>
          </div>
          <div v-else class='text-center mt-4'>
            <v-alert class='d-inline-block' color='info darken'>
              <v-icon left>mdi-monitor-eye</v-icon>
              You are spectating this game.
            </v-alert>
          </div>
        </div>
        <div v-if='!isLoggedIn && userLoaded' class='text-center'>
          <v-alert class='d-inline-block' color='error darken-3'>
            <template v-if='isOBS'>
              <b>DO NOT</b> add this page to OBS directly. Please use the "Embed" feature above the board.
            </template>
            <template v-else>
              You need to be logged in to view this game.
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
          <v-btn
            :disabled='embedUrlCopied'
            :loading='embedUrlLoading'
            text
            @click='createEmbedUrl'
          >
            <template v-if='embedUrlCopied'>
              <v-icon left>mdi-check</v-icon>
              URL Copied
            </template>
            <template v-else>
              <v-icon left>mdi-semantic-web</v-icon>
              Embed (OBS)
            </template>
          </v-btn>
          <v-btn text @click='spectateDialogOpen = true'>
            <v-icon left>mdi-monitor-eye</v-icon>
            Spectate
          </v-btn>
        </div>
      </v-container>

      <div ref='boardContainer' :class='{"px-1": !boardSettings.obsMode}' class='board-container'>
        <template v-if='showBoard'>
          <wotw-bingo-board
            :edge-labels='boardSettings.edgeLabels'
            :game='games[gameId]'
            :hidden-teams='hiddenTeams'
            :highlight-team='highlightedTeamId'
            :team-colors='teamColors'
            class='board'
          />
          <div class='sidebar px-5'>
            <transition-group class='bingo-teams' name='list'>
              <div
                v-for='(bingoTeam, index) in sortedBingoTeams'
                :key='bingoTeam.teamId'
                :style='{zIndex: sortedBingoTeams.length - index}'
                class='relative'
              >
                <wotw-bingo-team-view
                  :bingo-team='bingoTeam'
                  :color='teamColors[bingoTeam.teamId]'
                  :team='games[gameId].teams.find(t => t.id === bingoTeam.teamId)'
                  :team-hidden='hiddenTeams.includes(bingoTeam.teamId)'
                  @click='toggleTeamVisibility(bingoTeam.teamId)'
                  @click.native.ctrl.capture.stop='toggleTeamVisibility(bingoTeam.teamId, true)'
                />
              </div>

              <div v-if='!boardSettings.hideSpectators && game.spectators.length > 0' key='spectators' class='mt-4'>
                <div class='text-caption'>Spectators</div>

                <v-tooltip v-for='spectator in game.spectators' :key='spectator.id' top>
                  <span>{{ spectator.name }}</span>
                  <template #activator='{on}'>
                    <span v-on='on'>
                      <discord-avatar :user='spectator' />
                    </span>
                  </template>
                </v-tooltip>
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
            hint='Show coordinates around the board'
            label='Edge Labels'
            persistent-hint
          />

          <v-checkbox
            v-model='boardSettings.highlightOwnTeam'
            hint='Reserve bottom left parts of bingo squares for your team. Greatly improves overview of your progress.'
            label='Highlight own team'
            persistent-hint
          />

          <v-checkbox
            v-model='boardSettings.hideSpectators'
            hint='Hide spectators from the player list next to the board'
            label='Hide spectators'
            persistent-hint
          />
        </v-card>
      </v-dialog>

      <v-dialog v-model='spectateDialogOpen' :persistent='spectateLoading' max-width='500'>
        <v-card class='pa-5 relative'>
          <h2>Spectate this game</h2>

          Spectating the game lets you see all squares that have been discovered
          by at least one team.<br>
          Please note that you <b>cannot join this game anymore</b> after you
          chose to spectate.

          <div class='d-flex justify-end'>
            <v-btn :disabled='spectateLoading' class='mr-1' text @click='spectateDialogOpen = false'>
              Cancel
            </v-btn>
            <v-btn :loading='spectateLoading' color='accent' depressed @click='spectate'>
              Spectate
            </v-btn>
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

  footer {
    display: none;
  }
  `

  export default {
    name: 'GamePage',
    data: () => ({
      loading: false,
      embedUrlLoading: false,
      embedUrlCopied: false,
      gameReady: false,
      showBoard: false,
      hiddenTeams: [], // Array of team IDs
      boardSettingsOpen: false,
      boardSettings: {
        edgeLabels: false,
        highlightOwnTeam: true,
        hideSpectators: false,
      },
      spectateDialogOpen: false,
      spectateLoading: false,
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
            player => player.id === this.user?.id,
          ),
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
      isSpectating() {
        if (!this.game || !this.user) {
          return false
        }

        return this.game.spectators.some(s => s.id === this.user.id)
      },
    },
    watch: {
      userLoaded: {
        immediate: true,
        handler(userLoaded) {
          if (userLoaded && !this.isLoggedIn) {
            if (this.$route.query.jwt) {
              this.$store.commit('auth/setJwt', this.$route.query.jwt)
              this.$store.dispatch('user/updateUser')
            }
          }
        },
      },
      isLoggedIn: {
        immediate: true,
        async handler(isLoggedIn) {
          if (isLoggedIn) {
            await this.$store.dispatch('gameState/fetchGame', this.gameId)
            await this.$store.dispatch('gameState/connectGame', {
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
        },
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
        await this.$store.dispatch('gameState/connectGame', {
          gameId: this.gameId,
          reconnect: true,
        })
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
      async createEmbedUrl() {
        this.embedUrlLoading = true

        const token = await this.$axios.$post('/tokens/', {
          scopes: ['boards.read', 'user.info.read'],
        })

        const targetRoute = this.$router.resolve({
          name: 'game-gameId',
          params: {
            gameId: this.gameId,
          },
          query: {
            jwt: token,
          },
        })
        await window.navigator.clipboard.writeText(window.location.origin + targetRoute.href)

        this.embedUrlLoading = false

        this.embedUrlCopied = true
      },
      async spectate() {
        this.spectateLoading = true

        try {
          await this.$store.dispatch('gameState/spectateGame', this.gameId)
          this.spectateDialogOpen = false
        } catch (e) {
          console.error(e)
        }

        this.spectateLoading = false
      },
    },
  }
</script>

<style lang='scss' scoped>
  .teams {
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
    gap: 2em;
    justify-content: center;

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
      align-items: center;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      justify-content: center;

      .bingo-teams {
        display: flex;
        flex-direction: column;
        gap: 0.3em;
        justify-content: stretch;
      }
    }
  }

  .relative {
    .close-button {
      position: absolute;
      right: 1em;
      top: 1em;
      z-index: 10;
    }
  }
</style>

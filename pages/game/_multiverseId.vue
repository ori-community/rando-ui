<template>
  <div>
    <v-container>
      <h1 class='text-center mt-12 mb-6'>Game <small>#</small>{{ multiverseId }}</h1>
      <throttled-spinner>
        <div v-if='isLoggedIn && multiverseReady'>
          <div class='universes'>
            <wotw-universe-view
              v-for='universe in multiverse.universes'
              :key='universe.id'
              :can-join='!isSpectating'
              :color='universeColors[universe.id]'
              :disabled='loading'
              :universe='universe'
              class='universe-view'
              @join-world='worldId => join(worldId)'
              @new-world='createWorld(universe.id)'
            />
          </div>

          <div v-if='!isSpectating' class='text-center mt-4'>
            <v-tooltip :disabled='canCreateUniverse' bottom>
              <span>
                You ran out of space in your multiverse.
              </span>
              <template #activator='{on}'>
                <div class='d-inline-block' v-on='on'>
                  <v-btn :disabled='loading || !canCreateUniverse' large text @click='createWorld()'>
                    <v-icon left>mdi-plus</v-icon>
                    New Universe
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

    <template v-if='isLoggedIn && multiverseReady && !!multiverse.bingoBoard'>
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
            :hidden-teams='hiddenUniverses'
            :highlight-team='highlightedUniverseId'
            :team-colors='universeColors'
            class='board'
          />
          <div class='sidebar px-5'>
            <transition-group class='bingo-universes' name='list'>
              <div
                v-for='(bingoTeam, index) in sortedBingoUniverses'
                :key='bingoTeam.teamId'
                :style='{zIndex: sortedBingoUniverses.length - index}'
                class='relative'
              >
                <wotw-bingo-team-view
                  :bingo-team='bingoTeam'
                  :color='universeColors[bingoTeam.teamId]'
                  :team='games[gameId].teams.find(t => t.id === bingoTeam.teamId)'
                  :team-hidden='hiddenUniverses.includes(bingoTeam.teamId)'
                  @click='toggleUniverseVisibility(bingoTeam.teamId)'
                  @click.native.ctrl.capture.stop='toggleUniverseVisibility(bingoTeam.teamId, true)'
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
            v-model='boardSettings.highlightOwnUniverse'
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
      multiverseReady: false,
      showBoard: false,
      hiddenUniverses: [], // Array of team IDs
      boardSettingsOpen: false,
      boardSettings: {
        edgeLabels: false,
        highlightOwnUniverse: true,
        hideSpectators: false,
      },
      spectateDialogOpen: false,
      spectateLoading: false,
    }),
    computed: {
      ...mapGetters('user', ['isLoggedIn']),
      ...mapState('user', ['user', 'userLoaded']),
      ...mapState('multiverseState', ['multiverses']),
      isOBS() {
        return isOBS()
      },
      multiverseId() {
        return this.$route.params.multiverseId
      },
      multiverse() {
        return this.multiverses[this.multiverseId]
      },
      sortedBingoUniverses() {
        if (!this.multiverse) {
          return []
        }

        // Only return bingo teams for which we have a team
        const universes = this.multiverse.universes
        return [
          ...this.multiverse.bingoUniverses.filter(b => universes.some(u => u.id === b.universeId)),
        ].sort((a, b) => {
          const rankDifference = b.rank - a.rank

          if (rankDifference === 0) {
            return a.universeId - b.universeId
          }

          return rankDifference
        })
      },
      universeColors() {
        if (!this.multiverse) {
          return {}
        }

        const universeIds = this.multiverse.universes.map(u => u.id).sort()
        const universeColors = {}
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

        for (const universeId of universeIds) {
          universeColors[universeId] = colorPool.pop() ?? 'transparent'
        }

        return universeColors
      },
      canCreateUniverse() {
        return this.multiverse.universes.length < 8
      },
      ownUniverse() {
        return this.multiverse.universes.find(
          universe => universe.worlds.find(
            world => world.members.find(
              player => player.id === this.user?.id,
            )
          ),
        )
      },
      ownUniverseId() {
        return this.ownUniverse?.id
      },
      highlightedUniverseId() {
        if (!this.boardSettings.highlightOwnUniverse) {
          return null
        }

        return this.ownUniverseId
      },
      isSpectating() {
        if (!this.multiverse || !this.user) {
          return false
        }

        return this.multiverse.spectators.some(s => s.id === this.user.id)
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
            await this.$store.dispatch('multiverseState/fetchMultiverse', this.multiverseId)
            await this.$store.dispatch('multiverseState/connectMultiverse', {
              multiverseId: this.multiverseId,
            })
            this.multiverseReady = true
          }
        },
      },
      boardSettings: {
        deep: true,
        handler(boardSettings) {
          window.localStorage.setItem('boardSettings', JSON.stringify(boardSettings))
        },
      },
      'multiverse.universes'() { // TODO: Temporary workaround for orirando/wotw-server#5
        if (this.multiverse.bingoBoard) {
          this.$store.dispatch('multiverseState/fetchBingoBoard', this.multiverseId)
        }
      },
      multiverseReady: {
        immediate: true,
        handler(multiverseReady) {
          if (multiverseReady && this.multiverse.bingoBoard) {
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
      async join(worldId) {
        await this.$axios.post(`/multiverses/${this.multiverseId}/worlds/${worldId}`)
        await this.$store.dispatch('multiverseState/connectMultiverse', {
          multiverseId: this.multiverseId,
          reconnect: true,
        })
      },
      async createWorld(universeId = null) {
        await this.$axios.post(`/multiverses/${this.multiverseId}/${universeId}/worlds`)
      },
      centerBoard() {
        this.$refs.boardContainer.scrollIntoView({
          behavior: this.showBoard ? 'smooth' : 'auto',
          block: 'start',
        })
        this.showBoard = true
      },
      toggleUniverseVisibility(universeId, exclusive = false) {
        if (exclusive) {
          if (this.hiddenUniverses.length === this.sortedBingoUniverses.length - 1 && !this.hiddenUniverses.includes(universeId)) {
            this.hiddenUniverses = []
          } else {
            this.hiddenUniverses = this.sortedBingoUniverses.map(b => b.universeId).filter(u => u !== universeId)
          }
        } else if (this.hiddenUniverses.includes(universeId)) {
          this.hiddenUniverses = this.hiddenUniverses.filter(u => u !== universeId)
        } else {
          this.hiddenUniverses.push(universeId)
        }
      },
      async createEmbedUrl() {
        this.embedUrlLoading = true

        const token = await this.$axios.$post('/tokens/', {
          scopes: ['boards.read', 'user.info.read'],
        })

        const targetRoute = this.$router.resolve({
          name: 'game-multiverseId',
          params: {
            multiverseId: this.multiverseId,
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
          await this.$store.dispatch('multiverseState/spectateMultiverse', this.multiverseId)
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
  .universes {
    align-items: flex-start;
    display: flex;
    flex-wrap: wrap;
    gap: 2em;
    justify-content: center;

    .universe-view {
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

      .bingo-universes {
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

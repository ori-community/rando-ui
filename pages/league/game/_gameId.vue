<template>
  <v-container>
    <throttled-spinner>
      <div v-if="leagueSeason !== null && leagueGame !== null">
        <h1 class="text-center mt-12">Game #{{ leagueGame.gameNumber }}</h1>
        <h2 class="text-center mb-6">{{ leagueSeason.name }}</h2>
        <div class="d-flex justify-center align-center">
          <v-tooltip v-if="!isElectron" bottom>
            <template #activator="{ on }">
              <v-btn color="accent" x-large v-on="on" @click="openInLauncher">
                <v-icon left>mdi-launch</v-icon>
                Open in Launcher
              </v-btn>
            </template>
            <span><kbd>Ctrl</kbd> + Click to close this window</span>
          </v-tooltip>
          <v-btn v-else-if="!didSubmit && canSubmit" x-large color="accent" @click="launchGame()">
            <img class="launch-icon" src="../../../assets/images/launch.png" alt="" />
            Launch
          </v-btn>
        </div>
        <div class="submissions-container mt-7">
          <v-btn class="mb-1" text :to="{ name: 'league-seasons-seasonId', params: { seasonId: leagueGame.seasonId } }">
            <v-icon>mdi-arrow-left-thin</v-icon>
            Season
          </v-btn>
          <v-card class="pa-5">
            <h2 class="text-center mb-5">Submissions</h2>
            <div
              v-if="sortedSubmissions?.length > 0"
              class="submissions-grid"
              :style="{ gridTemplateRows: `repeat(${sortedSubmissions?.length + 1}, 1fr)` }"
            >
              <div>#</div>
              <div>Member</div>
              <div>time</div>
              <div>points</div>
              <div>discarded</div>
              <template v-for="submission in sortedSubmissions">
                <div :key="`${submission.id}-rank`">
                  <place-badge :size="40" :place="!submission.rankingData.rank ? '' : submission.rankingData.rank" />
                </div>
                <div :key="`${submission.id}-name`">
                  <discord-avatar :user="submission.membership.user" class="mr-1" />{{ submission.membership.user.name }}
                </div>
                <div :key="`${submission.id}-time`">{{ formatTime(submission.rankingData.time) }}</div>
                <div :key="`${submission.id}-points`">{{ submission.rankingData.points }}</div>
                <div :key="`${submission.id}-discarded`">{{ submission.rankingData.discarded }}</div>
              </template>
            </div>
            <div v-if="!(gameSubmissions?.length > 0) && canSubmit" class="mt-5">Be the first to submit!</div>
          </v-card>
        </div>
        <pre>{{ leagueGame }}</pre>
        <!-- <pre>{{ gameSubmissions }}</pre> -->
      </div>
    </throttled-spinner>
  </v-container>
</template>

<script>

  // TODO:
  // beautify grid

  import { mapGetters, mapState } from 'vuex'
  import { formatTime } from '~/assets/lib/formatTime'
  import { isElectron } from '~/assets/lib/isElectron'

  export default {
    data: () => ({
      leagueSeason: null,
      leagueGame: null,
      gameSubmissions: null,
      actionLoading: false,
    }),
    computed: {
      ...mapState('user', ['user']),
      ...mapGetters('user', ['isLoggedIn']),
      ...mapState('multiverseState', ['multiverses']),
      isElectron,
      canSubmit() {
        return this.leagueGame !== null && this.leagueGame.userMetadata.canSubmit
      },
      didSubmit() {
        return this.gameSubmissions?.some((s) => s.membership.user.id === this.user.id)
      },
      multiverse() {
        return this.multiverses[this.leagueGame.multiverseId]
      },
      sortedSubmissions() {
        if (!this.gameSubmissions) {
          return []
        }
        if (this.didSubmit) {
          return [...this.gameSubmissions].sort((a, b) => {
            // if discarded, rank stays null
            if (!a.rankingData.rank && !b.rankingData.rank) {
              return 0
            }
            if (!a.rankingData.rank) {
              return 1
            }
            if (!b.rankingData.rank) {
              return -1
            }
            // if same rank, order by username
            if (b.rankingData.rank === a.rankingData.rank) {
              return a.membership.user.name.localeCompare(b.membership.user.name)
            }
            return a.rankingData.rank - b.rankingData.rank
          })
        } else {
          // order by username
          return [...this.gameSubmissions].sort((a, b) => a.membership.user.name.localeCompare(b.membership.user.name))
        }
      },
      ownWorld() {
        console.log(this.multiverse)
        if (!this.multiverse) {
          return null
        }

        for (const universe of this.multiverse.universes) {
          const world = universe.worlds.find((world) => world.members.find((player) => player.id === this.user?.id))

          if (world) {
            return world
          }
        }

        return null
      },
      launcherUrl() {
        return `ori-rando://league/game/${this.leagueGame.id}`
      },
    },
    watch: {
      '$route.params.gameId': {
        immediate: true,
        handler() {
          this.loadGame()
        },
      },
    },
    methods: {
      formatTime,
      async loadGame() {
        try {
          this.leagueGame = await this.$axios.$get(`/league/games/${this.$route.params.gameId}`)
          this.leagueSeason = await this.$axios.$get(`/league/seasons/${this.leagueGame.seasonId}`)
          this.gameSubmissions = await this.$axios.$get(`/league/games/${this.$route.params.gameId}/submissions`)
        } catch (e) {
          console.error(e)
        }
      },
      async launchGame() {
        await this.$store.dispatch('multiverseState/fetchMultiverse', this.leagueGame.multiverseId)

        // create world if it doesn't exist
        if (!this.ownWorld) {
          const universeId = null
          await this.$axios.post(`/multiverses/${this.leagueGame.multiverseId}/${universeId}/worlds`)
        }

        // launch
        this.$store.dispatch('electron/launch', {
          newGameSeedSource: `server:${this.leagueGame.multiverseId}`,
        })
      },
      openInLauncher(event) {
        window.open(this.launcherUrl, '_self')

        if (event.ctrlKey) {
          setTimeout(() => {
            window.close()
          }, 500)
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  .launch-icon {
    height: 2.25em;
    width: auto;
    margin-right: 0.5em;
    margin-left: -0.5em;

    &.disabled {
      opacity: 0.4;
      filter: grayscale(1);
    }
  }

  .submissions-container {
    max-width: 700px;
    margin: 0 auto;
  }

  .submissions-grid {
    display: grid;
    grid-template-columns: 0.5fr 2fr 1fr 1fr 1fr;
  }
</style>

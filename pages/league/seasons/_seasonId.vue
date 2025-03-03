<template>
  <v-container>
    <v-slide-y-transition>
      <div v-if="!!leagueSeason?.backgroundImageUrl" class="background-image-wrapper">
        <img class="background-image" alt="" :src="leagueSeason.backgroundImageUrl" />
        <div class="overlay"></div>
      </div>
    </v-slide-y-transition>

    <throttled-spinner>
      <div class="season-container justify-center" v-if="leagueSeason !== null">
        <div class="d-flex justify-center align-center mt-12 mb-6">
          <h1 class="pl-12 text-center mx-6">{{ leagueSeason.name }}</h1>
          <v-tooltip top open-delay="500">
            <template #activator="{ on }">
              <v-btn icon :disabled="seasonLinkCopied" v-on="on" @click="copySeasonLink">
                <v-icon>{{ seasonLinkCopied ? 'mdi-clipboard-check-outline' : 'mdi-link' }}</v-icon>
              </v-btn>
            </template>
            <span>Copy season link</span>
          </v-tooltip>
        </div>
        <div class="mb-2">
          <v-btn text exact to="/league/seasons">
            <v-icon>mdi-arrow-left-thin</v-icon>
            Seasons
          </v-btn>
          <v-btn text @click="showSeasonInfo = true"><v-icon left>mdi-information-outline</v-icon>Info</v-btn>
          <v-btn text @click="showSeasonRules = true"><v-icon left>mdi-book-open-outline</v-icon>Rules</v-btn>
          <v-tooltip v-if="isElectron" bottom open-delay="300">
            <template #activator="{ on }">
              <div class="top-row-button" v-on="on">
                <v-btn text :disabled="!isLoggedIn" @click="trainingSeedDialogOpen = true">
                  <v-icon left>mdi-dumbbell</v-icon>
                  Training
                </v-btn>
              </div>
            </template>
            <span>{{ isLoggedIn ? 'Create a practice game' : 'Log in to create a practice game' }}</span>
          </v-tooltip>
          <v-tooltip v-if="!isJoined && !seasonEnded" bottom :disabled="canJoin">
            <template #activator="{ on }">
              <div class="top-row-button" v-on="on">
                <div class="ori-lurk-container">
                  <img class="ori-lurk" :class="{ lurking: joinButtonLurking }" src="~/assets/images/ori_lurk.png" />
                </div>
                <v-btn color="accent" :loading="actionLoading" :disabled="!canJoin" @click="showSeasonRules = true">
                  <v-icon left>mdi-plus-circle-outline</v-icon>
                  Join
                </v-btn>
              </div>
            </template>
            <span>{{ isLoggedIn ? `You can't join running seasons` : 'Log in to join' }}</span>
          </v-tooltip>
        </div>
        <div class="tables-container">

          <!-- LEADERBOARD -->
          <v-card class="overflow-x-auto leaderboard-container">
            <h2 ref="leaderboardTitle" class="text-center mt-5 mb-5">Leaderboard</h2>
            <throttled-spinner>
              <v-data-table
                v-if="sortedMembers"
                class="leaderboard"
                :headers="memberHeaders"
                :items="sortedMembers"
                disable-pagination
                hide-default-footer
                disable-sort
                mobile-breakpoint="0"
                :item-class="(item) => (item.user.id === user?.id ? 'row-highlighting' : '')"
              >
                <!-- items -->
                <template #item.rank="{ item }">
                  <div class="d-flex">
                    <place-badge v-if="item.rank ?? false" :size="40" :place="item.rank" light-circle />
                    <v-tooltip v-if="item.lastRankDelta !== null && leagueSeason.currentGameId !== null" right>
                      <template #activator="{ on }">
                        <v-icon v-if="item.lastRankDelta < 0" small color="green" v-on="on">mdi-arrow-up</v-icon>
                        <v-icon v-else-if="item.lastRankDelta > 0" small color="red" v-on="on">mdi-arrow-down</v-icon>
                      </template>
                      <span>
                        {{ Math.abs(item.lastRankDelta) }} rank{{ Math.abs(item.lastRankDelta) !== 1 ? 's' : '' }}
                        <span v-if="item.lastRankDelta > 0" class="red--text">down</span>
                        <span v-else class="green--text">up</span>
                        since last game
                      </span>
                    </v-tooltip>
                  </div>
                </template>
                <template #item.user.name="{ item }">
                  <div class="text-no-wrap">
                    <discord-avatar :user="item.user" class="mr-1" />
                    {{ item.user.name }}
                  </div>
                </template>
                <template #item.currentGame.submitted="{ item }">
                  <v-tooltip
                    v-if="currentGameSubmissions?.some((s) => s.membership.user.id === item.user.id)"
                    open-delay="500"
                    bottom
                  >
                    <template #activator="{ on }">
                      <v-icon small color="green lighten-2" v-on="on">mdi-flag-checkered</v-icon>
                    </template>
                    Submitted to current game
                  </v-tooltip>
                </template>
                <template #item.points="{ item }">
                  <v-tooltip left open-delay="500" :disabled="item.rankingCompensationPoints === 0">
                    <template #activator="{ on }">
                      <span :class="{'compensating-points': item.rankingCompensationPoints > 0}" v-on="on">
                        {{ item.points }}
                      </span>
                    </template>
                    <div class="text-right">
                      Includes {{ item.rankingCompensationPoints }} {{ item.rankingCompensationPoints === 1 ? 'point' : 'points' }} to compensate<br>
                      missed or unusually bad games. These points<br>
                      disappear over time until the end of the season.
                    </div>
                  </v-tooltip>
                </template>
                <!-- no data -->
                <template #no-data>
                  <div class="mb-2 mt-5">
                    <template v-if="!(sortedMembers.length > 0)">
                      <img class="ori-image" src="~/assets/images/ori_think.png" /><br />no players
                    </template>
                  </div>
                </template>
              </v-data-table>

              <!-- footer -->
              <div class="text-center">
                <div v-if="leagueSeason.memberships.length > 0" class="mt-3 mb-1">
                  <div class="background--text text--lighten-5">
                    {{ leagueSeason.memberships.length }}
                    {{ leagueSeason.memberships.length === 1 ? 'player' : 'players' }}
                  </div>
                </div>
              </div>
            </throttled-spinner>
          </v-card>

          <!-- SEASON START -->
          <v-card
            v-if="leagueSeason?.nextContinuationAt && !(leagueSeason.games.length > 0)"
            class="season-start-container text-center pa-5"
            style="grid-row: 1"
          >
            <div class="background-overlay"></div>
            <div class="gradient-overlay"></div>
            <div class="starting-date-content">
              <div>Starting at</div>
              <span class="starting-date">
                {{ formatDateEpoch(leagueSeason?.nextContinuationAt, 'P p') }}
              </span>
              <div>
                <template v-if="isJoined">Be prepared!</template>
                <template v-else>Join the hype!</template>
              </div>
            </div>
          </v-card>

          <!-- CURRENT GAME -->
          <league-game-card
            v-if="currentGame !== null"
            style="grid-row: 1"
            :game="currentGame"
            :game-count="leagueSeason.gameCount"
            :playable-until="leagueSeason.nextContinuationAt"
            :member-count="leagueSeason.memberships?.length"
          />

          <!-- PAST GAMES -->
          <div class="games-list">
            <h3
              v-if="pastGames.length > 0 && leagueSeason.currentGameId"
              class="text-center"
              :class="{ 'mt-3': currentGame !== null }"
              style="grid-row: 2"
            >
              Past Games
            </h3>
            <v-card v-if="pastGames.length > 0" class="overflow-x-auto">
              <h2 v-if="!leagueSeason.currentGameId" class="text-center mt-5 mb-5">Games</h2>
              <v-data-table
                class="past-games"
                :headers="gameHeaders"
                :items="pastGames"
                disable-pagination
                hide-default-footer
                must-sort
                sort-by="gameNumber"
                :item-class="() => 'cursor-pointer'"
                mobile-breakpoint="0"
                @click:row="(game) => openGamePage(game.id)"
              >
                <!-- items -->
                <template #item.gameNumber="{ item }">#{{ item.gameNumber }}</template>
                <template #item.userMetadata.ownSubmission.rankingData.rank="{ item }">
                  <place-badge
                    v-if="item.userMetadata?.ownSubmission?.rankingData?.rank ?? null !== null"
                    :size="40"
                    :place="item.userMetadata.ownSubmission.rankingData.rank"
                    light-circle
                  />
                  <div v-else>-</div>
                </template>
                <template #item.userMetadata.ownSubmission.rankingData.points="{ item }">
                  <template v-if="item.userMetadata?.ownSubmission?.rankingData?.points >= 0">
                    <league-points-view
                      :ranking-data="item.userMetadata?.ownSubmission?.rankingData"
                      :discard-worst-games-count="leagueSeason.discardWorstGamesCount"
                    />
                  </template>
                  <template v-else>
                    <div>-</div>
                  </template>
                </template>
                <template #item.userMetadata.ownSubmission.rankingData.time="{ item }">
                  <league-time-view
                    :time="item.userMetadata?.ownSubmission?.rankingData?.time"
                    :original-time="item.userMetadata?.ownSubmission?.rankingData?.originalTime"
                  />
                </template>
              </v-data-table>
            </v-card>
          </div>
        </div>
      </div>
    </throttled-spinner>
    <v-dialog v-model="showSeasonInfo" max-width="800">
      <v-card class="pa-5">
        <h2 class="text-center mb-3">Info</h2>
        <div v-if="leagueSeason">
          <div class="dialog-html" v-html="longDescriptionHtml"></div>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showSeasonRules" max-width="800">
      <v-card class="pa-5">
        <h2 class="text-center mb-3">Rules</h2>
        <div v-if="leagueSeason">
          <div class="dialog-html" v-html="rulesHtml"></div>
        </div>
        <div v-if="!isJoined && canJoin" class="justify-end dialog-buttons mt-3">
          <v-btn color="accent" depressed @click="joinSeason">
            <v-icon left>mdi-plus-circle-outline</v-icon>
            Confirm and Join
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="trainingSeedDialogOpen" :permanent="trainingSeedLoading" width="unset" max-width="600">
      <v-card class="pa-5">
        <h2 class="mb-3">Training</h2>
        <p>
          Here you can play training seeds for practising this league season. These seeds are rolled with the same
          settings as the actual league seeds. Playing them does not affect your points or ranking.
        </p>
        <div class="dialog-buttons mt-8 mb-2">
          <v-btn
            x-large
            depressed
            color="accent"
            :loading="trainingSeedLoading"
            @click.native="launchTrainingSeed"
            ref="trainingSeedLaunchButton"
          >
            <img class="launch-icon" src="@/assets/images/launch.png" alt="" />Launch</v-btn
          >
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex'
  import { isElectron } from '~/assets/lib/isElectron'
  import { renderMarkdown } from '~/assets/lib/markdown'
  import { formatsDates } from '~/assets/lib/formatsDates'
  import { formatTime } from '~/assets/lib/formatTime'
  import { confettiFromElement } from '~/assets/lib/confettiFromElement'
  import { UISeedGenerator } from '~/assets/lib/api/UISeedGenerator'

  export default {
    mixins: [formatsDates],
    data: () => ({
      leagueSeason: null,
      currentGameSubmissions: null,
      actionLoading: false,
      displayedTab: null,
      showSeasonInfo: false,
      showSeasonRules: false,
      seasonLinkCopied: false,
      refreshTimeoutId: null,
      lurkTimeoutId: null,
      joinButtonLurking: false,
      trainingSeedDialogOpen: false,
      trainingSeedLoading: false,
      gameHeaders: [
        { text: 'Number', value: 'gameNumber', align: 'center' },
        { text: 'Your Rank', value: 'userMetadata.ownSubmission.rankingData.rank', align: 'left' },
        { text: 'Your Points', value: 'userMetadata.ownSubmission.rankingData.points', align: 'left' },
        { text: 'Your Time', value: 'userMetadata.ownSubmission.rankingData.time', align: 'right' },
      ],
    }),
    head() {
      return {
        title: this.leagueSeason?.name ? `${this.leagueSeason?.name} - League` : 'League',
      }
    },
    computed: {
      ...mapState('user', ['user']),
      ...mapGetters('user', ['isLoggedIn']),
      isElectron,
      isJoined() {
        return this.leagueSeason !== null && this.leagueSeason.memberships.some((m) => m.user.id === this.user?.id)
      },
      canJoin() {
        return this.leagueSeason !== null && this.leagueSeason.canJoin && this.isLoggedIn && !this.isJoined
      },
      seasonEnded() {
        return (
          this.leagueSeason !== null && this.leagueSeason.currentGameId === null && this.leagueSeason.games?.length > 0
        )
      },
      sortedMembers() {
        return (
          this.leagueSeason?.memberships?.toSorted((a, b) => {
            if (a.points === b.points) {
              return a.user.name.localeCompare(b.user.name)
            }
            return b.points - a.points
          }) ?? []
        )
      },
      rulesHtml() {
        return renderMarkdown(this.leagueSeason.rulesMarkdown)
      },
      longDescriptionHtml() {
        return renderMarkdown(this.leagueSeason.longDescriptionMarkdown)
      },
      currentGame() {
        return this.leagueSeason?.games?.find((g) => g.isCurrent) ?? null
      },
      pastGames() {
        return this.leagueSeason?.games?.filter((g) => !g.isCurrent) ?? []
      },
      memberHeaders() {
        const headers = [
          { text: 'Rank', value: 'rank', align: 'center', width: 0 },
          { text: 'Player', value: 'user.name' },
        ]
        if (this.currentGame) {
          headers.push({
            text: `Game #${this.currentGame.gameNumber}`,
            value: 'currentGame.submitted',
            align: 'center',
          })
        }
        headers.push({ text: 'Points', value: 'points', align: 'right' })
        return headers
      },
    },
    watch: {
      '$route.params.seasonId': {
        immediate: true,
        handler() {
          this.loadSeason()
        },
      },
      canJoin: {
        immediate: true,
        handler(value) {
          if (!value) {
            this.joinButtonLurking = false
          }
        },
      },
    },
    mounted() {
      this.lurkAfterRandomTime()

      if (this.isElectron) {
        window.electronApi.on('league.runSubmitted', () => {
          this.loadSeason()
        })
      }
    },
    beforeDestroy() {
      if (this.refreshTimeoutId !== null) {
        clearTimeout(this.refreshTimeoutId)
      }

      if (this.lurkTimeoutId !== null) {
        clearInterval(this.lurkTimeoutId)
      }
    },
    methods: {
      formatTime,
      lurkAfterRandomTime() {
        this.lurkTimeoutId = setTimeout(() => {
          if (this.joinButtonLurking) {
            this.joinButtonLurking = false
          } else if (this.canJoin) {
            this.joinButtonLurking = true
          }

          this.lurkAfterRandomTime()
        }, 2000 + Math.random() * 10000)
      },
      async loadSeason() {
        try {
          this.leagueSeason = await this.$axios.$get(`/league/seasons/${this.$route.params.seasonId}`)
          if (this.leagueSeason.currentGameId) {
            this.currentGameSubmissions = await this.$axios.$get(
              `/league/games/${this.leagueSeason.currentGameId}/submissions`,
            )
          }

          if (this.refreshTimeoutId !== null) {
            clearTimeout(this.refreshTimeoutId)
          }

          if (this.leagueSeason.currentGame !== null || this.leagueSeason.nextContinuationAt > Date.now()) {
            this.refreshTimeoutId = setTimeout(() => {
              this.loadSeason()
            }, Math.max(10000, this.leagueSeason.nextContinuationAt - Date.now()))
          }
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

        setTimeout(() => {
          confettiFromElement(this.$refs.leaderboardTitle, {
            startVelocity: 30,
          })
        }, 75)

        this.showSeasonRules = false
        this.actionLoading = false
      },
      async openGamePage(gameId) {
        await this.$router.push({ name: 'league-game-gameId', params: { gameId } })
      },
      async copySeasonLink() {
        const url = new URL(`/league/seasons/${this.leagueSeason.id}`, this.$paths.UI_BASE_URL)
        await navigator.clipboard.writeText(url.toString())
        this.seasonLinkCopied = true

        setTimeout(() => {
          this.seasonLinkCopied = false
        }, 3000)
      },
      async launchTrainingSeed() {
        this.trainingSeedLoading = true

        const uiSeedGenerator = new UISeedGenerator(this.$axios)
        const response = await this.$axios.$post(`/league/seasons/${this.leagueSeason.id}/training-seed`)

        const seedgenResponse = uiSeedGenerator.getSeedgenResponse(response)

        await seedgenResponse.electronApi.downloadSeed({
          setTo: true,
        })
        await this.$store.dispatch('electron/launch')

        // postponed until multiverse games can be "offline" or seasons are online
        // const multiverseId = await this.$axios.$post('/multiverses', {
        //   seedId: response.result.seedId,
        // })
        // await this.$router.push({ name: 'game-multiverseId', params: { multiverseId } })

        confettiFromElement(this.$refs.trainingSeedLaunchButton.$el, {
          startVelocity: 30,
        })
        this.trainingSeedLoading = false
        this.trainingSeedDialogOpen = false
      },
    },
  }
</script>

<style lang="scss" scoped>
  .background-image-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: -10;

    .background-image {
      width: 100%;
      height: 100%;
      mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0) 100%);
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }

  .season-container {
    max-width: 1100px;
    margin: 0 auto;
  }

  .tables-container {
    display: grid;
    align-items: start;
    grid-template-columns: 6fr 5fr;
    grid-auto-rows: auto max-content;
    grid-auto-flow: column;
    gap: 1em;

    .leaderboard-container {
      grid-row: span 2;
    }

    @media (max-width: 800px) {
      grid-template-columns: 1fr;
      grid-auto-flow: row;
    }
  }

  .leaderboard {
    :deep(.row-highlighting) {
      position: relative;

      > * {
        position: relative;
        z-index: 1;
      }

      &::after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(
          to right,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.1) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        z-index: 0;
      }
    }

    :deep(tr) {
      th:first-of-type,
      td:first-of-type {
        padding-left: 3em;
      }

      th:last-of-type,
      td:last-of-type {
        padding-right: 3em;
      }
    }
  }

  .past-games {
    :deep(tr) {
      th:first-of-type,
      td:first-of-type {
        padding-left: 2cqb;
      }

      th:last-of-type,
      td:last-of-type {
        padding-right: 2em;
      }
    }
  }

  .season-start-container {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.4);
    background-color: transparent;

    .background-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--v-background-lighten1);
      opacity: 0.6;
    }

    .gradient-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 2;
      pointer-events: none;
      background: linear-gradient(
        45deg,
        rgba(0, 0, 0, 0.6) 0%,
        rgba(0, 0, 0, 0.05) 40%,
        rgba(0, 0, 0, 0.05) 60%,
        rgba(0, 0, 0, 0.6) 100%
      );
    }

    .starting-date-content {
      position: relative;
      z-index: 1;

      .starting-date {
        font-size: 2em;
        font-weight: 600;
      }
    }
  }

  .games-list {
    display: flex;
    flex-direction: column;
    gap: 0.75em;
  }

  .top-row-button {
    position: relative;
    display: inline-block;
  }

  .ori-lurk-container {
    display: block;
    position: absolute;
    pointer-events: none;
    top: -3rem;
    left: 0;
    right: 0;
    bottom: 100%;
    overflow: hidden;
  }

  .ori-lurk {
    margin: 0 auto;
    left: 50%;
    height: 3rem;
    position: absolute;
    transform: translateY(100%) translateX(-50%) scale(0.9);
    transition: transform 300ms;

    &.lurking {
      transform: translateY(5%) translateX(-50%);
    }
  }

  .ori-image {
    height: 2em;
  }

  .dialog-buttons {
    display: flex;
    flex-wrap: wrap;
    flex-grow: 0;
    justify-content: center;
    gap: 0.4em;
  }

  :deep(.dialog-html) {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      &:not(:first-child) {
        margin-top: 1em;
      }
    }
  }

  .launch-icon {
    height: 2.25em;
    width: auto;
    margin-right: 0.5em;
    margin-left: -0.5em;
  }

  .compensating-points {
    &::before {
      content: '℮';
      color: rgba(255, 255, 255, 0.5);
    }

    white-space: nowrap;
    cursor: help;
  }
</style>

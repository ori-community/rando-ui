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
        <h1 class="text-center mt-12 mb-6">{{ leagueSeason.name }}</h1>
        <div class="mb-2">
          <v-btn text @click="showSeasonInfo = true"><v-icon left>mdi-information-outline</v-icon>Info</v-btn>
          <v-btn text @click="showSeasonRules = true"><v-icon left>mdi-book-open-outline</v-icon>Rules</v-btn>
          <v-tooltip v-if="!isJoined" bottom :disabled="canJoin">
            <template #activator="{ on }">
              <span v-on="on">
                <v-btn color="accent" :loading="actionLoading" :disabled="!canJoin" @click="joinSeason">
                  <v-icon left>mdi-plus-circle-outline</v-icon>
                  Join
                </v-btn>
              </span>
            </template>
            <span>{{ isLoggedIn ? `You can't join running seasons` : 'Log in to join' }}</span>
          </v-tooltip>
        </div>
        <div class="tables-container">
          <v-card class="pt-5 overflow-x-auto">
            <h2 class="text-center mb-5">Leaderboard</h2>
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
                  <place-badge v-if="item.rank ?? false" :size="40" :place="item.rank" light-circle />
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
                  <v-label>
                    {{ leagueSeason.memberships.length }}
                    {{ leagueSeason.memberships.length === 1 ? 'player' : 'players' }}
                  </v-label>
                </div>
              </div>
            </throttled-spinner>
            <div class="call-to-join text-center mb-3 mt-5">
              <template v-if="canJoin">
                <v-label><b>JOIN!</b></v-label>
                <img class="ori-image" src="~/assets/images/ori_lurk.png" />
              </template>
            </div>
          </v-card>
          <div class="games-list">
            <league-game-card
              v-if="currentGame !== null"
              :game="currentGame"
              :game-count="leagueSeason.gameCount"
              :playable-until="leagueSeason.nextContinuationAt"
              :member-count="leagueSeason.memberships?.length"
            />
            <h3
              v-if="pastGames.length > 0 && leagueSeason.currentGameId"
              class="text-center"
              :class="{ 'mt-3': currentGame !== null }"
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
                  <v-tooltip bottom :disabled="!item.userMetadata?.ownSubmission?.rankingData?.discarded">
                    <template #activator="{ on }">
                      <div v-if="item.userMetadata?.ownSubmission?.rankingData?.points >= 0" v-on="on">
                        <span :class="item.userMetadata?.ownSubmission?.rankingData?.discared ? 'discarded' : ''">{{
                          item.userMetadata?.ownSubmission?.rankingData?.points
                        }}</span>
                      </div>
                      <div v-else>-</div>
                    </template>
                    <span v-if="leagueSeason.discardWorstGamesCount > 1"
                      >Your {{ leagueSeason.discardWorstGamesCount }} worst races get discarded</span
                    >
                    <span v-else>Your worst race gets discarded</span>
                  </v-tooltip>
                </template>
              </v-data-table>
            </v-card>
          </div>
        </div>
      </div>
    </throttled-spinner>
    <v-dialog v-model="showSeasonInfo" max-width="800">
      <v-card class="pa-5">
        <div v-if="leagueSeason">
          <div v-html="longDescriptionHtml"></div>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showSeasonRules" max-width="800">
      <v-card class="pa-5">
        <div v-if="leagueSeason">
          <div v-html="rulesHtml"></div>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex'
  import { renderMarkdown } from '~/assets/lib/markdown'

  export default {
    data: () => ({
      leagueSeason: null,
      currentGameSubmissions: null,
      actionLoading: false,
      displayedTab: null,
      showSeasonInfo: false,
      showSeasonRules: false,
      refreshTimeoutId: null,
      gameHeaders: [
        { text: 'Number', value: 'gameNumber', align: 'center' },
        { text: 'Submissions', value: 'submissionCount', align: 'left' },
        { text: 'Your Rank', value: 'userMetadata.ownSubmission.rankingData.rank', align: 'left' },
        { text: 'Your Points', value: 'userMetadata.ownSubmission.rankingData.points', align: 'left' },
      ],
    }),
    computed: {
      ...mapState('user', ['user']),
      ...mapGetters('user', ['isLoggedIn']),
      isJoined() {
        return this.leagueSeason !== null && this.leagueSeason.memberships.some((m) => m.user.id === this.user?.id)
      },
      canJoin() {
        return this.leagueSeason !== null && this.leagueSeason.canJoin && this.isLoggedIn && !this.isJoined
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
    },
    beforeDestroy() {
      if (this.refreshTimeoutId !== null) {
        clearTimeout(this.refreshTimeoutId)
      }
    },
    methods: {
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

        this.actionLoading = false
      },
      async openGamePage(gameId) {
        await this.$router.push({ name: 'league-game-gameId', params: { gameId } })
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
    grid-auto-flow: column;
    gap: 1em;

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

  .games-list {
    display: flex;
    flex-direction: column;
    gap: 0.75em;
  }

  .call-to-join {
    position: absolute;
    top: 0;
    right: 1em;
  }

  .ori-image {
    height: 2em;
  }
  .discarded {
    text-decoration: line-through;
    opacity: 0.6;
  }
</style>

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
          <v-btn v-if="!isJoined" color="accent" :loading="actionLoading" :disabled="!canJoin" @click="joinSeason">
            <v-icon left>mdi-plus-circle-outline</v-icon>
            Join
          </v-btn>
        </div>
        <div class="tables-container">
          <v-card class="pt-5">
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
                :item-class="(item) => (item.user.id === user?.id ? 'row-highlighting' : '')"
              >
                <template v-if="!(sortedMembers.length > 0) && canJoin" #no-data>
                  <img class="ori-image mt-5" src="~/assets/images/ori_lurk.png" /><br /><b>JOIN!</b>
                </template>
                <template v-else #no-data
                  ><img class="ori-image mt-5" src="~/assets/images/ori_think.png" /><br />No members
                </template>

                <template #item.rank="{ item }">
                  <place-badge v-if="item.rank ?? null !== null" :size="40" :place="item.rank" />
                </template>
                <template #item.user.name="{ item }">
                  <discord-avatar :user="item.user" class="mr-1" />
                  <v-tooltip bottom>
                    <template #activator="{ on }">
                      <v-icon v-if="memberSubmittedToCurrentGame(item.user)" small v-on="on">mdi-flag-checkered</v-icon>
                    </template>
                    Submitted to current game
                  </v-tooltip>
                  {{ item.user.name }}
                </template>
              </v-data-table>
              <div class="text-center mt-3 mb-1">
                <v-label>
                  {{ leagueSeason.memberships.length }}
                  {{ leagueSeason.memberships.length === 1 ? 'player' : 'players' }}
                </v-label>
              </div>
            </throttled-spinner>
          </v-card>
          <div class="games-list">
            <league-game-card
              v-if="currentGame !== null"
              :game="currentGame"
              :playable-until="leagueSeason.nextContinuationAt"
            />
            <h3
              v-if="pastGames.length > 0 && leagueSeason.currentGameId"
              class="text-center"
              :class="{ 'mt-3': currentGame !== null }"
            >
              Past Games
            </h3>
            <v-data-table
              v-if="pastGames.length > 0"
              :headers="gameHeaders"
              :items="pastGames"
              disable-pagination
              hide-default-footer
              must-sort
              sort-by="gameNumber"
              :item-class="() => 'cursor-pointer'"
              @click:row="(game) => openGamePage(game.id)"
            >
              <template #item.gameNumber="{ item }">#{{ item.gameNumber }}</template>
              <template #item.userMetadata.ownSubmission.rankingData.rank="{ item }">
                <place-badge
                  v-if="item.userMetadata?.ownSubmission?.rankingData?.rank ?? null !== null"
                  :size="40"
                  :place="item.userMetadata.ownSubmission.rankingData.rank"
                />
              </template>
            </v-data-table>
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
  // TODO
  // update lists when something changes

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
      memberHeaders: [
        { text: 'Rank', value: 'rank', width: '80px' },
        { text: 'Player', value: 'user.name' },
        { text: 'Points', value: 'points', width: '30%' },
      ],
      gameHeaders: [
        { text: 'Number', value: 'gameNumber' },
        { text: 'Submissions', value: 'submissionCount' },
        { text: 'Your Rank', value: 'userMetadata.ownSubmission.rankingData.rank' },
        { text: 'Your Points', value: 'userMetadata.ownSubmission.rankingData.points' },
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
    },
    watch: {
      '$route.params.seasonId': {
        immediate: true,
        handler() {
          this.loadSeason()
        },
      },
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
      memberSubmittedToCurrentGame(user) {
        if (!this.currentGame || !this.currentGameSubmissions) return false
        return this.currentGameSubmissions?.some((s) => s.membership.user.id === user.id)
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
    max-width: 1000px;
    margin: 0 auto;
  }

  .tables-container {
    display: grid;
    align-items: start;
    grid-template-columns: 5fr 4fr;
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
        background-color: rgba(255, 255, 255, 0.15);
        z-index: 0;
      }
    }
  }

  .games-list {
    display: flex;
    flex-direction: column;
    gap: 0.75em;
  }

  .ori-image {
    height: 2em;
  }
</style>

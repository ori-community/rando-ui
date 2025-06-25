<template>
  <v-container>
    <teleport defer to="#backdrop">
      <v-slide-y-transition>
        <div v-if="!!leagueSeason?.backgroundImageUrl" class="background-image-wrapper">

          <img class="background-image" alt="" :src="leagueSeason.backgroundImageUrl">
          <!--        <div class="overlay"/>-->
        </div>
      </v-slide-y-transition>
    </teleport>

    <rando-throttled-spinner>
      <div v-if="leagueSeason !== null" class="season-container justify-center">
        <div class="d-flex justify-center align-center mt-12 mb-6">
          <h1 class="pl-12 text-center mx-6">{{ leagueSeason.name }}</h1>
          <v-tooltip top open-delay="500">
            <template #activator="{ props: on }">
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
          <v-btn text @click="showSeasonInfo = true">
            <v-icon left>mdi-information-outline</v-icon>
            Info
          </v-btn>
          <v-btn text @click="showSeasonRules = true">
            <v-icon left>mdi-book-open-outline</v-icon>
            Rules
          </v-btn>
          <v-tooltip v-if="isElectron" bottom open-delay="300">
            <template #activator="{ props: on }">
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
            <template #activator="{ props: on }">
              <div class="top-row-button" v-on="on">
                <div class="ori-lurk-container">
                  <img
                    class="ori-lurk" :class="{ lurking: joinButtonLurking }"
                    src="../../../../shared/images/ori_lurk.png" alt="">
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
            <rando-throttled-spinner>
              <v-data-table
                v-if="sortedMembers"
                class="leaderboard"
                :headers="memberHeaders"
                :items="sortedMembers"
                disable-pagination
                hide-default-footer
                disable-sort
                :mobile-breakpoint='0'
                :item-class="(item: LeagueSeasonMembershipInfo) => (item.user.id === user?.id ? 'row-highlighting' : '')"
              >
                <!-- items -->
                <template #[`item.rank`]="{ item }">
                  <div class="d-flex">
                    <rando-place-badge v-if="item.rank ?? false" :size="40" :place="item.rank"/>
                    <v-tooltip v-if="item.lastRankDelta !== null && leagueSeason.currentGameId !== null" right>
                      <template #activator="{ props: on }">
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
                <template #[`item.user.name`]="{ item }">
                  <div class="text-no-wrap">
                    <rando-discord-avatar :user="item.user" class="mr-1"/>
                    {{ item.user.name }}
                  </div>
                </template>
                <template #[`item.currentGame.submitted`]="{ item }">
                  <v-tooltip
                    v-if="currentGameSubmissions?.some((s) => s.membership.user.id === item.user.id)"
                    open-delay="500"
                    bottom
                  >
                    <template #activator="{ props: on }">
                      <v-icon small color="green lighten-2" v-on="on">mdi-flag-checkered</v-icon>
                    </template>
                    Submitted to current game
                  </v-tooltip>
                </template>
                <template #[`item.points`]="{ item }">
                  <v-tooltip left open-delay="500" :disabled="item.rankingCompensationPoints === 0">
                    <template #activator="{ props: on }">
                      <span :class="{'compensating-points': item.rankingCompensationPoints > 0}" v-on="on">
                        {{ item.points }}
                      </span>
                    </template>
                    <div class="text-right">
                      Includes {{ item.rankingCompensationPoints }}
                      {{ item.rankingCompensationPoints === 1 ? 'point' : 'points' }} to compensate<br>
                      missed or unusually bad games. These points<br>
                      disappear over time until the end of the season.
                    </div>
                  </v-tooltip>
                </template>
                <!-- no data -->
                <template #no-data>
                  <div class="mb-2 mt-5">
                    <template v-if="!(sortedMembers.length > 0)">
                      <img class="ori-image" src="../../../../shared/images/ori_think.png" alt=""><br>no players
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
            </rando-throttled-spinner>
          </v-card>

          <!-- SEASON START -->
          <v-card
            v-if="leagueSeason?.nextContinuationAt && !(leagueSeason.games.length > 0)"
            class="season-start-container text-center pa-5"
            style="grid-row: 1"
          >
            <div class="background-overlay"/>
            <div class="gradient-overlay"/>
            <div class="starting-date-content">
              <div>Starting at</div>
              <span class="starting-date">
                                {{ leagueSeason?.nextContinuationAt }}
                <!-- TODO format data
                 {{ formatDateEpoch(leagueSeason?.nextContinuationAt, 'P p') }} -->
              </span>
              <div>
                <template v-if="isJoined">Be prepared!</template>
                <template v-else>Join the hype!</template>
              </div>
            </div>
          </v-card>

          <!-- CURRENT GAME -->
          <wotw-league-game-card
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
                :sort-by="[{ key: 'gameNumber'}]"
                :item-class="() => 'cursor-pointer'"
                :mobile-breakpoint='0'
                @click:row="(game: LeagueGameInfo) => openGamePage(game.id)"
              >
                <!-- items -->
                <template #[`item.gameNumber`]="{ item }">#{{ item.gameNumber }}</template>
                <template #[`item.userMetadata.ownSubmission.rankingData.rank`]="{ item }">
                  <rando-place-badge
                    v-if="item.userMetadata?.ownSubmission?.rankingData?.rank ?? false"
                    :size="40"
                    :place="item.userMetadata?.ownSubmission?.rankingData?.rank"
                  />
                  <div v-else>-</div>
                </template>
                <template #[`item.userMetadata.ownSubmission.rankingData.points`]="{ item }">
                  <template v-if="item.userMetadata?.ownSubmission?.rankingData?.points ?? 0 >= 0">
                    <wotw-league-points-view
                      :ranking-data="item.userMetadata?.ownSubmission?.rankingData"
                      :discard-worst-games-count="leagueSeason.discardWorstGamesCount"
                    />
                  </template>
                  <template v-else>
                    <div>-</div>
                  </template>
                </template>
                <template #[`item.userMetadata.ownSubmission.rankingData.time`]="{ item }">
                  <wotw-league-time-view
                    :time="item.userMetadata?.ownSubmission?.rankingData?.time"
                    :original-time="item.userMetadata?.ownSubmission?.rankingData?.originalTime"
                  />
                </template>
              </v-data-table>
            </v-card>
          </div>
        </div>
      </div>
    </rando-throttled-spinner>
    <v-dialog v-model="showSeasonInfo" max-width="800">
      <v-card class="pa-5">
        <h2 class="text-center mb-3">Info</h2>
        <div v-if="leagueSeason">
          <div class="dialog-html" v-html="longDescriptionHtml"/>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showSeasonRules" max-width="800">
      <v-card class="pa-5">
        <h2 class="text-center mb-3">Rules</h2>
        <div v-if="leagueSeason">
          <div class="dialog-html" v-html="rulesHtml"/>
        </div>
        <div v-if="!isJoined && canJoin" class="justify-end dialog-buttons mt-3">
          <v-btn color="accent" depressed @click="joinSeason()">
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
            ref="trainingSeedLaunchButton"
            x-large
            depressed
            color="accent"
            :loading="trainingSeedLoading"
            @click="launchTrainingSeed"
          >
            <img class="launch-icon" src="@shared/images/launch.png" alt="">Launch
          </v-btn
          >
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
  import type {
    LeagueGameInfo,
    LeagueGameSubmissionInfo,
    LeagueSeasonInfo,
    LeagueSeasonMembershipInfo
  } from "@shared/types/league";
  import type {UserInfo} from "@shared/types/user";
  import type {DataTableHeader} from "vuetify/framework";

  const trainingSeedLaunchButton = useTemplateRef('trainingSeedLaunchButton')

  const axios = useAxios()
  const route = useRoute()
  const router = useRouter()
  const isElectron = useIsElectron()
  const seasonId = route.params.seasonId
  const leagueSeason = ref<LeagueSeasonInfo | null>(null)
  const currentGameSubmissions = ref<LeagueGameSubmissionInfo[] | null>(null)
  const actionLoading = ref(false)
  const showSeasonInfo = ref(false)
  const showSeasonRules = ref(false)
  const seasonLinkCopied = ref(false)
  const refreshTimeoutId = null
  const lurkTimeoutId = ref<NodeJS.Timeout | null>(null)
  const joinButtonLurking = ref(false)
  const trainingSeedDialogOpen = ref(false)
  const trainingSeedLoading = ref(false)
  const gameHeaders: DataTableHeader[] = [
    {title: 'Number', value: 'gameNumber', align: 'center'},
    {title: 'Your Rank', value: 'userMetadata.ownSubmission.rankingData.rank', align: 'start'},
    {title: 'Your Points', value: 'userMetadata.ownSubmission.rankingData.points', align: 'start'},
    {title: 'Your Time', value: 'userMetadata.ownSubmission.rankingData.time', align: 'end'},
  ]

  const isLoggedIn = ref(false) // TODO post user handling
  const user = ref<UserInfo | null>(null) // TODO post user handling

  const isJoined = computed(() => {
    return leagueSeason.value !== null && leagueSeason.value.memberships.some((m) => m.user.id === user.value?.id)
  })
  const canJoin = computed(() => {
    return leagueSeason.value !== null && leagueSeason.value.canJoin && isLoggedIn && !isJoined.value
  })
  const seasonEnded = computed(() => {
    return (
      leagueSeason.value !== null && leagueSeason.value.currentGameId === null && leagueSeason.value.games?.length > 0
    )
  })
  const sortedMembers = computed(() => {
    return (
      leagueSeason.value?.memberships?.toSorted((a, b) => {
        if (a.points === b.points) {
          return a.user.name.localeCompare(b.user.name)
        }
        return b.points - a.points
      }) ?? []
    )
  })
  const rulesHtml = computed(() => {
    // TODO markdown
    return leagueSeason.value?.rulesMarkdown // renderMarkdown(leagueSeason.value?.rulesMarkdown)
  })
  const longDescriptionHtml = computed(() => {
    // TODO markdown
    return leagueSeason.value?.longDescriptionMarkdown // renderMarkdown(leagueSeason.value?.longDescriptionMarkdown)
  })
  const currentGame = computed(() => {
    return leagueSeason.value?.games?.find((g) => g.isCurrent) ?? null
  })
  const pastGames = computed(() => {
    return leagueSeason.value?.games?.filter((g) => !g.isCurrent) ?? []
  })
  const memberHeaders = computed(() => {

    const headers: DataTableHeader[] = [
      {title: 'Rank', value: 'rank', align: 'center', width: 0},
      {title: 'Player', value: 'user.name',},
    ]
    if (currentGame.value) {
      headers.push({
        title: `Game #${currentGame.value.gameNumber}`,
        value: 'currentGame.submitted',
        align: 'center',
      })
    }
    headers.push({title: 'Points', value: 'points', align: 'start'})
    return headers
  })

  onMounted(() => {
    lurkAfterRandomTime()

    if (isElectron) {
      // TODO post WebSocket
      // electronApi.on('league.runSubmitted', () => {
      //   loadSeason()
      // })
    }
  })
  onUnmounted(() => {
    if (refreshTimeoutId !== null) {
      clearTimeout(refreshTimeoutId)
    }

    if (lurkTimeoutId.value !== null) {
      clearInterval(lurkTimeoutId.value)
    }
  })

  const lurkAfterRandomTime = (() => {
    lurkTimeoutId.value = setTimeout(() => {
      if (joinButtonLurking.value) {
        joinButtonLurking.value = false
      } else if (canJoin.value) {
        joinButtonLurking.value = true
      }

      lurkAfterRandomTime()
    }, 2000 + Math.random() * 10000)
  })
  const loadSeason = (async () => {
    try {
      leagueSeason.value = (await axios.get(`/league/seasons/${seasonId}`)).data
      if (leagueSeason.value?.currentGameId) {
        currentGameSubmissions.value = (await axios.get(`/league/games/${leagueSeason.value.currentGameId}/submissions`)).data
      }
    } catch (error) {
      console.error(error)
    }
  })
  const joinSeason = (async () => {
    actionLoading.value = true

    try {
      leagueSeason.value = (await axios.post(`/league/seasons/${route.params.seasonId}/membership`)).data
    } catch (e) {
      console.error(e)
    }

    setTimeout(() => {
      // TODO CONFETTI
      // confettiFromElement(this.$refs.leaderboardTitle, {
      //   startVelocity: 30,
      // })
    }, 75)

    showSeasonRules.value = false
    actionLoading.value = false
  })
  const openGamePage = (async (gameId: number) => {
    await router.push({name: 'league-game-gameId', params: {gameId}})
  })
  const copySeasonLink = (async () => {
    // TODO copy season link
    // const url = new URL(`/league/seasons/${leagueSeason.value?.id}`, $paths.UI_BASE_URL)
    // await navigator.clipboard.writeText(url.toString())
    // seasonLinkCopied.value = true
    //
    // setTimeout(() => {
    //   seasonLinkCopied.value = false
    // }, 3000)
  })
  const launchTrainingSeed = (async () => {
    trainingSeedLoading.value = true

    // TODO after seedgen
    // const uiSeedGenerator = new UISeedGenerator(this.$axios)
    // const response = await this.$axios.$post(`/league/seasons/${this.leagueSeason.id}/training-seed`)
    //
    // const seedgenResponse = uiSeedGenerator.getSeedgenResponse(response)
    //
    // await seedgenResponse.electronApi.downloadSeed({
    //   setTo: true,
    // })
    // await this.$store.dispatch('electron/launch')

    // TODO postponed until multiverse games can be "offline" or seasons are online
    // const multiverseId = await this.$axios.$post('/multiverses', {
    //   seedId: response.result.seedId,
    // })
    // await this.$router.push({ name: 'game-multiverseId', params: { multiverseId } })

    // TODO CONFETTI
    // confettiFromElement(trainingSeedLaunchButton, {
    //   startVelocity: 30,
    // })
    trainingSeedLoading.value = false
    trainingSeedDialogOpen.value = false
  })

  watch(() => route.params.seasonId, () => {
    loadSeason()
  }, {immediate: true})
  watch(canJoin, (value) => {
    if (!value) {
      joinButtonLurking.value = false
    }
  }, {immediate: true})

</script>

<style scoped lang="scss">
  .background-image-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;

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

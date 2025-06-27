<template>
  <v-container>
    <rando-throttled-spinner>
      <div v-if="leagueSeason !== null && leagueGame !== null">
        <h1 class="text-center mt-12">Game #{{ leagueGame.gameNumber }}</h1>
        <h2 class="text-center mb-6">{{ leagueSeason.name }}</h2>
        <div class="d-flex justify-center align-center">
          <v-tooltip v-if="!isElectron" bottom>
            <template #activator="{ props: on }">
              <v-btn color="accent" size="x-large" v-on="on" @click="openInLauncher">
                <v-icon start>mdi-launch</v-icon>
                Open in Launcher
              </v-btn>
            </template>
            <span><kbd>Ctrl</kbd> + Click to close this window</span>
          </v-tooltip>
          <v-btn v-else-if="!didSubmit && canSubmit" size="x-large" color="accent" :loading="launching"
                 @click="launchGame()">
            <img class="launch-icon" src="@shared/images/launch.png" alt="">
            Launch
          </v-btn>
          <v-btn
            v-else-if="!leagueGame.isCurrent"
            size="x-large"
            color="accent"
            :loading="launching"
            @click="replayGame()"
          >
            <img class="launch-icon" src="@shared/images/launch.png" alt="">
            Play for Fun
          </v-btn>
        </div>
        <div class="submissions-container mt-7">
          <div class="d-flex mb-1">
            <v-btn variant="text" :to="{ name: 'league-seasons-seasonId', params: { seasonId: leagueGame.seasonId } }">
              <v-icon>mdi-arrow-left-thin</v-icon>
              Season
            </v-btn>
            <v-spacer/>
            <template v-if="didSubmit">
              <v-btn v-if="!ownSubmissionHasVideoUrl" variant="text" @click="showVideoSubmission = true">
                <v-icon start>mdi-video-outline</v-icon>
                Attach my Video
              </v-btn>
              <v-btn v-else variant="text" @click="removeVideoUrlConfirmationDialogOpen = true">
                <v-icon start>mdi-video-off-outline</v-icon>
                Remove my Video
              </v-btn>
            </template>
          </div>
          <v-card class="pt-5">
            <h2 class="text-center mb-5">Submissions</h2>
            <rando-throttled-spinner>
              <v-data-table
                v-if="sortedSubmissions"
                class="submissions"
                :headers="submissionHeaders"
                :items="sortedSubmissions"
                disable-pagination
                hide-default-footer
                :mobile-breakpoint="0"
                disable-sort
                :item-class="(item: LeagueGameSubmissionInfo) => (item.membership.user.id === user?.id ? 'row-highlighting' : '')"
              >
                <!-- Items -->
                <template #[`item.rankingData.rank`]="{ item }">
                  <rando-place-badge
                    v-if="item.rankingData?.rank ?? false"
                    :size="40"
                    :place="item.rankingData?.rank"
                    light-circle
                  />
                </template>
                <template #[`item.membership.user.name`]="{ item }">
                  <div class="text-no-wrap">
                    <rando-discord-avatar :user="item.membership.user" class="mr-1"/>
                    {{ item.membership.user.name }}
                  </div>
                </template>
                <template #[`item.rankingData.time`]="{ item }">
                  <wotw-league-time-view
                    :time="item.rankingData?.time ?? null"
                    :original-time="item.rankingData?.originalTime"/>
                </template>
                <template #[`item.rankingData.points`]="{ item }">
                  <template v-if="!leagueGame.isCurrent">
                    <wotw-league-points-view
                      :ranking-data="item.rankingData"
                      :discard-worst-games-count="leagueSeason.discardWorstGamesCount"
                    />
                  </template>
                  <template v-else>
                    <div>-</div>
                  </template>
                </template>
                <template #[`item.traceMap`]="{ item }">
                  <v-btn v-if="item.hasSaveFile" icon @click="openTraceMap(item)">
                    <v-icon size="small">mdi-map</v-icon>
                  </v-btn>
                </template>
                <template #[`item.rankingData.videoUrl`]="{ item }">
                  <v-btn v-if="item.rankingData?.videoUrl" icon @click="openVideo(item.rankingData.videoUrl)">
                    <v-icon>mdi-video-outline</v-icon>
                  </v-btn>
                  <v-btn v-else-if="item.membership.user.id === user?.id" icon @click="showVideoSubmission = true">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </template>

                <!-- no data -->
                <template #no-data>
                  <template v-if="canSubmit">Be the first to submit!</template>
                  <template v-else-if="leagueGame.isCurrent">No submittions available yet</template>
                  <template v-else>
                    <div class="mb-2 mt-5">
                      <img class="ori-image" src="@shared/images/ori_thumb.png" alt=""><br><b>no submittions</b>
                    </div>
                  </template>
                </template>
              </v-data-table>

              <!-- footer -->
              <div v-if="leagueGame.isCurrent && !didSubmit && gameSubmissions?.length > 0" class="text-center mt-3">
                <div class="background--text text--lighten-5">
                  <template v-if="canSubmit">Submit to see the times from other players</template>
                  <template v-else>Results will be visible once game has been closed</template>
                </div>
              </div>
            </rando-throttled-spinner>
          </v-card>
        </div>
      </div>
    </rando-throttled-spinner>

    <!-- submit video -->
    <v-dialog v-model="showVideoSubmission" max-width="600">
      <v-card class="pa-5">
        <h2 class="mb-3">Submit video of your run</h2>
        <p>
          You can attach a video of your run for other finished players to watch.<br>
          Currently, only videos on YouTube and Twitch are supported. If you want to use another video platform, let us
          know!
        </p>
        <v-text-field
          v-model="videoUrlForSubmission"
          class="mb-4"
          label="Video URL"
          :error-messages="errorMessage !== null ? [errorMessage] : []"
        />
        <div class="justify-end dialog-buttons">
          <v-btn
            :disabled="!videoUrlForSubmission"
            :loading="videoUrlSubmissionLoading"
            depressed
            color="accent"
            @click="submitVideoUrl(videoUrlForSubmission)"
          >Submit
          </v-btn
          >
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="removeVideoUrlConfirmationDialogOpen" width="unset" max-width="600">
      <v-card class="pa-5">
        <v-col>
          <v-row>
            <div class="mb-4 confirmation-dialog-info">
              <div class="mb-2">Are you sure, you want to remove your video?</div>
            </div>
          </v-row>
          <v-row justify="end" class="dialog-buttons">
            <v-btn variant="text" :disabled="videoUrlSubmissionLoading"
                   @click="removeVideoUrlConfirmationDialogOpen = false"
            >No
            </v-btn
            >
            <v-btn depressed color="red" :loading="videoUrlSubmissionLoading" @click="submitVideoUrl(null)"
            >Yes
            </v-btn
            >
          </v-row>
        </v-col>
      </v-card>
    </v-dialog>

    <v-dialog v-model="developerModeWarningOpen" max-width="500">
      <v-card class="pa-5">
        <h3 class="mb-2">Developer Mode Enabled</h3>
        <div class="mb-5">You are unable to launch League Games while Developer Mode is enabled!</div>
        <div class="justify-center dialog-buttons">
          <v-btn size="x-large" color="accent" :loading="launching" @click="disableDevModeAndLaunchGame()">
            <img class="launch-icon" src="@shared/images/launch.png" alt="">
            Disable Dev Mode and Launch
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts" setup>
  // import {mapGetters, mapState} from 'vuex'
  // import {EventBus} from '~/assets/lib/EventBus'

  import type {LeagueSeasonInfo, LeagueGameInfo, LeagueGameSubmissionInfo} from "@shared/types/league"
  import type {UserInfo} from "@shared/types/user"
  import {useHead} from "#imports"
  import type {DataTableHeader} from "vuetify/framework"

  const {axios, catchAxiosErrors} = useAxios()
  const route = useRoute()
  const isElectron = useIsElectron()
  const electronApi = useElectronApi()

  const user = ref<UserInfo | null>(null) // TODO user

  const leagueSeason = ref<LeagueSeasonInfo | null>(null)
  const leagueGame = ref<LeagueGameInfo | null>(null)
  const gameSubmissions = ref<LeagueGameSubmissionInfo[]>([])
  const actionLoading = ref(false)
  const showVideoSubmission = ref(false)
  const videoUrlForSubmission = ref(null)
  const videoUrlSubmissionLoading = ref(false)
  const removeVideoUrlConfirmationDialogOpen = ref(false)
  const errorMessage = ref('')
  const developerModeWarningOpen = ref(false)

  const launching = false // TODO replace with electron states

  const title = computed(() => {
    return leagueGame.value?.gameNumber && leagueSeason.value?.name
      ? `Game ${leagueGame.value.gameNumber} - ${leagueSeason.value?.name} - League`
      : 'Game - League'
  })


  // ...mapGetters('user', ['isLoggedIn']),
  // ...mapState('multiverseState', ['multiverses']), TODO multiverses
  // ...mapState('electron', ['launching', 'settings']), TODO launch seed
  const canSubmit = computed(() => {
    return leagueGame.value !== null && leagueGame.value.userMetadata?.canSubmit
  })
  const ownSubmission = computed(() => {
    return gameSubmissions.value?.find((s) => s.membership.user.id === user.value?.id) ?? null
  })
  const didSubmit = computed(() => {
    return ownSubmission.value !== null
  })
  const multiverse = computed(() => {
    return multiverses[leagueGame.value?.multiverseId]
  })
  const sortedSubmissions = computed(() => {
    return gameSubmissions.value?.toSorted((a, b) => {
      const aTime = a.rankingData?.time ?? Number.MAX_VALUE
      const bTime = b.rankingData?.time ?? Number.MAX_VALUE

      if (aTime === bTime) {
        return a.membership.user.name.localeCompare(b.membership.user.name)
      }

      return aTime - bTime
    })
  })
  const hasWorldWithCurrentUser = computed(() => {
    if (!multiverse) {
      return false
    }

    return multiverse.universes.some((u) =>
      u.worlds.some((w) => w.memberships.find((m) => m.user.id === user.value?.id)),
    )
  })
  const launcherUrl = computed(() => {
    return `ori-rando://league-game/${leagueGame.value?.id}`
  })
  const submissionHeaders = computed(() => {
    const headers: DataTableHeader[] = []

    if (leagueGame.value?.isCurrent === false) {
      headers.push({title: 'Rank', value: 'rankingData.rank', align: 'center'})
    }

    headers.push(
      {title: 'Player', value: 'membership.user.name'},
      {title: 'Time', value: 'rankingData.time', align: 'end'},
    )

    if (leagueGame.value?.isCurrent === false) {
      headers.push({title: 'Points', value: 'rankingData.points', align: 'end'})
    }
    if (isElectron) {
      headers.push({title: 'Route', value: 'traceMap', align: 'center', width: 0})
    }

    headers.push({title: 'Video', value: 'rankingData.videoUrl', align: 'center', width: 0})

    return headers
  })
  const ownSubmissionHasVideoUrl = computed(() => {
    return ownSubmission.value?.rankingData?.videoUrl !== null
  })

  onMounted(() => {
    if (isElectron) {
      // TODO post hooks
      // window.electronApi.on('league.runSubmitted', () => {
      //   this.loadGame()
      //   this.$store.dispatch('league/updatePendingGames')
      // })
    }
  })

  const loadGame = (async () => {
    try {
      leagueGame.value = (await axios.get(`/league/games/${route.params.gameId}`)).data
      leagueSeason.value = (await axios.get(`/league/seasons/${leagueGame.value?.seasonId}`)).data
      gameSubmissions.value = (await axios.get(`/league/games/${route.params.gameId}/submissions`)).data
    } catch (e) {
      console.error(e)
    }
  })
  const launchGame = (async () => {
    // TODO launch league game
    // if (settings['Flags.Dev'] && !this.user.isDeveloper) {
    //   this.developerModeWarningOpen = true
    //   return
    // }
    //
    // await this.$store.dispatch('multiverseState/fetchMultiverse', this.leagueGame.multiverseId)
    //
    // // create world if it doesn't exist
    // if (!this.hasWorldWithCurrentUser) {
    //   const universeId = null
    //   await this.$axios.post(`/multiverses/${this.leagueGame.multiverseId}/${universeId}/worlds`)
    // }
    //
    // // launch
    // this.$store.dispatch('electron/launch', {
    //   newGameSeedSource: `server:${this.leagueGame.multiverseId}`,
    // })
  })
  const replayGame = (async () => {
    // TODO launch game
    // const multiverse = await this.$axios.$get(`/multiverses/${this.leagueGame.multiverseId}`)
    // if (!multiverse.seedId) {
    //   EventBus.$emit('notification', {
    //     message: 'An error occured while trying to download the seed',
    //     color: 'error',
    //   })
    //   return
    // }
    // const seed = await this.$axios.$get(`/seeds/${multiverse.seedId}`)
    //
    // const url = `${this.$axios.defaults.baseURL}/world-seeds/${seed.worldSeedIds[0]}/file`
    // const fileName = `${seed.worldSeedIds}.wotwr`
    //
    // try {
    //   await window.electronApi.invoke('launcher.downloadSeedFromUrl', {
    //     url,
    //     fileName,
    //   })
    //
    //   await $store.dispatch('electron/launch')
    // } catch (e) {
    //   console.error(e)
    // }
  })
  const disableDevModeAndLaunchGame = (async () => {
    developerModeWarningOpen.value = false
    await electronApi.invoke('settings.setSetting', {key: 'Flags.Dev', value: false})
    await launchGame()
  })
  const openInLauncher = ((event: KeyboardEvent) => {
    window.open(launcherUrl.value, '_self')

    if (event.ctrlKey) {
      setTimeout(() => {
        window.close()
      }, 500)
    }
  })
  const submitVideoUrl = (async (videoUrl = null) => {
    const submissionId = ownSubmission.value?.id

    if (!submissionId) {
      return
    }

    videoUrlSubmissionLoading.value = true

    await catchAxiosErrors(
      async () => {
        await axios.post(`/league/submissions/${submissionId}/video-url`, {videoUrl})
        gameSubmissions.value = await axios.get(`/league/games/${route.params.gameId}/submissions`)
        showVideoSubmission.value = false
        removeVideoUrlConfirmationDialogOpen.value = false
        errorMessage.value = ''
      },
      async (e) => {
        errorMessage.value = e.response?.data as string ?? 'Unknown Error'
        console.error(e)
      },
    )

    videoUrlSubmissionLoading.value = false
  })
  const openTraceMap = ((submission: LeagueGameSubmissionInfo) => {
    // TODO post trace map
    // store.commit('electron/setTraceMapSource', {
    //   multiverseId: leagueGame.value?.multiverseId,
    //   gameType: 'league',
    //   leagueGameId: leagueGame.value?.id,
    //   submissionId: submission.id,
    //   user: submission.membership.user,
    // })
    // store.commit('electron/setShowTraceMap', true)
  })
  const openVideo = ((videoUrl: string) => {
    if (isElectron) {
      electronApi.invoke('launcher.openUrl', {url: videoUrl})
    } else {
      window.open(videoUrl)
    }
  })

  watch(() => route.params.gameId, () => {
    loadGame()
  }, {immediate: true})

  useHead({title})
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
    max-width: 650px;
    margin: 0 auto;
  }

  .submissions {
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

  .ori-image {
    height: 2em;
  }

  .confirmation-dialog-info label {
    display: block;
  }

  .dialog-buttons {
    display: flex;
    flex-wrap: wrap;
    flex-grow: 0;
    justify-content: center;
    gap: 0.4em;
  }
</style>

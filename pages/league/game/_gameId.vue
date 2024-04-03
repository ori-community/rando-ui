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
          <div class="d-flex">
            <v-btn
              class="mb-1"
              text
              :to="{ name: 'league-seasons-seasonId', params: { seasonId: leagueGame.seasonId } }"
            >
              <v-icon>mdi-arrow-left-thin</v-icon>
              Season
            </v-btn>
            <v-spacer />
            <template v-if="didSubmit">
              <v-btn v-if="!ownSubmittionHasVideoUrl" text @click="showVideoSubmission = true">
                <v-icon left>mdi-video</v-icon>
                Submit Video
              </v-btn>
              <v-btn v-else text @click="removeVideoUrlConfirmationDialogOpen = true">
                <v-icon left>mdi-video-off-outline</v-icon>
                Remove Video
              </v-btn>
            </template>
          </div>
          <v-card class="pt-5">
            <h2 class="text-center mb-5">Submissions</h2>
            <throttled-spinner>
              <v-data-table
                v-if="sortedSubmissions"
                class="submissions"
                :headers="submissionHeaders"
                :items="sortedSubmissions"
                disable-pagination
                hide-default-footer
                disable-sort
                :item-class="(item) => (item.membership.user.id === user?.id ? 'row-highlighting' : '')"
              >
                <!-- Items -->
                <template #item.rankingData.rank="{ item }">
                  <place-badge
                    v-if="item.rankingData?.rank ?? null !== null"
                    :size="40"
                    :place="item.rankingData.rank"
                    light-circle
                  />
                </template>
                <template #item.membership.user.name="{ item }">
                  <discord-avatar :user="item.membership.user" class="mr-1" />
                  {{ item.membership.user.name }}
                </template>
                <template #item.rankingData.time="{ item }">
                  <template v-if="item.rankingData?.time">{{ formatTime(item.rankingData?.time) }} </template>
                  <template v-else>-</template>
                </template>
                <template #item.rankingData.points="{ item }">
                  <v-tooltip bottom :disabled="!item.rankingData?.discarded">
                    <template #activator="{ on }">
                      <div v-if="!leagueGame.isCurrent" v-on="on">
                        <span :class="item.rankingData?.discared ? 'discarded' : ''">{{
                          item.rankingData?.points
                        }}</span>
                      </div>
                      <div v-else>-</div>
                    </template>
                    <span v-if="leagueSeason.discardWorstGamesCount > 1"
                      >Player's {{ leagueSeason.discardWorstGamesCount }} worst races get discarded</span
                    >
                    <span v-else>Player's worst race gets discarded</span>
                  </v-tooltip>
                </template>
                <template #item.rankingData.videoUrl="{ item }">
                  <v-btn icon v-if="item.rankingData?.videoUrl" @click="openVideo(item.rankingData.videoUrl)">
                    <v-icon>mdi-video-outline</v-icon>
                  </v-btn>
                </template>

                <!-- no data -->
                <template #no-data>
                  <template v-if="canSubmit">Be the first to submit!</template>
                  <template v-else-if="leagueGame.isCurrent">No submittions available yet</template>
                  <template v-else>
                    <div class="mb-2 mt-5">
                      <img class="ori-image" src="~/assets/images/ori_thumb.png" /><br /><b>no submittions</b>
                    </div>
                  </template>
                </template>
              </v-data-table>

              <!-- footer -->
              <div v-if="leagueGame.isCurrent && !didSubmit && gameSubmissions.length > 0" class="text-center mt-3">
                <v-label>
                  <template v-if="canSubmit">Submit to see the times form other players</template>
                  <template v-else>Results will be visible once game has been closed</template>
                </v-label>
              </div>
            </throttled-spinner>
          </v-card>
        </div>
      </div>
    </throttled-spinner>

    <!-- submit video -->
    <v-dialog v-model="showVideoSubmission" max-width="600">
      <v-card class="pa-5">
        <h2 class="mb-3">Submit video of your run</h2>
        <p>
          You can attach a video of your run for other finished players to watch.<br />
          Currently, only videos on YouTube and Twitch are supported. If you want to use another video platform, let us
          know!
        </p>
        <v-text-field class="mb-4" v-model="videoUrlForSubmittion" label="Video URL" hide-details />
        <div class="justify-end buttons">
          <v-btn :disabled="!videoUrlForSubmittion" color="accent" @click="submitVideoUrl(videoUrlForSubmittion)">Submit</v-btn>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="removeVideoUrlConfirmationDialogOpen" width="unset" max-width="600">
      <v-card class="pa-5">
        <v-col>
          <v-row>
            <div class="mb-4 confirmation-dialog-info">
              <v-label class="mb-2">Are you sure, you want to remove your video?</v-label>
            </div>
          </v-row>
          <v-row justify="end" class="buttons">
            <v-btn text @click="removeVideoUrlConfirmationDialogOpen = false">No</v-btn>
            <v-btn depressed color="accent" @click.native="submitVideoUrl(null)">Yes</v-btn>
          </v-row>
        </v-col>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex'
  import { formatTime } from '~/assets/lib/formatTime'
  import { isElectron } from '~/assets/lib/isElectron'
  import { EventBus } from '~/assets/lib/EventBus'

  export default {
    data: () => ({
      leagueSeason: null,
      leagueGame: null,
      gameSubmissions: [],
      actionLoading: false,
      showVideoSubmission: false,
      videoUrlForSubmittion: null,
      removeVideoUrlConfirmationDialogOpen: false,
    }),
    computed: {
      ...mapState('user', ['user']),
      ...mapGetters('user', ['isLoggedIn']),
      ...mapState('multiverseState', ['multiverses']),
      isElectron,
      canSubmit() {
        return this.leagueGame !== null && this.leagueGame.userMetadata?.canSubmit
      },
      ownSubmission() {
        return this.gameSubmissions?.find((s) => s.membership.user.id === this.user?.id)
      },
      didSubmit() {
        return this.ownSubmission !== null
      },
      multiverse() {
        return this.multiverses[this.leagueGame.multiverseId]
      },
      sortedSubmissions() {
        return this.gameSubmissions.toSorted((a, b) => {
          const aTime = a.rankingData?.time ?? Number.MAX_VALUE
          const bTime = b.rankingData?.time ?? Number.MAX_VALUE

          if (a.Time === bTime) {
            return a.membership.user.name.localeCompare(b.membership.user.name)
          }

          return aTime - bTime
        })
      },
      hasWorldWithCurrentUser() {
        if (!this.multiverse) {
          return false
        }

        return this.multiverse.universes.some((u) =>
          u.worlds.some((w) => w.memberships.find((m) => m.user.id === this.user?.id)),
        )
      },
      launcherUrl() {
        return `ori-rando://league-game/${this.leagueGame.id}`
      },
      submissionHeaders() {
        const headers = []

        if (this.leagueGame?.isCurrent === false) {
          headers.push({ text: 'Rank', value: 'rankingData.rank', align: 'center' })
        }

        headers.push(
          { text: 'Player', value: 'membership.user.name' },
          { text: 'Time', value: 'rankingData.time', align: 'right' },
        )

        if (this.leagueGame?.isCurrent === false) {
          headers.push({ text: 'Points', value: 'rankingData.points', align: 'right' })
        }

        headers.push({ text: 'Video', value: 'rankingData.videoUrl', align: 'center', width: 0 })

        return headers
      },
      ownSubmittionHasVideoUrl(){
        return this.ownSubmission?.rankingData?.videoUrl !== null
      }
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
        if (!this.hasWorldWithCurrentUser) {
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
      async submitVideoUrl(videoUrl = null) {
        const submissionId = this.ownSubmission?.id
        if (!submissionId) {
          EventBus.$emit('notification', {
            message: 'Own submission not found.',
            color: 'error',
          })
          console.error('Own submission not found')
          return
        }

        try {

          await this.$axios.$post(`/league/submissions/${submissionId}/video-url`, { videoUrl })
          this.gameSubmissions = await this.$axios.$get(`/league/games/${this.$route.params.gameId}/submissions`)
          this.showVideoSubmission = false
          this.removeVideoUrlConfirmationDialogOpen = false

        } catch (e) {

          EventBus.$emit('notification', {
            message: String(e.response.data),
            color: 'error',
          })
          console.error(e)

        }
      },
      openVideo(videoUrl) {
        if (this.isElectron) {
          window.electronApi.invoke('launcher.openUrl', { url: videoUrl })
        } else {
          window.open(videoUrl)
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

  .buttons {
    display: flex;
    flex-wrap: wrap;
    flex-grow: 0;
    justify-content: center;
    gap: 0.4em;
  }
</style>

<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="9" order-md="0" order="1">
        <template v-if="inOfflineMode">
          <div class="pa-6 text-center">
            <v-icon size="64">mdi-cloud-off-outline</v-icon>
            <div>
              You appear to be offline<br/>
              <span class="text-lurk">(or we broke the server)</span>
            </div>
          </div>
        </template>
        <template v-else>
          <v-scroll-x-transition>
            <div v-if="multiverses?.length > 0">
              <div>
                <h2 class="d-inline-block mb-3">Last Games</h2>
                <nuxt-link class="pl-3 pt-2 more-label text-decoration-none" to="/my-games">More Games</nuxt-link>
              </div>

              <div class="last-games-container">
                <v-card
                  v-for="multiverse in multiverses.slice(0, visiblePastGamesCount)"
                  :key="multiverse.id"
                  :to="{ name: 'game-multiverseId', params: { multiverseId: multiverse.id } }"
                  class="pa-4"
                  variant="plain"
                  border="sm"
                  hover
                >
                  <div class="multiverse-id-container">
                    <div>
                      <span class="hashtag">#</span><span class="multiverse-id">{{ multiverse.id }}</span>
                    </div>
                  </div>
                  <div class="pt-3">
                    <rando-discord-avatar v-for="member in multiverse.members" :key="member.id" :user="member"/>
                  </div>
                </v-card>
              </div>
              <v-divider class="my-6"/>
            </div>
          </v-scroll-x-transition>
          <v-scroll-x-transition>
            <div>
              <div v-if="leagueHelper.pendingGamesCount.value > 0">
                <h2 class="mb-2">Your Pending Games</h2>
                <div class="seasons-container">
                  <wotw-league-game-card
                    v-for="pendingGame in leagueHelper.pendingGames.value"
                    :key="pendingGame.game.id"
                    :game="pendingGame.game"
                    :season="pendingGame.season"
                    :game-count="pendingGame.season.gameCount"
                    :playable-until="pendingGame.season.nextContinuationAt"
                    :member-count="pendingGame.season.memberships?.length"
                  />
                </div>
              </div>
              <div
                v-if="combinedLeagueSeasons !== null && combinedLeagueSeasons.length > 0"
                class="mb-6 mt-2"
              >
                <div>
                  <h2 class="d-inline-block mb-3">League Seasons</h2>
                  <nuxt-link class="pl-3 pt-2 more-label text-decoration-none" to="/league/seasons">Learn more
                  </nuxt-link>
                </div>

                <div class="seasons-container">
                  <wotw-league-season-card
                    v-for="combination in combinedLeagueSeasons"
                    :key="combination.season.id"
                    :season="combination.season"
                    :show-time="true"
                    flat
                    :upcoming-tag="combination.state == 'upcoming'"
                    :checkmark-overlay="combination.checkmark"
                  />
                </div>

                <v-divider class="my-6"/>
              </div>
            </div>
          </v-scroll-x-transition>
          <v-scroll-x-transition>
            <!--            TODO Changelog  -->
            <div>Hier könnte Ihr Changelog stehen</div>
            <!--            <div v-if="upcomingLeagueSeasons !== null && !!visibleReleases">-->
            <!--              <v-card v-for="release in visibleReleases" :key="release.id" class="release mb-2">-->
            <!--                <v-card-title class="d-block">-->
            <!--                  Version {{ release.name }}-->
            <!--                  <v-chip v-if="isNewVersion(release.name)" class="ml-2" small color="accent">New</v-chip>-->
            <!--                </v-card-title>-->
            <!--                <v-card-text class="release-changelog">-->
            <!--                  <div v-html="release.bodyHtml" />-->
            <!--                  <div class="d-flex justify-end">-->
            <!--                    <div class="d-flex align-end">-->
            <!--                      <template v-if="!!getSetupAssetFromRelease(release)">-->
            <!--                        <v-btn-->
            <!--                          :disabled="updateDownloading"-->
            <!--                          text-->
            <!--                          x-small-->
            <!--                          class="install-button mr-3"-->
            <!--                          @click="downloadAndInstallUpdate(release)"-->
            <!--                        >-->
            <!--                          <template v-if="isNewVersion(release.name)">Install</template>-->
            <!--                          <template v-else-if="release.name === currentVersion">Re-install</template>-->
            <!--                          <template v-else>Downgrade</template>-->
            <!--                        </v-btn>-->
            <!--                        <div class="text-caption grey&#45;&#45;text mr-3 d-inline">-->
            <!--                          {{ getSetupAssetFromRelease(release).download_count }}-->
            <!--                          <v-icon small color="grey">mdi-download-outline</v-icon>-->
            <!--                        </div>-->
            <!--                      </template>-->
            <!--                      <span class="text-caption grey&#45;&#45;text">-->
            <!--                        {{ formatDateRelative(release.published_at) }}-->
            <!--                      </span>-->
            <!--                    </div>-->
            <!--                  </div>-->
            <!--                </v-card-text>-->
            <!--              </v-card>-->
            <!--            </div>-->
          </v-scroll-x-transition>
        </template>
      </v-col>
      <v-col cols="12" md="3" order-md="1" order="0">
        <div class="sticky">

          <!--                  TODO VERSION CONTROL-->
          <v-card :class="updateAvailable ? `bg-warning-darken-1` : `bg-background-lighten-1`" class="pa-4">
            <!--            <h3>Version: {{ currentVersion }}</h3>-->
            <h3>Version: yes</h3>
            <!--            <template v-if="updateDownloading">-->
            <!--              Downloading {{ !!updateReleaseName ? `version ${updateReleaseName}` : `update` }}...-->
            <!--              <v-progress-linear class="mt-3" :value="updateDownloadProgress"/>-->
            <!--            </template>-->
            <!--            <template v-else-if="currentVersion === 'develop'">-->
            <!--              You are running a development build. Download the latest stable version to get automatic updates.-->
            <!--            </template>-->
            <!--            <template v-else-if="updateAvailable">-->
            <!--              Version {{ latestVisibleVersion }} is available!-->
            <!--              <v-btn class="mt-3" depressed block @click="downloadAndInstallUpdate()">Install update</v-btn>-->
            <!--            </template>-->
            <!--            <template v-else> You are running the latest version.</template>-->
          </v-card>

          <div class="buttons mt-6">
            <rando-launch-button icon="mdi-leek" :show-confetti="true" label="Lauch" @click="launch()">
              <v-tooltip location="bottom" activator="parent">This is a hint</v-tooltip>
            </rando-launch-button>
            <rando-launch-button icon="mdi-seed" :show-confetti="true" label="Saatauswahl"
                                 @click="selectAndLaunchFile()">
              <v-tooltip location="bottom" activator="parent">This is also a hint</v-tooltip>
            </rando-launch-button>
          </div>
          <!--          <v-card v-if="newGameSeedSource !== null" class="pa-2 text-center top-border-radius-0 current-seed-path">-->
          <!--            {{ newGameSeedSourceDisplayString }}-->
          <!--          </v-card>-->

          <!--                    <v-card class="mt-6 pa-4 text-center did-you-know" ripple @click="rerollDidYouKnow">-->
          <!--                      <h4 class="font-weight-regular mb-1 text-h6">-->
          <!--                        Did you know?-->
          <!--                      </h4>-->
          <!--                      <div v-html="randomDidYouKnowHtml"></div>-->
          <!--                      <img class="ori-think" src="@/assets/images/ori_think.png" alt="Ori Think" />-->
          <!--                    </v-card>-->

          <v-btn variant="text" block class="mt-3" @click="openWiki">
            <v-icon left>mdi-book-outline</v-icon>
            Read the Wiki
          </v-btn>

          <!--          TODO Button for new directories (appdata / install dir), maybe-->
          <div class="py-4 text-center hoverable">
            <v-btn variant="plain" density="comfortable" icon @click="openSeedsDirectory">
              <v-icon>mdi-folder-eye-outline</v-icon>
              <v-tooltip location="bottom" activator="parent">
                <span>Open seeds directory</span>
              </v-tooltip>
            </v-btn>
            <v-btn variant="plain" density="comfortable" icon @click="openRandomizerDirectory">
              <v-icon>mdi-folder-cog-outline</v-icon>
              <v-tooltip location="bottom" activator="parent">
                <span>Open randomizer directory</span>
              </v-tooltip>
            </v-btn>
            <v-btn
              variant="plain"
              density="comfortable"
              icon
              :loading="supportBundleLoading"
              @click="createSupportBundle"
            >
              <v-icon>mdi-bug-outline</v-icon>
              <v-tooltip location="bottom" activator="parent">
                <span>Create support bundle</span>
              </v-tooltip>
            </v-btn>
            <v-btn variant="plain" density="comfortable" icon @click="openGitHub">
              <v-icon>mdi-github</v-icon>
              <v-tooltip location="bottom" activator="parent">
                <span>GitHub</span>
              </v-tooltip>
            </v-btn>
            <!--            TODO DISCORD ICON-->
            <v-btn variant="plain" density="comfortable" icon @click="openDiscord">
              <v-icon>$si-discord</v-icon>
              <v-tooltip location="bottom" activator="parent">
                <span>Discord</span>
              </v-tooltip>
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import type {LeagueSeasonInfo} from "@shared/types/league"
  import type {MultiverseMetadataInfo} from "@shared/types/http-api";

  const {axios, catchAxiosErrors} = useAxios()
  const userStore = useUserStore()
  const electronApi = useElectronApi()
  const {launch} = useLauncherHelper()
  const {xs, mdAndDown} = useDisplay()
  const leagueHelper = useLeagueHelper()

  const multiverses = ref<MultiverseMetadataInfo[]>([])
  const upcomingLeagueSeasons = ref<LeagueSeasonInfo[] | null>(null)
  const activeLeagueSeasons = ref<LeagueSeasonInfo[] | null>(null)

  const inOfflineMode = ref(false)    // TODO check if releases can be fetched
  const updateAvailable = ref(false)  // TODO Version Control

  onMounted(async () => {
    await catchAxiosErrors(
      async () => {
        multiverses.value = (await axios.get("/multiverses/own")).data
      },
      async (e) => {
        console.error(e)
      },
    )

    try {
      upcomingLeagueSeasons.value = await (await axios.get('/league/seasons/upcoming')).data
      activeLeagueSeasons.value = await (await axios.get('/league/seasons/active')).data
    } catch (e) {
      upcomingLeagueSeasons.value = null
      activeLeagueSeasons.value = null
      console.error(e)
    }
    await leagueHelper.updatePendingGames()
  })

  const visiblePastGamesCount = computed(() => {
    if (xs.value) {
      return 1
    }
    if (mdAndDown.value) {
      return 2
    }
    return 3
  })
  const combinedLeagueSeasons = computed(() => {
    // return (upcomingLeagueSeasons.value || []).concat(activeLeagueSeasons.value || []) as LeagueSeasonInfo[]
    return [
      ...(activeLeagueSeasons.value ?? []).map(season => ({
        season,
        state: 'active',
        checkmark: !leagueHelper.pendingGames.value?.some(game => game.season.id === season.id),
      })),
      ...(upcomingLeagueSeasons.value ?? []).map(season => ({
        season,
        state: 'upcoming',
        checkmark: season.memberships?.some((m) => m.user.id === userStore.user?.id)
      })),
    ] as { season: LeagueSeasonInfo, state: 'active' | 'upcoming', checkmark: boolean }[]
  })

  const selectAndLaunchFile = (async () => {
    const newPath = await electronApi?.systemDialogs.pickFile.query({
      filters: [{name: 'Seedfiles', extensions: ['wotwr']}],
    })
    if (newPath) {
      launch(`file:${newPath}`)
    }
  })

  const openWiki = (() => {
    window.electronApi.invoke('launcher.openUrl', {url: 'https://wiki.orirando.com'})
  })
  const openRandomizerDirectory = (() => {
    window.electronApi.invoke('launcher.openRandomizerDirectory')
  })
  const openSeedsDirectory = (() => {
    window.electronApi.invoke('launcher.openSeedsDirectory')
  })
  const openGitHub = (() => {
    window.electronApi.invoke('launcher.openUrl', {url: 'https://github.com/ori-community'})
  })
  const openDiscord = (() => {
    window.electronApi.invoke('launcher.openUrl', {url: 'https://discord.gg/SUS57PWWnA'})
  })

</script>

<style lang="scss" scoped>
  .buttons {
    display: flex;
    flex-direction: column;
    gap: 0.6em;
  }

  .last-games-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, 250px);
    grid-auto-flow: column;
    gap: 0.75em;
  }

  .more-label {
    opacity: 0.5;
    transition: opacity 200ms;

    &:hover {
      opacity: 1;
    }
  }

  .seasons-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    grid-auto-rows: 1fr;
    gap: 0.75em;
  }

  .multiverse-id-container {
    display: flex;
    flex-direction: column;
    line-height: 1;

    .hashtag {
      font-size: 1em;
    }

    .multiverse-id {
      font-size: 1.5em;
      font-weight: 900;
    }
  }

  .sticky {
    position: sticky;
    top: 1em;
  }

  .did-you-know {
    font-weight: 300;
    font-size: 1.1em;

    .ori-think {
      height: 2em;
      position: absolute;
      pointer-events: none;
      opacity: 0.5;
      bottom: 0;
      right: 0;
    }

    :deep(strong) {
      font-weight: 700;
      color: var(--v-accent-lighten5)
    }

    :deep(p) {
      margin-bottom: 0;
    }
  }

</style>

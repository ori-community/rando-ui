<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="9" order-md="0" order="1">
        <template v-if="!isOnline">
          <div class="pa-6 text-center">
            <v-icon size="64">mdi-cloud-off-outline</v-icon>
            <div>
              You appear to be offline<br>
              <span class="text-lurk">(or we broke the server)</span>
            </div>
          </div>
        </template>
        <template v-else>
          <wotw-recent-games-view>
            <v-divider class="my-6" />
          </wotw-recent-games-view>
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
                  <nuxt-link class="pl-3 pt-2 more-label text-decoration-none" to="/league/seasons">
                    Learn more
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
                <!-- TODO divider not shown if only pending games are listed and not upcoming seasons-->
                <v-divider class="my-6"/>
              </div>
            </div>
          </v-scroll-x-transition>
          <v-scroll-x-transition>
            <wotw-releases-changelog
              v-if="availableReleases !== null"
              :releases="availableReleases"
              @install-release="installUpdate"
            />
          </v-scroll-x-transition>
        </template>
      </v-col>
      <v-col cols="12" md="3" order-md="1" order="0">
        <div class="sticky">
          <div class="buttons">
            <rando-launch-button :subtitle="displayedNewGameSeedSource" :show-confetti="true" label="Launch" @click="launch()"/>

            <v-card :loading="isFetchingReleases" :class="availableUpdate !== null ? `bg-warning-darken-1` : `bg-background-lighten-1`">
              <v-expand-transition>
                <div v-if="availableUpdate !== null">
                  <div class="pa-4">
                    <h3>Version {{ availableUpdate.version }} is available!</h3>
                    <v-btn variant="flat" block class="mt-3" @click="installUpdate(availableUpdate)">Install Update</v-btn>
                  </div>
                </div>
                <div v-else>
                  <div class="pa-4">
                    <h3>Version: {{ currentVersion }}</h3>
                    You are running the latest version.
                  </div>
                </div>
              </v-expand-transition>
            </v-card>

            <wotw-trivia />
          </div>

          <v-btn variant="text" block class="mt-3" @click="openWiki">
            <v-icon start>mdi-book-outline</v-icon>
            Read the Wiki
          </v-btn>

          <div class="py-4 text-center hoverable">
            <v-btn variant="plain" density="comfortable" icon @click="openSeedsDirectory">
              <v-icon>mdi-folder-file-outline</v-icon>
              <v-tooltip location="bottom" activator="parent">
                <span>Open seeds directory</span>
              </v-tooltip>
            </v-btn>
            <v-btn variant="plain" density="comfortable" icon @click="openUserDataDirectory">
              <v-icon>mdi-folder-cog-outline</v-icon>
              <v-tooltip location="bottom" activator="parent">
                <span>Open user data directory</span>
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
            <v-btn variant="plain" density="comfortable" icon @click="openDiscord">
              <v-icon>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.1.1 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.1 16.1 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02M8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12m6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12"
                  />
                </svg>
              </v-icon>
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
  import {useOnline} from "@vueuse/core"

  const {axios} = useAxios()
  const userStore = useUserStore()
  const electronApi = useElectronApi()
  const {launch, newGameSeedSource} = useLauncherHelper()
  const leagueHelper = useLeagueHelper()
  const currentVersion = ref(await electronApi?.updater.getVersion.query())
  const upcomingLeagueSeasons = ref<LeagueSeasonInfo[] | null>(null)
  const activeLeagueSeasons = ref<LeagueSeasonInfo[] | null>(null)
  const supportBundleLoading = ref(false)
  const isOnline = useOnline()
  const {availableReleases, availableUpdate, isFetchingReleases} = useReleases()

  onMounted(async () => {
    await loadUserData()
  })

  watch(() => userStore.user, () => {
    loadUserData()
  })

  const displayedNewGameSeedSource = computed(() => {
    if (newGameSeedSource.value === null) {
      return null
    }

    const colonIndex = newGameSeedSource.value.indexOf(":")

    if (colonIndex === -1) {
      return newGameSeedSource.value
    }

    const sourceType = newGameSeedSource.value.slice(0, colonIndex)
    const sourceValue = newGameSeedSource.value.slice(colonIndex + 1)

    switch (sourceType) {
      case "file":
        return sourceValue.slice(sourceValue.replaceAll("\\", "/").lastIndexOf("/") + 1)
      case "server":
        return `Online Game ${sourceValue}`
    }

    return newGameSeedSource.value
  })

  const combinedLeagueSeasons = computed(() => {
    return [
      ...(activeLeagueSeasons.value ?? []).map(season => ({
        season,
        state: "active",
        checkmark: !leagueHelper.pendingGames.value?.some(game => game.season.id === season.id),
      })),
      ...(upcomingLeagueSeasons.value ?? []).map(season => ({
        season,
        state: "upcoming",
        checkmark: season.memberships?.some((m) => m.user.id === userStore.user?.id),
      })),
    ] as { season: LeagueSeasonInfo, state: "active" | "upcoming", checkmark: boolean }[]
  })

  async function loadUserData() {
    try {
      upcomingLeagueSeasons.value = await (await axios.get("/league/seasons/upcoming")).data
      activeLeagueSeasons.value = await (await axios.get("/league/seasons/active")).data
    } catch (e) {
      upcomingLeagueSeasons.value = null
      activeLeagueSeasons.value = null
      console.error(e)
    }

    await leagueHelper.updatePendingGames()
  }

  async function openWiki() {
    await electronApi?.shell.openUrl.query({url: "https://wiki.orirando.com"})
  }

  async function openUserDataDirectory() {
    await electronApi?.shell.showWellKnownPathInExplorer.query({wellKnownPath: "user-data"})
  }

  async function openSeedsDirectory() {
    await electronApi?.shell.showWellKnownPathInExplorer.query({wellKnownPath: "seeds"})
  }

  async function openGitHub() {
    await electronApi?.shell.openUrl.query({url: "https://github.com/ori-community"})
  }

  async function openDiscord() {
    await electronApi?.shell.openUrl.query({url: "https://discord.gg/SUS57PWWnA"})
  }

  async function createSupportBundle() {
    if (!electronApi) {
      return
    }

    supportBundleLoading.value = true

    try {
      await electronApi.supportBundle.createAndShowInExplorer.query()
    } catch (e) {
      console.error(e)
    }

    supportBundleLoading.value = false
  }

  async function installUpdate(release: Release) {
    if (!electronApi) {
      return
    }

    await electronApi.updater.downloadAndInstallUpdate.query({
      windowsInstallerUrl: release.urls.windows.installer,
      linuxAppImageUrl: release.urls.linux.appimage,
      linuxPortableUrl: release.urls.linux.portable,
    })
  }
</script>

<style lang="scss" scoped>
  .buttons {
    display: flex;
    flex-direction: column;
    gap: 0.6em;
  }

  .seasons-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    grid-auto-rows: 1fr;
    gap: 0.75em;
  }

  .sticky {
    position: sticky;
    top: 24px;
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

  .hidden {
    visibility: hidden;
  }

  .ori-image {
    height: 3em;
  }
</style>

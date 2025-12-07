<template>
  <div>
    <v-container>
      <div>
        <div class="d-flex justify-center align-center mt-12 mb-6">
          <v-btn class="ml-2" :disabled="!canLock || lockGameLoading" icon variant="text" @click="toggleGameLock">
            <v-icon :class="multiverse?.locked ? 'lock-animation' : 'unlock-animation'"
            >{{ multiverse?.locked ? 'mdi-lock' : 'mdi-lock-open-outline' }}
            </v-icon>
            <v-tooltip location="top" open-delay="500" activator="parent">
              <span v-if="canLock">{{ multiverse?.locked ? 'Unlock' : 'Lock' }} this game</span>
              <span v-else>This game is {{ multiverse?.locked ? 'locked' : 'unlocked' }}</span>
            </v-tooltip>
          </v-btn>
          <h1 class="text-center mx-4">Game <small>#</small>{{ multiverse.id }}</h1>
          <v-btn icon :disabled="gameLinkCopied" variant="text" @click="copyGameLink">
            <v-icon>{{ gameLinkCopied ? 'mdi-clipboard-check-outline' : 'mdi-link' }}</v-icon>
            <v-tooltip location="top" open-delay="500" activator="parent">
              <span>Copy game link</span>
            </v-tooltip>
          </v-btn>
        </div>

        <div class="text-center my-6">
          <v-btn v-if="!isElectron" color="accent" size="x-large" @click="openInLauncher">
            <v-icon start>mdi-launch</v-icon>
            Open in Launcher
            <v-tooltip location="bottom" activator="parent">
              <span><kbd>Ctrl</kbd> + Click to close this window</span>
            </v-tooltip>
          </v-btn>
          <v-btn
            v-else-if="!isSpectating"
            :disabled="!ownWorld"
            size="x-large"
            color="accent"
            :loading="launching"
            @click="launch()">
            <img
              class="launch-icon"
              :class="{ disabled: !ownWorld }"
              src="@shared/images/launch.png"
              alt=""
            >
            Launch
            <v-tooltip location="bottom" activator="parent">
            <span v-if="!multiverseReady || multiverse.universes.length > 0"
            >Create or join a world to launch the game</span
            >
              <span v-else>Create a universe to launch the game</span>
            </v-tooltip>
          </v-btn>

          <div class="mt-4">
            <v-btn v-if="canEnableRaceMode" variant="text" @click="enableRaceModeDialogOpen = true">
              <v-icon start>mdi-timer-play-outline</v-icon>
              Enable race mode
            </v-btn>

            <v-btn v-if="canForfeit" variant="text" @click="forfeitDialogOpen = true">
              <v-icon start>mdi-cancel</v-icon>
              Forfeit
            </v-btn>

            <v-btn v-if="canDownloadSpoiler" variant="text" @click="downloadSpoilerDialogOpen = true">
              <v-icon start>mdi-eye-outline</v-icon>
              View Spoiler
            </v-btn>
          </div>
        </div>

        <rando-throttled-spinner>
          <div v-if="userStore.isLoggedIn && multiverseReady">
            <div class="text-center mb-3">
              <wotw-race-timer
                v-if="isRaceRunning"
                :starting-at="normalGameHandlerState.raceStartingAt"
                :finished-time="normalGameHandlerState.finishedTime ?? null"
              />
              <template v-else-if="isRaceModeEnabled">
                <h3>Waiting for all players to be ready...</h3>
                <div>Start a new save file to signal yourself ready.</div>
              </template>
            </div>

            <div :class="{ 'two-columns': hasRace }">
              <wotw-multiverse-view
                :is-spectating="isSpectating"
                :multiverse="multiverse"
                :race-starting-at="normalGameHandlerState?.raceStartingAt"
                :player-in-game-times="normalGameHandlerState?.playerInGameTimes"
                :player-finished-times="normalGameHandlerState?.playerFinishedTimes"
                :world-finished-times="normalGameHandlerState?.worldFinishedTimes"
                :universe-finished-times="normalGameHandlerState?.universeFinishedTimes"
              />
              <wotw-race-result-view v-if="hasRace" :race="multiverse.race"/>
            </div>

            <div v-if="devtoolsEnabled" class="mt-5">
              <v-card class="pa-4">
                <h3>Dispatch custom event</h3>
                <v-text-field v-model="devDebugEventName" label="Event"/>

                <div class="d-flex">
                  <v-spacer/>
                  <v-btn depressed color="accent" @click="dispatchDebugEvent"> Dispatch</v-btn>
                </div>
              </v-card>
            </div>
          </div>
          <div v-if="userStore.user === null" class="text-center">
            <v-alert class="d-inline-block" color="error darken-3">
              <template v-if="isOBS">
                <b>DO NOT</b> add this page to OBS directly. Please use the "Embed" feature above the board.
              </template>
              <template v-else> You need to be logged in to view this game.</template>
            </v-alert>
          </div>
        </rando-throttled-spinner>
      </div>
    </v-container>

    <wotw-bingo-board-view
      v-if="userStore.isLoggedIn && multiverseReady && !!bingoBoard"
      :multiverse="multiverse"
      :bingo-universes="bingoUniverses"
      :is-spectating="isSpectating"
      :own-world="ownWorld"
    />

    <v-dialog v-model="enableRaceModeDialogOpen" :persistent="enableRaceModeLoading" max-width="500">
      <v-card class="pa-5 relative">
        <h2>Enable race mode</h2>

        Players will be blocked from starting new games until everyone is ready. To signal yourself ready, select an
        empty save file and choose the difficulty.<br/>
        Once the race starts, the game will be locked.

        <div class="d-flex justify-end">
          <v-btn :disabled="enableRaceModeLoading" class="mr-1" text @click="enableRaceModeDialogOpen = false">
            Cancel
          </v-btn>
          <v-btn :loading="enableRaceModeLoading" color="accent" depressed @click="enableRaceMode"
          >Enable race mode
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="forfeitDialogOpen" :persistent="forfeitLoading" max-width="400">
      <v-card class="pa-5 relative">
        <h2>Forfeit</h2>

        Forfeiting from the game makes all players in your universe forfeit from this race.

        <div class="d-flex justify-end">
          <v-btn :disabled="forfeitLoading" class="mr-1" text @click="forfeitDialogOpen = false"> Cancel</v-btn>
          <v-btn :loading="forfeitLoading" color="error" depressed @click="forfeit">Forfeit</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="downloadSpoilerDialogOpen" :persistent="downloadSpoilerLoading" max-width="400">
      <v-card class="pa-5 relative">
        <h2>View Spoiler</h2>

        You can view the spoiler for this seed. Note that <b>all players can see that you viewed the spoiler.</b>

        <div class="d-flex justify-end mt-4">
          <v-btn :disabled="downloadSpoilerLoading" class="mr-1" text @click="downloadSpoilerDialogOpen = false">
            Cancel
          </v-btn>
          <v-btn :loading="downloadSpoilerLoading" color="error" depressed @click="downloadSpoiler"
          >Show Spoiler
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="viewSpoilerDialogOpen" transition="dialog-bottom-transition" fullscreen>
      <v-sheet v-if="hasSeed" class="fill-height d-flex flex-column">
        <v-toolbar color="secondary">
          <v-toolbar-title>Spoiler</v-toolbar-title>
          <div class="ml-3">
            <v-tooltip v-for="user in multiverse.seedSpoilerDownloadedBy ?? []" :key="user.id" bottom>
              <span>{{ user.name }}</span>
              <template #activator="{ on }">
                <span v-on="on">
                  <rando-discord-avatar :user="user"/>
                </span>
              </template>
            </v-tooltip>
          </div>
          <v-spacer/>
          <div class="mr-3">
            <v-text-field
              ref="spoilerSearchInput"
              v-model="spoilerSearchQuery"
              solo
              flat
              placeholder="Search..."
              hide-details
            />
          </div>
          <v-btn icon @click="viewSpoilerDialogOpen = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <div ref="spoilerText" class="spoiler-text pa-3">{{ spoilerText }}</div>
      </v-sheet>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
  // TODO OBS
  // import { applyTransparentWindowStyles, isOBS } from '~/assets/lib/obs'
  import {Proto} from '@shared/proto'
  import {
    MultiverseInfoMessage_GameHandlerType as GameHandlerType,
    NormalGameHandlerState
  } from "@shared/proto/messages";

  // TODO this still needed?
  // import { hasOwnProperty } from '~/assets/lib/hasOwnProperty'

  const userStore = useUserStore()
  const isElectron = useIsElectron()
  const electronApi = useElectronApi()
  const {axios} = useAxios()
  const route = useRoute()
  const authStore = useAuthStore()
  const {multiverse, seed, bingoBoard, bingoUniverses} = await useMultiverse(Number(route.params.multiverseId))

  const loading = ref(false)
  const gameLinkCopied = ref(false)
  const multiverseReady = ref(false)
  const downloadSpoilerDialogOpen = ref(false)
  const downloadSpoilerLoading = ref(false)
  const viewSpoilerDialogOpen = ref(false)
  const spoilerText = ref('')
  const spoilerSearchQuery = ref('')
  const enableRaceModeDialogOpen = ref(false)
  const enableRaceModeLoading = ref(false)
  const forfeitDialogOpen = ref(false)
  const forfeitLoading = ref(false)
  const seedgenResultVisible = ref(false)
  const hideSeedgenResultCompletely = ref(false)
  const lockGameLoading = ref(false)
  const devDebugEventName = ref('')
  const showBoard = ref(false)
  const title = computed(() => {
    return `Game ${multiverse.value.id}`
  })

  const canCreateUniverse = computed(() => {
    return multiverse.value.universes.length < 8
  })
  const ownWorld = computed(() => {


    for (const universe of multiverse.value.universes) {
      const world = universe.worlds.find(w => w.memberships.find(m => m.user?.id === userStore.user?.id))

      if (world) {
        return world
      }
    }

    return null
  })

  const isSpectating = computed(() => {
    if (!multiverse.value || !userStore.user) {
      return false
    }

    return multiverse.value.spectators.some((s) => s.id === userStore.user?.id)
  })
  const launcherUrl = computed(() => {
    return `ori-rando://game/${multiverse.value.id}`
  })
  const isBingoBoardOverlay = computed(() => {
    return route.query.isBingoBoardOverlay === 'true'
  })
  const isPlayer = computed(() => {
    return (
      multiverse?.value.universes.some(
        (u) => u.worlds.some((w) => w.memberships.some((m) => m.user?.id === userStore.user?.id))
      ) ?? false
    )
  })
  const canLock = computed(() => {
    return isPlayer.value && multiverse.value.isLockable
  })

  const normalGameHandlerState = computed(() => {
    if (!multiverseReady.value || multiverse.value.gameHandlerType !== GameHandlerType.Normal) {
      return null
    }

    return Proto.NormalGameHandlerState.decode(multiverse.value.gameHandlerClientInfo)
  })
  const isRaceRunning = computed(() => {
    if (!normalGameHandlerState.value) {
      return false
    }

    return !!normalGameHandlerState.value.raceStartingAt
  })
  const isRaceModeEnabled = computed(() => {
    if (!normalGameHandlerState.value) {
      return false
    }

    return normalGameHandlerState.value.raceModeEnabled
  })
  const hasRace = computed(() => {
    return !!multiverse?.value.race
  })
  const canEnableRaceMode = (() => {

      if (!normalGameHandlerState.value) {
        return false
      }

      return !normalGameHandlerState.value.raceModeEnabled && isPlayer.value
    }
  )
  const ownWorldFinished = computed(() => {
    if (!normalGameHandlerState.value || !ownWorld.value) {
      return false
    }

    return (
      normalGameHandlerState.value.raceStarted &&
      isPlayer.value &&
      ownWorld.value.id in normalGameHandlerState.value.worldFinishedTimes
    )
  })
  const canForfeit = computed(() => {
    if (!normalGameHandlerState.value || !userStore.user) {
      return false
    }

    return (
      normalGameHandlerState.value.raceStarted &&
      isPlayer.value &&
      !(userStore.user.id in normalGameHandlerState.value.playerFinishedTimes)
    )
  })
  const hasSeed = computed(() => {
    return seed.value
  })
  const canDownloadSpoiler = computed(() => {
    return hasSeed.value && (!isRaceRunning.value || ownWorldFinished.value)
  })
  // TODO was userLoaded. Verify
  watch(() => userStore.isLoggedIn, async () => {
    if (route.query.jwt) {
      await authStore.setJwt(route.query.jwt.toString())
      await userStore.updateUser()
    }
  }, {immediate: true})
  watch(() => userStore.isLoggedIn, async (value) => {
    if (value) {
      // TODO multiverseState
      // await this.$store.dispatch('multiverseState/fetchMultiverse', multiverse.value.id)
      // await this.$store.dispatch('multiverseState/connectMultiverse', {
      //   multiverseId: multiverse.value.id,
      // })
      multiverseReady.value = true
    }
  }, {immediate: true})

  // TODO save bingo board settings
  // watch(() => boardSettings.value, (value) => {
  //   window.localStorage.setItem('boardSettings', JSON.stringify(value))
  // }, {deep: true})

  // TODO Is this solved?
  // Probably solved?
  // 'multiverse.universes'() { // TO DO: Temporary workaround for orirando/wotw-server#5
  //   if (this.multiverse.bingoBoard) {
  //     this.$store.dispatch('multiverseState/fetchBingoBoard', this.multiverseId)
  //   }
  // },
  watch(() => multiverseReady.value, (value) => {
    if (value && bingoBoard.value) {
      // TODO OBS
      // this.$nextTick(() => {
      //   if (isOBS() || this.isBingoBoardOverlay) {
      //     applyTransparentWindowStyles()
      //     this.centerBoard()
      //   }
      // })
    }
  }, {immediate: true})

  watch(() => spoilerSearchQuery.value, (value) => {
    const range = document.createRange()

    const offset = spoilerText.value.toLowerCase().indexOf(value.toLowerCase())

    if (offset > 0) {
      // TODO fix spoilertext
      // range.setStart(this.$refs.spoilerText.childNodes[0], offset)
      // this.$refs.spoilerText.scrollTop = Math.max(0, this.$refs.spoilerText.scrollTop + range.getBoundingClientRect()?.top - 100)
    }
  })
  onMounted(() => {
    try {
      // TODO load bingo board settings
      // boardSettings.value = {
      //   ...boardSettings.value,
      //   ...JSON.parse(window.localStorage.getItem('boardSettings')),
      // }
    } catch (e) {
      console.error('Could not load board settings', e)
    }

    // TODO whats this?
    //  this.$store.dispatch('time/syncTime')
  })

  const copyGameLink = (async () => {
    const url = new URL(`/game/${multiverse.value.id}`, this.$paths.UI_BASE_URL)
    await navigator.clipboard.writeText(url.toString())
    gameLinkCopied.value = true

    setTimeout(() => {
      gameLinkCopied.value = false
    }, 3000)
  })


  const openInLauncher = ((event: KeyboardEvent) => {
    window.open(launcherUrl.value, '_self')

    if (event.ctrlKey) {
      setTimeout(() => {
        window.close()
      }, 500)
    }
  })
  const dispatchDebugEvent = (async () => {
    try {
      await axios.post(`/multiverses/${multiverse.value.id}/debug-event/${devDebugEventName.value}`)
    } catch (e) {
      console.error(e)
    }
  })
  const dispatchEvent = (async (event: string) => {
    try {
      await axios.post(`/multiverses/${multiverse.value.id}/event/${event}`)
    } catch (e) {
      console.error(e)
    }
  })
  const toggleGameLock = (async () => {
    if (lockGameLoading.value) {
      return
    }

    lockGameLoading.value = true

    try {
      await axios.post(`/multiverses/${multiverse.value.id}/toggle-lock`)
    } catch (e) {
      console.error(e)
    }

    lockGameLoading.value = false
  })
  const launch = (async () => {
    if (ownWorld.value?.seedId) {
      // TODO awaiting launcher
      // await electronApi.invoke('launcher.setNewGameSeedSource', `server:${multiverse.value.id}`)
    }
    // TODO awaiting launcher
    // await this.$store.dispatch('electron/launch')
  })
  const enableRaceMode = (async () => {
    enableRaceModeLoading.value = true
    await dispatchEvent('enableRaceMode')
    enableRaceModeLoading.value = false
    enableRaceModeDialogOpen.value = false
  })
  const forfeit = (async () => {
    forfeitLoading.value = true
    await dispatchEvent('forfeit')
    forfeitLoading.value = false
    forfeitDialogOpen.value = false
  })
  const downloadSpoiler = (async () => {
    downloadSpoilerLoading.value = true
    spoilerText.value = await axios.get(`/seeds/${multiverse.value.seedId}/spoiler`, {
      headers: {
        Accept: 'text/plain',
      },
    })
    downloadSpoilerLoading.value = false
    downloadSpoilerDialogOpen.value = false
    viewSpoilerDialogOpen.value = true
  })


  useHead({title})

</script>

<style lang="scss" scoped>
  .two-columns {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1em;

    @media (max-width: 1264px) {
      grid-template-columns: 100%;
      grid-auto-flow: row;
    }
  }

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

  .relative {
    .close-button {
      position: absolute;
      right: 1em;
      top: 1em;
      z-index: 10;
    }
  }

  @keyframes lock-animation {
    0% {
      transform: translateY(0);
    }

    25% {
      transform: translateY(5px);
    }

    100% {
      transform: translateY(0);
    }
  }

  @keyframes unlock-animation {
    0% {
      transform: translateY(0);
    }

    25% {
      transform: translateY(-5px);
    }

    100% {
      transform: translateY(0);
    }
  }

  .lock-animation {
    animation: lock-animation 0.25s forwards ease-out;
  }

  .unlock-animation {
    animation: unlock-animation 0.25s forwards ease-out;
  }

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

  .spoiler-text {
    font-family: Consolas, 'Fira Code', monospace;
    overflow-y: scroll;
    flex-grow: 1;
    white-space: pre;
  }
</style>

<template>
  <div class="fill-height" :class="{ 'electron-draggable': isElectron }">
    <v-fade-transition mode="out-in">
      <div
        v-if="connected && receivedPacket"
        ref="tracker"
        key="tracker"
        class="tracker-container"
        :class="{ done: false }"
      >
        <div class="tracker">
          <wotw-tracker-skills-resources-timer
            :seed-flags="seedFlags"
            :tracked-values="trackedValues"
            :heart-count="heartCount"
            :show-willow-hearts="showWillowHearts"
            :time="displayedTime"
            :show-timer="showTimer"
          />
          <wotw-tracker-teleporters v-if="showTeleporters" :tracked-values="trackedValues"/>
        </div>
        <div class="done-label">
          <div ref="hype" class="hype">
            <img src="@shared/images/ori_hype.png" alt="">
          </div>
        </div>
      </div>
      <div
        v-else-if="!hideConnectingScreen"
        key="connecting"
        class="fill-height d-flex flex-column align-center justify-center"
      >
        <div class="pb-4">
          <template v-if="!receivedPacket"> Waiting for game...</template>
          <template v-else-if="connectedOnce"> Connection lost. Trying to reconnect...</template>
          <template v-else> Waiting for connection...</template>
        </div>
        <v-progress-circular indeterminate/>
      </div>
    </v-fade-transition>
  </div>
</template>

<script setup lang="ts">

  definePageMeta({
    layout: 'plain'
  })
  const route = useRoute()
  const isElectron = useIsElectron()
  let settingsStore = null
  let settings = null

  if (isElectron) {
    settingsStore = useSettingsStore()
    settings = storeToRefs(settingsStore)
  }

  // import { decodePacket } from '~/assets/proto/ProtoUtil'
  // import { ResetTracker, TrackerFlagsUpdate, TrackerTimerStateUpdate, TrackerUpdate } from '~/assets/proto/messages'
  // import { applyTransparentWindowStyles, isOBS } from '~/assets/lib/obs'
  // import { isElectron } from '~/assets/lib/isElectron'
  // import { confettiFromElement } from '~/assets/lib/confettiFromElement'
  // import { hasSettings } from '~/assets/lib/hasSettings'

  const connected = ref(false)
  const receivedPacket = ref(false)
  const connectedOnce = ref(false)
  const hideConnectingScreen = ref(false)
  const trackedValues = ref<{ [key: string]: number }>({})
  const seedFlags = ref([])
  const showDone = ref(true)
  const timerUpdateIntervalId = ref(null)
  const timerStartTimestamp = ref(0)
  const displayedTime = ref(0)
  const inGameTime = ref(0)
  const asyncLoadingTime = ref(0)
  const timerShouldRun = ref(false)
  const appliedDelay = ref(0)
  const delayQueued = ref(false)

  useHead({title: 'Item Tracker'})

  //   computed: { // TODO tracker source for remote
  //     trackerSource() {
  //       const source = this.$route.query.source
  //
  //       if (!source) {
  //         return 'ws://127.0.0.1:31410'
  //       }
  //
  //       if (/^wss?:\/\//.test(source)) {
  //         return source
  //       }
  //
  //       return `${this.$paths.WS_BASE_URL}/remote-tracker/${source}`
  //     },
  const isOBS = (() => {
    return false
  }) // TODO isOBS
  const showWillowHearts = computed(() => {
    const showWillowHearts = route.query.hearts === 'true' || (settings?.LocalTrackerShowWillowHearts.value)
    const hideHeartsUntilFirstOne =
      route.query.hideHeartsUntilFirst === 'true' || (settings?.LocalTrackerHideHeartsUntilFirstHeart.value)

    return showWillowHearts && (!hideHeartsUntilFirstOne || heartCount.value > 0)
  })
  const showTimer = computed(() => {
    return route.query.timer === 'true' || (isElectron && !!settings?.LocalTrackerShowTimer.value)
  })
  const showTeleporters = computed(() => {
    return route.query.teleporters === 'true'
  })
  const showErrors = computed(() => {
    return route.query.errors === 'true'
  })
  const heartCount = computed(() => {
    const hearts = [
      'heart_wind_spinners',
      'heart_spinning_lasers',
      'heart_upper_heart',
      'heart_burrow_heart',
      'heart_willow_laser',
      'heart_redirect_puzzle',
      'heart_boulder_escape',
      'heart_lower_left',
    ]
    let count = 0

    for (const heart of hearts) {
      if (trackedValues.value[heart]) {
        count++
      }
    }

    return count
  })
  const requestedDelay = computed(() => {
    return Number(route.query.delay ?? 0)
  })
  watch(() => connected.value, (newValue) => {
    if (!newValue && isOBS() && !showErrors.value) {
      setTimeout(() => {
        hideConnectingScreen.value = true
      }, 5000)
    } else if (newValue) {
      hideConnectingScreen.value = false
    }
  }, {immediate: true})
  watch(() => trackedValues.value.game_finished, (value) => {
    if (value) {
      setTimeout(() => {
        // confettiFromElement(this.$refs.hype, {
        //   startVelocity: 30,
        // }) TODO CONFETTI
      }, 75)

      showDone.value = true
      setTimeout(() => {
        showDone.value = false
      }, 4000)
    }
  })
  watch(() => inGameTime.value, () => {
    updateTimerStartTimestamp()
  })
  watch(() => asyncLoadingTime.value, () => {
    updateTimerStartTimestamp()
  })
  watch(() => timerShouldRun.value, () => {
    updateTimerStartTimestamp()
  })
  watch(() => requestedDelay.value, () => {
    updateTimerStartTimestamp()
  })

  onMounted(() => {
    //     if (isOBS() || isElectron()) { TODO isOBS
    if (isElectron) {
      // applyTransparentWindowStyles() TODO why transparent?

      document.documentElement.style.overflow = 'hidden'
    }

    timerStartTimestamp.value = (Date.now() / 1000.0)
    connect()
  })
  onUnmounted(() => {
    tryDisconnect()
  })
  //   methods: {
  const connect = (() => { // TODO connect tracker
    //       if (!this.trackerSource) {
    //         return
    //       }
    //
    //       console.log(`tracker: Trying to connect to ${this.trackerSource}...`)
    //
    //       this.tryDisconnect()
    //       this.ws = new WebSocket(this.trackerSource)
    //
    //       this.ws.addEventListener('close', () => {
    //         console.log(`tracker: Connection lost. Will retry in 2s...`)
    //         this.connected = false
    //         this.receivedPacket = false
    //         setTimeout(this.connect, 2000)
    //       })
    //
    //       this.ws.addEventListener('open', () => {
    //         console.log(`tracker: Connected`)
    //         this.connected = true
    //         this.connectedOnce = true
    //       })
    //
    //       this.ws.addEventListener('message', async (event) => {
    //         const packet = await decodePacket(event.data)
    //
    //         if (!packet) {
    //           return
    //         }
    //
    //         const handlePacket = () => {
    //           switch (packet.$type) {
    //             case TrackerUpdate.$type:
    //               this.$set(this.trackedValues, packet.id, packet.value)
    //               this.receivedPacket = true
    //               break
    //             case TrackerFlagsUpdate.$type:
    //               this.seedFlags = packet.flags
    //               this.receivedPacket = true
    //               break
    //             case TrackerTimerStateUpdate.$type:
    //               this.inGameTime = packet.inGameTime
    //               this.asyncLoadingTime = packet.asyncLoadingTime
    //               this.timerShouldRun = packet.timerShouldRun
    //               this.receivedPacket = true
    //               break
    //             case ResetTracker.$type:
    //               this.trackedValues = {}
    //               this.seedFlags = []
    //               this.displayedTime = 0
    //               this.inGameTime = 0
    //               this.asyncLoadingTime = 0
    //               break
    //           }
    //         }
    //
    //         if (this.appliedDelay > 0) {
    //           setTimeout(handlePacket, this.appliedDelay * 1000)
    //         } else {
    //           handlePacket()
    //
    //           if (!this.delayQueued && this.requestedDelay > 0) {
    //             this.delayQueued = true
    //
    //             // Let all packets process immediately for one second from the first packet received
    //             setTimeout(() => {
    //               this.appliedDelay = this.requestedDelay
    //             }, 1000)
    //           }
    //         }
    //       })
  })
  const tryDisconnect = (() => { // TODO tracker disconnect
    //       try {
    //         this.ws?.close()
    //       } catch (e) {
    //         console.error(e)
    //       }
  })
  const updateTimerStartTimestamp = (() => {
    timerStartTimestamp.value = (Date.now() / 1000.0) - inGameTime.value - requestedDelay.value
    updateTimer()
  })
  const updateTimer = (() => {
    if (!this.connected) {
      return
    }

    if (this.trackedValues.game_finished) {
      displayedTime.value = Math.max(inGameTime.value, 0)
    } else if (this.timerShouldRun) {
      displayedTime.value = Math.max((Date.now() / 1000.0) - timerStartTimestamp.value, 0)
    }
  })

</script>

<style lang="scss" scoped>
  .electron-draggable {
    -webkit-user-select: none;
    -webkit-app-region: drag;
  }

  .tracker-container {
    width: 100vw;
    position: relative;
    z-index: 0;

    .done-label {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;

      .hype {
        height: 20vw;
        width: 20vw;
        overflow: hidden;
        display: flex;
        border-radius: 50%;
        border: 1vw solid var(--v-accent-base);
        margin-top: -5vw;
        transform: translateY(5vw) scale(1.1);
        opacity: 0;
        transition: opacity 100ms, transform 400ms cubic-bezier(0.05, 1.62, 0.32, 1.01);

        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
      }
    }

    &.done {
      > .tracker {
        opacity: 0.4;
      }

      .label {
        animation: label-move both 400ms 400ms cubic-bezier(0.05, 1.62, 0.32, 1.01);
      }

      .done-label {
        opacity: 1;
        transform: scale(1);
      }

      .hype {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  }
</style>

<template>
  <div class="fill-height" :class="{ 'electron-draggable': isElectron }">
    <v-fade-transition mode="out-in">
      <div
        v-if="connected && receivedPacket"
        ref="tracker"
        key="tracker"
        class="tracker-container"
        :class="{ done: showDone }"
      >
        <div class="tracker">
          <wotw-tracker-skills-resources-timer
            :seed-flags="seedFlags"
            :tracked-values="trackedValues"
            :heart-count="heartCount"
            :show-willow-hearts="showWillowHearts"
            :time="displayedTime"
            :loading-time="loadingTime"
            :show-timer="showTimer"
          />
          <wotw-tracker-teleporters v-if="showTeleporters" :tracked-values="trackedValues" />
        </div>
        <div class="done-label">
          <div ref="hype" class="hype">
            <img src="@/assets/images/ori_hype.png" />
          </div>
        </div>
      </div>
      <div
        v-else-if="!hideConnectingScreen"
        key="connecting"
        class="fill-height d-flex flex-column align-center justify-center"
      >
        <div class="pb-4">
          <template v-if="!receivedPacket"> Waiting for game... </template>
          <template v-else-if="connectedOnce"> Connection lost. Trying to reconnect... </template>
          <template v-else> Waiting for connection... </template>
        </div>
        <v-progress-circular indeterminate />
      </div>
    </v-fade-transition>
  </div>
</template>

<script>
  import { decodePacket } from '~/assets/proto/ProtoUtil'
  import { ResetTracker, TrackerFlagsUpdate, TrackerTimerStateUpdate, TrackerUpdate } from '~/assets/proto/messages'
  import { applyTransparentWindowStyles, isOBS } from '~/assets/lib/obs'
  import { isElectron } from '~/assets/lib/isElectron'
  import { confettiFromElement } from '~/assets/lib/confettiFromElement'
  import { hasSettings } from '~/assets/lib/hasSettings'

  export default {
    name: 'Tracker',
    mixins: [hasSettings],
    layout: 'plain',
    data: () => ({
      connected: false,
      receivedPacket: false,
      connectedOnce: false,
      hideConnectingScreen: false,
      trackedValues: {},
      seedFlags: [],
      showDone: false,
      timerUpdateIntervalId: null,
      timerStartTimestamp: 0,
      displayedTime: 0,
      totalTime: 0,
      loadingTime: 0,
      timerShouldRun: false,
      appliedDelay: 0,
      delayQueued: false,
    }),
    head: {
      title: 'Item Tracker',
    },
    computed: {
      trackerSource() {
        const source = this.$route.query.source

        if (!source) {
          return 'ws://127.0.0.1:31410'
        }

        if (/^wss?:\/\//.test(source)) {
          return source
        }

        return `${this.$paths.WS_BASE_URL}/remote-tracker/${source}`
      },
      isOBS,
      isElectron,
      showWillowHearts() {
        const showWillowHearts = this.$route.query.hearts === 'true' || this.settings['LocalTracker.ShowWillowHearts']
        const hideHeartsUntilFirstOne =
          this.$route.query.hideHeartsUntilFirst === 'true' || this.settings['LocalTracker.HideHeartsUntilFirstHeart']

        return showWillowHearts && (!hideHeartsUntilFirstOne || this.heartCount > 0)
      },
      showTimer() {
        return this.$route.query.timer === 'true' || !!this.settings['LocalTracker.ShowTimer']
      },
      showTeleporters() {
        return this.$route.query.teleporters === 'true'
      },
      showErrors() {
        return this.$route.query.errors === 'true'
      },
      heartCount() {
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
          if (this.trackedValues[heart]) {
            count++
          }
        }

        return count
      },
      requestedDelay() {
        return Number(this.$route.query.delay ?? 0)
      },
    },
    watch: {
      connected: {
        immediate: true,
        handler(newValue) {
          if (!newValue && isOBS() && !this.showErrors) {
            setTimeout(() => {
              this.hideConnectingScreen = true
            }, 5000)
          } else if (newValue) {
            this.hideConnectingScreen = false
          }
        },
      },
      'trackedValues.game_finished'(value) {
        if (value) {
          setTimeout(() => {
            confettiFromElement(this.$refs.hype, {
              startVelocity: 30,
            })
          }, 75)

          this.showDone = true
          setTimeout(() => {
            this.showDone = false
          }, 4000)
        }
      },
      totalTime() {
        this.updateTimerStartTimestamp()
      },
      loadingTime() {
        this.updateTimerStartTimestamp()
      },
      timerShouldRun() {
        this.updateTimerStartTimestamp()
      },
      requestedDelay() {
        this.updateTimerStartTimestamp()
      },
    },
    mounted() {
      if (isOBS() || isElectron()) {
        applyTransparentWindowStyles()

        // pagchimp
        document.documentElement.style.overflow = 'hidden'
      }

      this.timerStartTimestamp = (Date.now() / 1000.0)
      this.connect()

      this.timerUpdateIntervalId = setInterval(this.updateTimer, 50)
    },
    beforeDestroy() {
      this.tryDisconnect()

      if (this.timerUpdateIntervalId !== null) {
        clearInterval(this.timerUpdateIntervalId)
      }
    },
    methods: {
      connect() {
        if (!this.trackerSource) {
          return
        }

        console.log(`tracker: Trying to connect to ${this.trackerSource}...`)

        this.tryDisconnect()
        this.ws = new WebSocket(this.trackerSource)

        this.ws.addEventListener('close', () => {
          console.log(`tracker: Connection lost. Will retry in 2s...`)
          this.connected = false
          this.receivedPacket = false
          setTimeout(this.connect, 2000)
        })

        this.ws.addEventListener('open', () => {
          console.log(`tracker: Connected`)
          this.connected = true
          this.connectedOnce = true
        })

        this.ws.addEventListener('message', async (event) => {
          const packet = await decodePacket(event.data)

          if (!packet) {
            return
          }

          const handlePacket = () => {
            switch (packet.$type) {
              case TrackerUpdate.$type:
                this.$set(this.trackedValues, packet.id, packet.value)
                this.receivedPacket = true
                break
              case TrackerFlagsUpdate.$type:
                this.seedFlags = packet.flags
                this.receivedPacket = true
                break
              case TrackerTimerStateUpdate.$type:
                this.totalTime = packet.totalTime
                this.loadingTime = packet.loadingTime
                this.timerShouldRun = packet.timerShouldRun
                break
              case ResetTracker.$type:
                this.trackedValues = {}
                this.seedFlags = []
                this.displayedTime = 0
                this.totalTime = 0
                this.loadingTime = 0
                break
            }
          }

          if (this.appliedDelay > 0) {
            setTimeout(handlePacket, this.appliedDelay * 1000)
          } else {
            handlePacket()

            if (!this.delayQueued && this.requestedDelay > 0) {
              this.delayQueued = true

              // Let all packets process immediately for one second from the first packet received
              setTimeout(() => {
                this.appliedDelay = this.requestedDelay
              }, 1000)
            }
          }
        })
      },
      tryDisconnect() {
        try {
          this.ws?.close()
        } catch (e) {
          console.error(e)
        }
      },
      updateTimerStartTimestamp() {
        this.timerStartTimestamp = (Date.now() / 1000.0) - this.loadingTime - this.totalTime - this.requestedDelay
        this.updateTimer()
      },
      updateTimer() {
        if (!this.connected) {
          return
        }

        if (this.trackedValues.game_finished) {
          this.displayedTime = Math.max(this.totalTime, 0)
        } else if (this.timerShouldRun) {
          this.displayedTime = Math.max((Date.now() / 1000.0) - this.timerStartTimestamp, 0)
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  .electron-draggable {
    -webkit-user-select: none;
    -webkit-app-region: drag;
  }

  .tracker-container {
    width: 100vw;
    position: relative;
    overflow: hidden;

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
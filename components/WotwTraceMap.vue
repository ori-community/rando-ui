<template>
  <div>
    <wotw-map ref="map" @click="mapClicked" class="map">
      <k-layer>
        <k-line v-if="teleportIndicatorLine" :config="teleportIndicatorLine" />
        <div v-if="deathImage">
          <k-image
            v-for="death in displayedDeaths"
            :key="death.id"
            :image="deathImage"
            :width="6"
            :height="7"
            :offsetX="3"
            :offsetY="7"
            :config="death"
          />
        </div>
        <div v-if="teleportImage">
          <k-image
            v-for="teleport in displayedTeleporters"
            :key="teleport.id"
            :image="teleportImage"
            :width="14"
            :height="7"
            :offsetX="7"
            :offsetY="5"
            :config="teleport"
            @click="selectTeleporter(teleport)"
            @mouseout="displayElementMouseOut(teleport)"
            @mouseover="displayElementMouseOver(teleport)"
          />
        </div>
        <div v-if="doorImage">
          <k-image
            v-for="door in displayedDoors"
            :key="door.id"
            :image="doorImage"
            :width="12"
            :height="10"
            :offsetX="6"
            :offsetY="5"
            :config="door"
            @click="selectTeleporter(door)"
            @mouseout="displayElementMouseOut(door)"
            @mouseover="displayElementMouseOver(door)"
          />
        </div>
        <k-line v-for="line in displayedLines" :key="line.name" :config="line" />
        <k-circle
          v-for="circle in displayedPickups"
          :key="circle.name"
          :config="circle"
          @click="selectPickup(circle.event)"
          @mouseout="displayElementMouseOut(circle)"
          @mouseover="displayElementMouseOver(circle)"
        />
      </k-layer>
    </wotw-map>

    <!-- top left-->
    <div class="top-left-container">
      <v-card v-if="selectedPickup?.pickupName" class="pa-3">
        <span>{{ selectedPickup.pickupName }}</span>
      </v-card>
    </div>

    <!-- buttom left -->
    <v-card class="bottom-left-container pa-1">
      <v-tooltip right>
        <template #activator="{ on }">
          <div v-on="on">
            <v-btn
              v-model="opacityFilterActive"
              @click="opacityFilterActive = !opacityFilterActive"
              icon
              large
              :disabled="maxInGameTime === 0"
            >
              <v-icon>mdi-circle-opacity</v-icon>
            </v-btn>
          </div>
        </template>
        <span>Fade Out Earlier Events</span>
      </v-tooltip>
      <v-tooltip right>
        <template #activator="{ on }">
          <div v-on="on">
            <v-btn icon large :disabled="sliderValue <= 0" @click="focusOnLastEvents">
              <v-icon>mdi-focus-field</v-icon>
            </v-btn>
          </div>
        </template>
        <span>Zoom On Last Events</span>
      </v-tooltip>
      <v-tooltip right>
        <template #activator="{ on }">
          <div v-on="on">
            <v-btn icon large @click="map.zoomToFit()">
              <v-icon>mdi-fit-to-screen</v-icon>
            </v-btn>
          </div>
        </template>
        <span>Zoom To Fit</span>
      </v-tooltip>
    </v-card>

    <!-- bottom right -->
    <v-card class="bottom-right-container">
      <v-btn text large color="descent" @click="closeMap">close</v-btn>
    </v-card>

    <!--  player list  -->
    <v-slide-x-reverse-transition>
      <v-card class="player-list-container align-right">
        <div v-if="displayPlayers">
          <v-btn icon large style="position: absolute" @click="displayPlayers = false"
            ><v-icon>mdi-chevron-right</v-icon></v-btn
          >
          <v-data-table
            class="player-list"
            :headers="playerListHeaders"
            :items="sortedPlayers"
            disable-pagination
            hide-default-footer
            mobile-breakpoint="0"
            disable-sort
          >
            <!-- Items -->
            <template #item.route="{ item }">
              <template v-if="!item.selected">
                <v-tooltip left :disabled="item.hasSaveFile">
                  <template #activator="{ on }">
                    <div v-on="on">
                      <v-btn
                        v-if="item.hasSaveFile"
                        :disabled="maxDisplayedRoutesCountReached || !item.hasSaveFile"
                        icon
                        @click="selectPlayer(item.user)"
                      >
                        <v-icon small>mdi-vector-polyline-plus</v-icon>
                      </v-btn>
                      <img v-else class="ori-shrug" src="@/assets/images/ori_shrug.png" />
                    </div>
                  </template>
                  <span>No stats available</span>
                </v-tooltip>
              </template>
              <template v-else>
                <v-btn icon @click="deselectPlayer(item.user)">
                  <v-icon color="red darken-1" small>mdi-vector-polyline-minus</v-icon>
                </v-btn>
              </template>
            </template>
            <template #item.user.name="{ item }">
              <div class="text-no-wrap">
                <discord-avatar :user="item.user" class="mr-1" />
                <span :style="{ color: item.color, fontWeight: item.selected ? 'bold' : 'normal' }">{{
                  item.user.name
                }}</span>
              </div>
            </template>
            <template #item.time="{ item }">
              <template v-if="item.time">{{ formatTime(item.time) }} </template>
              <template v-else-if="item.selected">-</template>
            </template>
            <template #item.collectionTime="{ item }">
              <template v-if="item.collectionTime">{{ formatTime(item.collectionTime) }} </template>
              <template v-else-if="item.selected">-</template>
            </template>
          </v-data-table>
        </div>
        <div v-else class="pa-1">
          <v-btn icon large @click="displayPlayers = true"><v-icon>mdi-chevron-left</v-icon> </v-btn>
        </div>
      </v-card>
    </v-slide-x-reverse-transition>

    <v-card class="slider py-3 px-3">
      <span>{{ formatTime(sliderValue) }} / {{ formatTime(maxInGameTime) }}</span>
      <v-slider v-model="sliderValue" :max="maxInGameTime" step="0.1" hide-details />
      <!--      <ul v-for="(pickup, index) in filteredNodes" :key="index">-->
      <!--        <li>{{ pickup }}</li>-->
      <!--      </ul>-->
    </v-card>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { getDistance } from 'vuetify/src/components/VSparkline/helpers/math'
  import { parse as parseCsv } from 'csv-parse'
  import { formatTime } from '~/assets/lib/formatTime'

  export default {
    name: 'WotwTraceMap',
    data: () => ({
      gameTimeline: null,
      locations: [],
      players: [],
      sliderValue: 0,
      opacityFilterActive: false,
      selectedPickup: null,
      teleporterSelected: false,
      hoveringOverElement: false,
      lineColors: ['#1565c0', '#388e3c', '#ad1457', '#f57c00'],
      deathImage: null,
      teleportImage: null,
      doorImage: null,
      teleportIndicatorLine: null,
      displayPlayers: true,
    }),
    computed: {
      console: () => console,
      ...mapState('electron', ['traceMapSource']),
      constants: () => ({
        eventType_Pickup: 'Pickup',
        eventType_Teleport: 'Teleport',
        teleportReason_Unknown: 'Unknown',
        teleportReason_Teleporter: 'Teleporter',
        teleportReason_Death: 'Death',
        teleportReason_Door: 'Door',
        teleportReason_Portal: 'Portal',
        lastEventScaleFactor: 1.4,
      }),
      map() {
        return this.$refs.map
      },
      playerListHeaders() {
        const headers = []
        headers.push({ value: 'route', align: 'center' })
        headers.push({ text: 'Player', value: 'user.name' })
        if (this.selectedPickup) {
          headers.push({ text: 'Collection Time', value: 'collectionTime', align: 'right' })
        } else {
          headers.push({ text: 'Time', value: 'time', align: 'right' })
        }

        return headers
      },
      maxDisplayedRoutesCountReached() {
        return this.players.filter((player) => player.selected).length >= this.lineColors.length
      },
      maxInGameTime() {
        const maxValue = Math.max(
          ...this.players.filter((player) => player.selected === true).map((player) => parseFloat(player.time)),
        )
        return maxValue > 0 ? maxValue : 0
      },
      displayedPickups() {
        const circles = []
        for (const event of this.pastEvents.filter(
          (event) => event.eventType === this.constants.eventType_Pickup && event.opacityFactor > 0,
        )) {
          const radius =
            event.reverseIndex <= 2
              ? Math.abs(this.remap(4, 2, 2, 2.5 * this.constants.lastEventScaleFactor, event.reverseIndex + 1))
              : 2
          circles.push({
            name: event.name,
            x: event.to.x,
            y: event.to.y,
            fill: event.player.color,
            radius,
            hitStrokeWidth: radius * 1.5,
            opacity: event.opacityFactor,
            event,
          })
        }
        return circles
      },
      displayedDeaths() {
        const deaths = []
        for (const event of this.pastEvents.filter(
          (event) => event.teleportReason === this.constants.teleportReason_Death && event.opacityFactor > 0,
        )) {
          const scale =
            event.reverseIndex <= 2
              ? Math.abs(this.remap(2, 0, 1, this.constants.lastEventScaleFactor, event.reverseIndex))
              : 1
          deaths.push({
            name: event.name,
            x: event.from.x,
            y: event.from.y,
            opacity: event.opacityFactor,
            scaleX: scale,
            scaleY: -scale,
          })
        }
        return deaths
      },
      displayedTeleportImages() {
        const teleports = []
        for (const event of this.pastEvents.filter(
          (event) =>
            (event.teleportReason === this.constants.teleportReason_Teleporter ||
              event.teleportReason === this.constants.teleportReason_Door) &&
            event.opacityFactor > 0,
        )) {
          const scale =
            event.reverseIndex <= 2
              ? Math.abs(this.remap(2, 0, 1, this.constants.lastEventScaleFactor, event.reverseIndex))
              : 1
          teleports.push({
            name: event.name,
            x: event.from.x,
            y: event.from.y,
            opacity: event.opacityFactor,
            isDestination: false,
            scaleX: scale,
            scaleY: -scale,
            event,
          })
          teleports.push({
            name: event.name,
            x: event.to.x,
            y: event.to.y,
            opacity: event.opacityFactor,
            isDestination: true,
            scaleX: scale,
            scaleY: -scale,
            event,
          })
        }
        return teleports
      },
      displayedTeleporters() {
        return this.displayedTeleportImages.filter(
          (teleport) => teleport.event.teleportReason === this.constants.teleportReason_Teleporter,
        )
      },
      displayedDoors() {
        return this.displayedTeleportImages.filter(
          (teleport) => teleport.event.teleportReason === this.constants.teleportReason_Door,
        )
      },
      displayedLines() {
        const lines = []
        this.pastEvents.forEach((event, index) => {
          if (event.opacityFactor > 0) {
            if (
              event.eventType === this.constants.eventType_Teleport ||
              event.eventType === this.constants.teleportReason_Door
            ) {
              lines.push({
                name: `pathTo_${event.name}`,
                points: [this.pastEvents[index - 1].to.x, this.pastEvents[index - 1].to.y, event.from.x, event.from.y],
                stroke: event.player.color,
                strokeWidth: 2,
                opacity: event.opacityFactor,
                lineJoin: 'round',
                lineCap: 'round',
                event,
              })
            }
            if (event.from) {
              const line = {
                name: `path_${event.name}`,
                points: [event.from.x, event.from.y, event.to.x, event.to.y],
                stroke: event.player.color,
                opacity: event.opacityFactor,
                strokeWidth: 2,
                dash: [0],
                lineJoin: 'round',
                lineCap: 'round',
                event,
              }
              switch (event.teleportReason) {
                case this.constants.teleportReason_Teleporter:
                case this.constants.teleportReason_Door: {
                  const distance = getDistance(event.from, event.to)
                  line.dash = [10, 5, 5, distance - 40, 5, 5, 10]
                  break
                }
                case this.constants.teleportReason_Portal: {
                  line.dash = [2, 2]
                  line.strokeWidth = 1
                }
              }
              if (event.reverseIndex <= 2) {
                line.strokeWidth = Math.abs(
                  this.remap(
                    2,
                    0,
                    line.strokeWidth,
                    line.strokeWidth * this.constants.lastEventScaleFactor,
                    event.reverseIndex,
                  ),
                )
              }
              lines.push(line)
            }
          }
        })
        return lines
      },
      pastEvents() {
        const events = []
        this.players
          .filter((player) => player.selected)
          .forEach((player) =>
            player.timeline
              .filter((event) => event.inGameTime <= this.sliderValue)
              .forEach((event, index, array) => {
                event.player = player
                event.focusFactor = this.getFocusFactor(event.inGameTime)
                event.opacityFactor = this.opacityFilterActive ? event.focusFactor : 1
                event.index = index
                event.reverseIndex = array.length - index - 1
                events.push(event)
              }),
          )
        return events
      },
      sortedPlayers() {
        return this.players.toSorted((a, b) => {
          if (a.time === b.time) {
            return a.user.name.localeCompare(b.user.name)
          }
          return a.time - b.time
        })
      },
    },
    watch: {
      traceMapSource: {
        immediate: true,
        async handler(value, oldValue) {
          if (value.multiverseId !== oldValue?.multiverseId) {
            // resetting data
            this.players = []
            this.selectedPickup = null
            this.locations.forEach((location) => {
              location.collectedBy = []
            })

            // collecting new data
            switch (value.gameType) {
              case 'league': {
                const submissions = await this.$axios.$get(`/league/games/${value.leagueGameId}/submissions`)
                if (submissions) {
                  submissions
                    .filter((submission) => submission.rankingData?.time)
                    .forEach((submission) => {
                      this.players.push({
                        user: submission.membership.user,
                        sourceId: submission.id,
                        time: submission.rankingData.time,
                        hasSaveFile: submission.hasSaveFile,
                        selected: false,
                        collectionTime: null,
                      })
                    })
                }
                break
              }
            }
          }
          this.setPlayerCollectionTime()
          await this.selectPlayer(value.user)
          this.sliderValue = this.maxInGameTime
        },
      },
    },
    async mounted() {
      const locData = await window.electronApi.invoke('seedgen.getLocDataFileContents')
      this.locations = this.processLocData(locData)
      const loadingDeathImage = new Image()
      loadingDeathImage.src = require('@/assets/images/map/death_marker.png')
      loadingDeathImage.onload = () => {
        this.deathImage = loadingDeathImage
      }
      const loadingTeleportImage = new Image()
      loadingTeleportImage.src = require('@/assets/images/tracker/teleporter_alt.png')
      loadingTeleportImage.onload = () => {
        this.teleportImage = loadingTeleportImage
      }
      const loadingDoorImage = new Image()
      loadingDoorImage.src = require('@/assets/images/map/watermill_door.png')
      loadingDoorImage.onload = () => {
        this.doorImage = loadingDoorImage
      }
    },
    methods: {
      formatTime,
      remap(originMin, originMax, targetMin, targetMax, value) {
        return targetMin + ((value - originMin) * (targetMax - targetMin)) / (originMax - originMin)
      },
      setPlayerCollectionTime() {
        if (!this.selectedPickup) {
          return
        }
        this.players.forEach((player) => {
          if (!player.selected) {
            player.collectionTime = null
            return
          }

          const playerEvent = player.timeline?.find((event) => event.pickupName === this.selectedPickup.pickupName)
          player.collectionTime = playerEvent ? playerEvent.inGameTime : null
        })
      },
      async getSaveFilegameStats(id) {
        switch (this.traceMapSource.gameType) {
          case 'league': {
            return await this.$axios.$get(`/league/submissions/${id}/gamestats`)
          }
        }
        return null
      },
      async selectPlayer(user) {
        if (this.maxDisplayedRoutesCountReached) {
          return
        }
        const player = this.players.find((player) => player.user.id === user.id)
        if (!player.hasSaveFile) {
          return
        }
        const sliderIsAtMax = this.sliderValue >= Math.round(this.maxInGameTime * 10) / 10
        if (!player.stats) {
          await this.loadPlayerStats(player)
        }
        player.selected = true
        player.color = this.lineColors.filter((color) => !this.players.map((player) => player.color).includes(color))[0]
        if (sliderIsAtMax) {
          this.sliderValue = this.maxInGameTime
        }
      },
      async loadPlayerStats(player) {
        player.stats = await this.getSaveFilegameStats(player.sourceId)
        if (player.stats === null) {
          return
        }

        player.timeline = []
        const pickups = player.stats.collectedPickups
        if (pickups) {
          Object.entries(pickups).forEach(([pickup, inGameTime]) => {
            const locationEntry = this.locations.find((entry) => entry.node === pickup)
            if (!locationEntry) {
              console.warn(`pickup ${pickup} not found`)
              return
            }
            if (locationEntry.zone !== 'Shop') {
              player.timeline.push({
                name: `${player.user.id}_pickup_${pickup}`,
                pickupName: pickup,
                inGameTime,
                to: { x: locationEntry.location.x, y: locationEntry.location.y },
                eventType: this.constants.eventType_Pickup,
                teleportReason: null,
              })
            }
          })
        }

        const teleports = player.stats.teleports
        let teleportIndex = 0
        if (teleports) {
          teleports.forEach((teleport) => {
            player.timeline.push({
              name: `${player.user.id}_teleport_${teleportIndex}`,
              inGameTime: teleport.in_game_time,
              from: { x: teleport.from_x, y: teleport.from_y },
              to: { x: teleport.to_x, y: teleport.to_y },
              eventType: this.constants.eventType_Teleport,
              teleportReason: teleport.reason,
            })
            teleportIndex += 1
          })
        }

        player.timeline.sort((a, b) => {
          return a.inGameTime - b.inGameTime
        })
        for (let i = 1; i < player.timeline.length; i++) {
          if (player.timeline[i].eventType === this.constants.eventType_Pickup) {
            player.timeline[i].from = player.timeline[i - 1].to
          }
        }
      },
      deselectPlayer(user) {
        const player = this.players.find((player) => player.user.id === user.id)
        player.selected = false
        player.color = null
      },
      processLocData(locationData) {
        const lines = []
        const parser = parseCsv(locationData, { columns: true, trim: true })
        parser.on('readable', function () {
          let record
          while ((record = parser.read()) !== null) {
            lines.push({
              node: record.NodeIdentifier,
              location: {
                x: parseFloat(record.X),
                y: parseFloat(record.Y),
              },
              zone: record.Zone,
            })
          }
        })
        return lines
      },
      getFocusFactor(collectionTime) {
        const timePast = this.sliderValue - collectionTime
        const factor =
          timePast > this.maxInGameTime / 5 ? 0 : Math.abs(timePast - this.maxInGameTime / 5) / (this.maxInGameTime / 5)
        return 1 - Math.pow(1 - factor, 3)
      },
      mapClicked() {
        if (this.hoveringOverElement) {
          return
        }
        this.selectPickup(null)
      },
      selectPickup(event) {
        this.selectedPickup = event
        this.setPlayerCollectionTime()
      },
      selectTeleporter(teleport) {
        const x = teleport.isDestination ? teleport.event.from.x : teleport.event.to.x
        const y = teleport.isDestination ? teleport.event.from.y : teleport.event.to.y
        if (this.teleportIndicatorLine) {
          this.teleportIndicatorLine.opacity = 1
          this.teleporterSelected = true
          setTimeout(() => {
            this.teleportIndicatorLine = null
            this.teleporterSelected = false
            this.displayElementMouseOut(teleport)
          }, 800)
        }
        this.map.centerOn(x, y)
      },
      focusOnLastEvents() {
        const focusEvents = this.pastEvents.filter((event) => event.focusFactor > 0.99)
        const points = focusEvents.map((event) => {
          return { x: event.to.x, y: event.to.y }
        })
        if (!points) {
          return
        }
        this.map.zoomOn(points)
      },
      displayElementMouseOver(element) {
        if (
          element.event?.teleportReason === this.constants.teleportReason_Teleporter ||
          element.event?.teleportReason === this.constants.teleportReason_Door
        ) {
          element.hovered = true
          this.teleportIndicatorLine = {
            points: [element.event.from.x, element.event.from.y, element.event.to.x, element.event.to.y],
            strokeWidth: 2,
            stroke: element.event.player.color,
            dash: [10, 6],
          }
        }
        this.hoveringOverElement = true
        document.body.style.cursor = 'pointer'
      },
      displayElementMouseOut(_element) {
        if (!this.teleporterSelected) {
          this.teleportIndicatorLine = null
        }
        this.hoveringOverElement = false
        document.body.style.cursor = 'default'
      },
      closeMap() {
        this.$store.commit('electron/setShowTraceMap', false)
      },
    },
  }
</script>

<style lang="scss" scoped>
  .map {
    position: absolute;
    margin: 0;
    padding: 0;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }
  .top-left-container {
    position: absolute;
    left: 1ex;
    top: 1ex;
  }
  .player-list-container {
    max-height: calc(100% - 10em);
    overflow-y: auto;
    position: absolute;
    right: 1ex;
    top: 1ex;
  }
  .bottom-left-container {
    position: absolute;
    left: 1ex;
    bottom: 6em;
  }
  .bottom-right-container {
    position: absolute;
    right: 1ex;
    bottom: 6em;
  }
  .player-list {
    :deep(tr) {
      th:first-of-type,
      td:first-of-type {
        padding-left: 1em;
      }

      th:last-of-type,
      td:last-of-type {
        padding-right: 2em;
      }
    }
  }

  .slider {
    position: absolute;
    bottom: 1ex;
    left: 1ex;
    right: 1ex;
  }

  .ori-shrug {
    height: 1.5em;
    filter: brightness(0.5);
  }
</style>

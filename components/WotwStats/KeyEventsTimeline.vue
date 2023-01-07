<template>
  <div ref="container" class="key-events-container" :style="{ height: `${keyEventRenderInformation.totalHeight}px` }">
    <template v-if="anyKeyEventHappened">
      <template v-for="label in keyEventRenderInformation.labels">
        <div :key="label.seconds" class="label" :style="{ left: `${label.leftMargin}px` }">
          {{ label.text }}
        </div>
      </template>
    </template>

    <template v-for="keyEvent in keyEventRenderInformation.keyEvents">
      <v-tooltip :key="`${keyEvent.type}-${keyEvent.id}`" right>
        <template #activator="{ on }">
          <div class="key-event" :style="{ left: `${keyEvent.leftMargin}px`, top: `${keyEvent.topMargin}px` }" v-on="on">
            <img :src="getKeyEventIcon(keyEvent)" alt="" />
          </div>
        </template>
        <span>{{ getKeyEventName(keyEvent) }} at {{ formatTime(keyEvent.time) }}</span>
      </v-tooltip>
    </template>

    <v-fade-transition>
      <div v-if="!anyKeyEventHappened" class="no-key-events">no key events happened yet</div>
    </v-fade-transition>
  </div>
</template>

<script>
  import abilities from '@/assets/data/abilities.yaml'
  import worldEvents from '@/assets/data/worldEvents.yaml'
  import { hasOwnProperty } from '~/assets/lib/hasOwnProperty'
  import { formatTime } from '~/assets/lib/formatTime'


  const AVAILABLE_LABEL_INTERVALS = [1, 5, 10, 30, 60, 2 * 60, 5 * 60, 10 * 60, 15 * 60, 30 * 60, 60 * 60]
  const MAX_VISIBLE_LABELS = 6

  /**
   * {
   *   <max_time>: interval,
   *   ...
   * }
   * @type {{}}
   */
  const LABEL_INTERVALS_BY_MAX_TIME = AVAILABLE_LABEL_INTERVALS.reduce((acc, interval) => ({
    ...acc,
    [interval * MAX_VISIBLE_LABELS]: interval,
  }), {})

  export default {
    name: 'KeyEventsTimeline',
    props: {
      totalTime: {
        type: Number,
        required: true,
      },
      abilityTimestamps: {
        type: Object,
        required: true,
      },
      worldEventTimestamps: {
        type: Object,
        required: true,
      },
    },
    data: () => ({
      resizeObserver: null,
      viewWidth: 1000,
    }),
    computed: {
      anyKeyEventHappened() {
        return Object.values(this.abilityTimestamps).length > 0 || Object.values(this.worldEventTimestamps).length > 0
      },
      keyEventsSortedByTime() {
        const keyEventsSortedByTime = []

        for (const [id, time] of Object.entries(this.abilityTimestamps)) {
          keyEventsSortedByTime.push({ type: 'ability', id: Number(id), time })
        }

        for (const [id, time] of Object.entries(this.worldEventTimestamps)) {
          keyEventsSortedByTime.push({ type: 'world_event', id: Number(id), time })
        }

        keyEventsSortedByTime.sort((a, b) => a.time - b.time)

        return keyEventsSortedByTime
      },
      keyEventRenderInformation() {
        const keyEventIconWidth = 48
        const laneHeight = 48
        const labelHeight = 24

        const keyEventRenderInformation = {
          keyEvents: this.keyEventsSortedByTime,
          totalHeight: 0,
        }

        // Insert render information
        const lanes = [] // Contains the distance this lane is filled up to

        keyEventLoop: for (const keyEvent of keyEventRenderInformation.keyEvents) {
          const relativeTime = keyEvent.time / (this.totalTime || 1)
          keyEvent.leftMargin = this.viewWidth * relativeTime - keyEventIconWidth * relativeTime

          for (let laneIndex = 0; laneIndex < lanes.length; laneIndex++) {
            if (keyEvent.leftMargin > lanes[laneIndex]) {
              keyEvent.topMargin = laneHeight * laneIndex
              lanes[laneIndex] = keyEvent.leftMargin + keyEventIconWidth
              continue keyEventLoop
            }
          }

          keyEvent.topMargin = laneHeight * lanes.length
          lanes.push(keyEvent.leftMargin + keyEventIconWidth)
        }

        // Calculate labels
        let labelInterval = AVAILABLE_LABEL_INTERVALS[0];
        for (const [maxTime, interval] of Object.entries(LABEL_INTERVALS_BY_MAX_TIME)) {
          labelInterval = interval

          if (this.totalTime < maxTime) {
            break
          }
        }

        keyEventRenderInformation.labels = []
        for (let seconds = labelInterval; seconds < this.totalTime; seconds += labelInterval) {
          const relativeTime = seconds / this.totalTime

          keyEventRenderInformation.labels.push({
            seconds,
            leftMargin: this.viewWidth * relativeTime - keyEventIconWidth * relativeTime,
            text: formatTime(seconds, 0),
          })
        }

        keyEventRenderInformation.totalHeight = laneHeight * lanes.length + labelHeight

        return keyEventRenderInformation
      },
    },
    mounted() {
      this.refreshViewWidth()

      this.resizeObserver = new ResizeObserver(() => {
        this.refreshViewWidth()
      })
      this.resizeObserver.observe(this.$refs.container)
    },
    beforeDestroy() {
      this.resizeObserver?.unobserve(this.$refs.container)
    },
    methods: {
      refreshViewWidth() {
        this.viewWidth = this.$refs.container.clientWidth
      },
      getKeyEventIcon(keyEventReference) {
        switch (keyEventReference.type) {
          case 'ability': {
            if (hasOwnProperty(abilities, keyEventReference.id)) {
              const localAbilities = abilities // Webpack is too stupid to figure out the require() call
              return require(`@/assets/images/tracker/skills/${localAbilities[keyEventReference.id].icon_name}.png`)
            }
            break
          }
          case 'world_event': {
            if (hasOwnProperty(worldEvents, keyEventReference.id)) {
              const localWorldEvents = worldEvents // Webpack is too stupid to figure out the require() call
              return require(`@/assets/images/tracker/skills/${localWorldEvents[keyEventReference.id].icon_name}.png`)
            }
            break
          }
        }
      },
      getKeyEventName(keyEventReference) {
        switch (keyEventReference.type) {
          case 'ability':
            if (hasOwnProperty(abilities, keyEventReference.id)) {
              return abilities[keyEventReference.id].name
            }
            break
          case 'world_event':
            if (hasOwnProperty(worldEvents, keyEventReference.id)) {
              return worldEvents[keyEventReference.id].name
            }
            break
        }

        return '???'
      },
      formatTime,
    },
  }
</script>

<style lang="scss" scoped>
  .key-events-container {
    min-height: 48px;
    position: relative;
    transition: height 200ms;
    box-sizing: content-box;
    overflow: hidden;
    // border-top: 2px solid var(--v-primary-darken4);
    // border-bottom: 2px solid var(--v-primary-darken4);

    .key-event {
      position: absolute;
      width: 48px;
      height: 48px;
      transition: left 500ms linear, top 500ms;
      border-left: 2px solid var(--v-primary-darken1);
      padding-left: 2px;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .label {
      top: 0;
      bottom: 0;
      position: absolute;
      opacity: 0.4;
      font-size: 0.5em;
      display: flex;
      align-items: flex-end;
      border-left: 1px dashed rgba(255, 255, 255, 0.3);
      padding-left: 0.5em;
      transition: left 500ms linear;
    }
  }

  .no-key-events {
    position: absolute;
    display: flex;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    justify-content: center;
    align-items: center;
  }
</style>

<template>
  <div class="resource-timer-view">
    <div class="resource-timer-grid" :style="{'--scaling-factor': resourcesScalingFactor}">
      <div class="line full-width">
        <div class="image">
          <img src="@/assets/images/tracker/spirit_light.png" />
        </div>
        <div class="value">{{ spiritLight }}</div>
        <div v-if="gameFinished" class="image hype">
          <img src="@/assets/images/ori_hype.png" />
        </div>
      </div>

      <div class="line">
        <div class="image">
          <img src="@/assets/images/tracker/keystone.png" />
        </div>
        <div class="value">{{ keystones }}</div>
      </div>
      <div class="line">
        <div class="image">
          <img src="@/assets/images/tracker/gorlek_ore.png" />
        </div>
        <span class="value">
          <span :class="{ completed: questRebuildGladesDone }">{{ gorlekOre }}</span><span class="small" :class="{ completed: gorlekOreCollected >= 29 || questRebuildGladesDone }">/{{ gorlekOreCollected }}</span>
        </span>
      </div>
      <div v-if="showTrees" class="line">
        <div class="image">
          <img src="@/assets/images/tracker/tree.png" />
        </div>
        <div class="value" :class="{ completed: treeCount === totalTreeCount }">
          {{ treeCount }}<span class="small">/{{ totalTreeCount }}</span>
        </div>
      </div>
      <div v-if="showWisps" class="line">
        <div class="image">
          <img src="@/assets/images/tracker/wisp.png" />
        </div>
        <div class="value" :class="{ completed: wispCount === totalWispCount }">
          {{ wispCount }}<span class="small">/{{ totalWispCount }}</span>
        </div>
      </div>
      <div v-if="showRelics" class="line">
        <div class="image">
          <img src="@/assets/images/tracker/map_stone.png" />
        </div>
        <div class="value" :class="{ completed: relicCount === totalRelicCount }">
          {{ relicCount }}<span class="small">/{{ totalRelicCount }}</span>
        </div>
      </div>
      <div v-if="showQuests" class="line">
        <div class="image">
          <img src="@/assets/images/tracker/quest.png" />
        </div>
        <div class="value" :class="{ completed: questCount === totalQuestCount }">
          {{ questCount }}<span class="small">/{{ totalQuestCount }}</span>
        </div>
      </div>
      <div v-if="showWillowHearts" class="line">
        <div class="image">
          <img src="@/assets/images/tracker/willow_heart.png" />
        </div>
        <div class="value" :class="{ completed: heartCount === totalHeartCount }">
          {{ heartCount }}<span class="small">/{{ totalHeartCount }}</span>
        </div>
      </div>

      <div class="line timer-line full-width">
        <div class="timer-container">
          <div class="timer" :class="{completed: gameFinished}">{{ mainTimerText }}<span class="fraction">{{ fractionTimerText }}</span></div>
          <div class="loading-time">{{ loadingTimeText }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { formatTime } from '~/assets/lib/formatTime'

  export default {
    name: 'ResourceView',
    props: {
      spiritLight: {
        type: Number,
        default: 0,
      },
      gorlekOre: {
        type: Number,
        default: 0,
      },
      gorlekOreCollected: {
        type: Number,
        default: 0,
      },
      keystones: {
        type: Number,
        default: 0,
      },
      treeCount: {
        type: Number,
        default: 0,
      },
      totalTreeCount: {
        type: Number,
        default: 0,
      },
      wispCount: {
        type: Number,
        default: 0,
      },
      totalWispCount: {
        type: Number,
        default: 0,
      },
      showWillowHearts: {
        type: Boolean,
        default: false,
      },
      heartCount: {
        type: Number,
        default: 0,
      },
      totalHeartCount: {
        type: Number,
        default: 0,
      },
      questCount: {
        type: Number,
        default: 0,
      },
      totalQuestCount: {
        type: Number,
        default: 0,
      },
      questRebuildGladesDone: {
        type: Boolean,
        default: false,
      },
      relicCount: {
        type: Number,
        default: 0,
      },
      totalRelicCount: {
        type: Number,
        default: 0,
      },
      flags: {
        type: Array,
        default: () => [],
      },
      gameFinished: {
        type: Boolean,
        default: false,
      },
      showTimer: {
        type: Boolean,
        default: true,
      },
      time: {
        type: Number,
        default: 0,
      },
      loadingTime: {
        type: Number,
        default: 0,
      },
    },
    data: () => ({
      mainTimerText: '0:00',
      fractionTimerText: '.0',
    }),
    computed: {
      showTrees() {
        return this.flags.includes('All Trees')
      },
      showWisps() {
        return this.flags.includes('All Wisps')
      },
      showRelics() {
        return this.flags.includes('Relics')
      },
      showQuests() {
        return this.flags.includes('All Quests')
      },
      rows() {
        return 2 /* SL, KS, Ore */ + Math.ceil([
          this.showTrees,
          this.showWisps,
          this.showQuests,
          this.showRelics,
          this.showWillowHearts
        ].filter(v => v).length / 2)
      },
      resourcesScalingFactor() {
        return (this.rows >= 5 && this.showTimer)
          ? 0.8
          : 1.0
      },
      loadingTimeText() {
        let text = this.gameFinished
          ? 'LT: '
          : '-'

        text += formatTime(this.loadingTime, 1, true)

        return text
      }
    },
    watch: {
      time: {
        immediate: true,
        handler(value) {
          const parts = formatTime(value).split(
            '.',
            2,
          )
          this.mainTimerText = parts[0]
          this.fractionTimerText = '.' + parts[1]
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
  .resource-timer-view {
    position: relative;
    padding-left: 1vw;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  .resource-timer-grid {
    display: grid;
    grid-template-columns: auto auto;
    grid-auto-rows: auto;
    align-items: center;
    gap: 0.2vw;
    min-height: 0;
    flex-shrink: 1;

    .timer-line {
      padding-top: 1.3vw;

      .timer-container {
        text-align: right;
        line-height: 1;

        .timer {
          font-weight: 700;
          font-size: 5vw;

          &.completed {
            color: var(--v-success-base);
          }

          .fraction {
            font-weight: 200;
            font-size: 2.5vw;
          }
        }

        .loading-time {
          opacity: 0.75;
          font-size: 1.75vw;
          font-weight: 500;
          transform: scaleY(0.8);
          margin-top: -0.4vw;
        }
      }
    }

    .line {
      display: flex;
      min-height: 0;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row-reverse;
      flex-shrink: 1;
      line-height: 1.1;

      .value {
        padding-right: 0.5vw;
        white-space: nowrap;
      }

      &:not(.full-width) {
        &:nth-child(odd) {
          flex-direction: row;

          .value {
            padding-left: 0.5vw;
          }
        }
      }

      &.full-width {
        grid-column: 1 / span 2;
        justify-content: center;
        flex-direction: row;

        .value {
          padding-left: 1vw;
        }
      }

      .image {
        height: calc(3.8vw * var(--scaling-factor));
        aspect-ratio: 1;
        flex-shrink: 0;
        min-width: 0;

        img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      .value {
        font-size: calc(3.6vw * var(--scaling-factor));
        font-weight: 600;

        &.completed,
        .completed {
          color: var(--v-success-base);
        }

        .small {
          font-size: calc(2.5vw * var(--scaling-factor));
          font-weight: 400;
          opacity: 0.6;
        }
      }
    }
  }

  .hype {
    margin-left: 1vw;
    overflow: hidden;
    border-radius: 50%;
    border: 0.5vw solid var(--v-accent-base);
  }
</style>

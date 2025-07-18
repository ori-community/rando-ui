<template>
  <div class="resource-timer-view">
    <div class="resource-timer-grid" :style="{ '--scaling-factor': resourcesScalingFactor }">
      <div class="line full-width">
        <div class="image">
          <img src="@shared/images/tracker/spirit_light.png" alt="">
        </div>
        <div class="value">{{ spiritLight }}</div>
        <div v-if="gameFinished" class="image hype">
          <img src="@shared/images/ori_hype.png" alt="">
        </div>
      </div>

      <div class="line">
        <div class="image">
          <img src="@shared/images/tracker/keystone.png" alt="">
        </div>
        <div class="value">{{ keystones }}</div>
      </div>
      <div class="line">
        <div class="image">
          <img src="@shared/images/tracker/gorlek_ore.png" alt="">
        </div>
        <span class="value">
          <span :class="{ completed: gladesRebuildProjectsDone }">{{ gorlekOre }}</span><span
          :class="{ completed: gorlekOreCollected >= 29 || gladesRebuildProjectsDone }"
          class="small">/{{
            gorlekOreCollected
          }}</span>
        </span>
      </div>
      <div v-if="showTrees" class="line">
        <div class="image">
          <img src="@shared/images/tracker/tree.png" alt="">
        </div>
        <div class="value" :class="{ completed: treeCount === totalTreeCount }">
          {{ treeCount }}<span class="small">/{{ totalTreeCount }}</span>
        </div>
      </div>
      <div v-if="showWisps" class="line">
        <div class="image">
          <img src="@shared/images/tracker/wisp.png" alt="">
        </div>
        <div class="value" :class="{ completed: wispCount === totalWispCount }">
          {{ wispCount }}<span class="small">/{{ totalWispCount }}</span>
        </div>
      </div>
      <div v-if="showRelics" class="line">
        <div class="image">
          <img v-if="currentAreaHasUncollectedRelic" src="@shared/images/tracker/map_stone_highlight.png" alt="">
          <img v-else src="@shared/images/tracker/map_stone.png" alt="">
        </div>
        <div
          class="value"
          :class="{ completed: relicCount === totalRelicCount, highlight: currentAreaHasUncollectedRelic }">
          {{ relicCount }}<span class="small">/{{ totalRelicCount }}</span>
        </div>
      </div>
      <div v-if="showQuests" class="line">
        <div class="image">
          <img src="@shared/images/tracker/quest.png" alt="">
        </div>
        <div class="value" :class="{ completed: questCount === totalQuestCount }">
          {{ questCount }}<span class="small">/{{ totalQuestCount }}</span>
        </div>
      </div>
      <div v-if="showWillowHearts" class="line">
        <div class="image">
          <img src="@shared/images/tracker/willow_heart.png" alt="">
        </div>
        <div class="value" :class="{ completed: heartCount === totalHeartCount }">
          {{ heartCount }}<span class="small">/{{ totalHeartCount }}</span>
        </div>
      </div>

      <div v-if="showTimer" class="line timer-line full-width">
        <div class="timer-container">
          <div class="timer" :class="{ completed: gameFinished }">{{ mainTimerText }}<span class="fraction">{{
              fractionTimerText
            }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {formatTime} from "assets/utils/formatTime"

  const props = withDefaults(defineProps<{
    spiritLight: number,
    gorlekOre: number,
    gorlekOreCollected: number,
    keystones: number,
    treeCount: number,
    totalTreeCount: number,
    wispCount: number,
    totalWispCount: number,
    showWillowHearts: boolean,
    heartCount: number,
    totalHeartCount: number,
    questCount: number,
    totalQuestCount: number,
    gladesRebuildProjectsDone: boolean,
    relicCount: number,
    totalRelicCount: number,
    currentAreaHasUncollectedRelic: boolean,
    flags: string[],
    gameFinished: boolean,
    showTimer: boolean,
    time: number,
  }>(), {
    spiritLight: 0,
    gorlekOre: 0,
    gorlekOreCollected: 0,
    keystones: 0,
    treeCount: 0,
    totalTreeCount: 0,
    wispCount: 0,
    totalWispCount: 0,
    showWillowHearts: false,
    heartCount: 0,
    totalHeartCount: 0,
    questCount: 0,
    totalQuestCount: 0,
    gladesRebuildProjectsDone: false,
    relicCount: 0,
    totalRelicCount: 0,
    currentAreaHasUncollectedRelic: false,
    flags: () => [],
    gameFinished: false,
    showTimer: true,
    time: 0,
  })

  const mainTimerText = ref('0:00')
  const fractionTimerText = ref('.0')

  const showTrees = computed(() => {
    return props.flags.includes('All Trees')
  })
  const showWisps = computed(() => {
    return props.flags.includes('All Wisps')
  })
  const showRelics = computed(() => {
    return props.flags.includes('Relics')
  })
  const showQuests = computed(() => {
    return props.flags.includes('All Quests')
  })
  const rows = computed(() => {
    return 2 /* SL, KS, Ore */ + Math.ceil([
      props.showTrees,
      props.showWisps,
      props.showQuests,
      props.showRelics,
      props.showWillowHearts
    ].filter(v => v).length / 2)
  })
  const resourcesScalingFactor = computed(() => {
    return (rows.value >= 5 && props.showTimer)
      ? 0.8
      : 1.0
  })

  watch(() => props.time, (value) => {
    const parts = formatTime(value).split(
      '.',
      2,
    )
    mainTimerText.value = parts[0]
    fractionTimerText.value = '.' + parts[1]
  }, {immediate: true})

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
        isolation: isolate;
        position: relative;

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

        &.highlight,
        .highlight {
          color: #ffd300
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
  }</style>

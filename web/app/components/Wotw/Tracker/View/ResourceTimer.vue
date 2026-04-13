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
        <div class="value" :class="{ completed: treesCount === treesRequired }">
          {{ treesCount }}<span class="small">/{{ treesRequired }}</span>
        </div>
      </div>
      <div v-if="showWisps" class="line">
        <div class="image">
          <img src="@shared/images/tracker/wisp.png" alt="">
        </div>
        <div class="value" :class="{ completed: wispsCount === wispsRequired }">
          {{ wispsCount }}<span class="small">/{{ wispsRequired }}</span>
        </div>
      </div>
      <div v-if="showRelics" class="line">
        <div class="image">
          <img v-if="currentAreaHasUncollectedRelic" src="@shared/images/tracker/map_stone_highlight.png" alt="">
          <img v-else src="@shared/images/tracker/map_stone.png" alt="">
        </div>
        <div
          class="value"
          :class="{ completed: relicsCount === relicsRequired, highlight: currentAreaHasUncollectedRelic }">
          {{ relicsCount }}<span class="small">/{{ relicsRequired }}</span>
        </div>
      </div>
      <div v-if="showQuests" class="line">
        <div class="image">
          <img src="@shared/images/tracker/quest.png" alt="">
        </div>
        <div class="value" :class="{ completed: questsCount === questsRequired }">
          {{ questsCount }}<span class="small">/{{ questsRequired }}</span>
        </div>
      </div>
      <div v-if="showWillowHearts" class="line">
        <div class="image">
          <img src="@shared/images/tracker/willow_heart.png" alt="">
        </div>
        <div class="value" :class="{ completed: heartsCount === heartsRequired }">
          {{ heartsCount }}<span class="small">/{{ heartsRequired }}</span>
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
  import {formatTime} from "@/assets/utils/formatTime"

  const props = withDefaults(defineProps<{
    spiritLight?: number,
    gorlekOre?: number,
    gorlekOreCollected?: number,
    keystones?: number,
    treesCount?: number,
    treesRequired?: number,
    wispsCount?: number,
    wispsRequired?: number,
    showWillowHearts?: boolean,
    heartsCount?: number,
    heartsRequired?: number,
    questsCount?: number,
    questsRequired?: number,
    gladesRebuildProjectsDone?: boolean,
    relicsCount?: number,
    relicsRequired?: number,
    currentAreaHasUncollectedRelic?: boolean,
    gameFinished?: boolean,
    showTimer?: boolean,
    time?: number,
  }>(), {
    spiritLight: 0,
    gorlekOre: 0,
    gorlekOreCollected: 0,
    keystones: 0,
    treesCount: 0,
    treesRequired: 0,
    wispsCount: 0,
    wispsRequired: 0,
    showWillowHearts: false,
    heartsCount: 0,
    heartsRequired: 0,
    questsCount: 0,
    questsRequired: 0,
    gladesRebuildProjectsDone: false,
    relicsCount: 0,
    relicsRequired: 0,
    currentAreaHasUncollectedRelic: false,
    gameFinished: false,
    showTimer: true,
    time: 0,
  })

  const mainTimerText = ref('0:00')
  const fractionTimerText = ref('.0')

  const showTrees = computed(() => {
    return props.treesRequired > 0
  })
  const showWisps = computed(() => {
    return props.wispsRequired > 0
  })
  const showRelics = computed(() => {
    return props.relicsRequired > 0
  })
  const showQuests = computed(() => {
    return props.questsRequired > 0
  })

  const rows = computed(() => {
    return 2 /* SL, KS, Ore */ + Math.ceil([
      showTrees.value,
      showWisps.value,
      showQuests.value,
      showRelics.value,
      props.showWillowHearts,
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

    mainTimerText.value = parts[0]!
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
            color: rgb(var(--v-theme-success));
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
          color: rgb(var(--v-theme-success));
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
    border: 0.5vw solid rgb(var(--v-theme-accent));
  }</style>

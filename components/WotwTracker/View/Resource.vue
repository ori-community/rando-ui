<template>
  <div class="resource-view">
    <div class="resource-grid">
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
        <div class="value">
          {{ gorlekOre }}<span class="small">/{{ gorlekOreCollected }}</span>
        </div>
      </div>
      <div v-if="flags.includes('Force Trees')" class="line">
        <div class="image">
          <img src="@/assets/images/tracker/tree.png" />
        </div>
        <div class="value" :class="{ completed: treeCount === totalTreeCount }">
          {{ treeCount }}<span class="small">/{{ totalTreeCount }}</span>
        </div>
      </div>
      <div v-if="flags.includes('Force Wisps')" class="line">
        <div class="image">
          <img src="@/assets/images/tracker/wisp.png" />
        </div>
        <div class="value" :class="{ completed: wispCount === totalWispCount }">
          {{ wispCount }}<span class="small">/{{ totalWispCount }}</span>
        </div>
      </div>
      <div v-if="flags.includes('World Tour')" class="line">
        <div class="image">
          <img src="@/assets/images/tracker/map_stone.png" />
        </div>
        <div class="value" :class="{ completed: relicCount === totalRelicCount }">
          {{ relicCount }}<span class="small">/{{ totalRelicCount }}</span>
        </div>
      </div>
      <div v-if="flags.includes('Force Quests')" class="line">
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
    </div>
  </div>
</template>

<script>
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
    },
  }
</script>

<style lang="scss" scoped>
  .resource-view {
    position: relative;
    padding-top: 1vw;
    padding-bottom: 1vw;
    padding-left: 1vw;
  }

  .resource-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: 17%;
    gap: 0.5vw;
    height: 100%;
    align-content: center;

    .line {
      display: flex;
      min-height: 0;
      justify-content: flex-start;
      align-items: center;
      flex-direction: row-reverse;
      flex-shrink: 1;

      .value {
        padding-right: 0.5vw;
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
        height: 100%;
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
        font-size: 3.75vw;
        font-weight: 600;

        &.completed {
          color: var(--v-success-base);
        }

        .small {
          font-size: 2.5vw;
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

<template>
  <div class="skill" :class="{ active: acquired }">
    <img class="skill-image" :src="imageSource" alt="" />

    <div class="tree" :class="{ active: treeAcquired }">
      <img src="@/assets/images/tracker/tree.png" alt="" />
      <img class="shadow" src="@/assets/images/tracker/tree.png" alt="" />
    </div>
    <div class="bonus-melting" :class="{ active: bonusMeltingAcquired }">
      <img class="glow" src="@/assets/images/tracker/melting.png" alt="" />
      <img src="@/assets/images/tracker/melting.png" alt="" />
    </div>
    <div v-if="fragmentsRequired > 0" class="fragments" :class="{ 'completed': fragmentsFound >= fragmentsRequired }">
      <span class="found">{{ fragmentsFound }}</span><span class="required">/{{ fragmentsRequired }}</span>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'SkillView',
    props: {
      skill: {
        type: String,
        required: true,
      },
      acquired: {
        type: Boolean,
        default: false,
      },
      treeAcquired: {
        type: Boolean,
        default: false,
      },
      bonusMeltingAcquired: {
        type: Boolean,
        default: false,
      },
      fragmentsFound: {
        type: Number,
        default: 0,
      },
      fragmentsRequired: {
        type: Number,
        default: 0,
      },
    },
    computed: {
      imageSource() {
        return require(`@/assets/images/tracker/skills/${this.skill}.png`)
      },
    },
  }
</script>

<style lang="scss" scoped>
  .skill {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    .skill-image {
      transform: scale(0.9);
      transition: filter 200ms, opacity 200ms, transform 200ms;
      opacity: 0.2;
      filter: grayscale(0.6);
    }

    &.active {
      .skill-image {
        opacity: 1;
        filter: grayscale(0) brightness(1);
        transform: scale(1);
      }
    }

    img {
      width: 100%;
    }

    .tree {
      z-index: 0;
      position: absolute;
      top: 55%;
      left: 66%;
      width: 30%;
      transform-origin: bottom center;
      transform: scale(0);
      transition: transform 300ms;

      &.active {
        transform: scale(1);
      }

      .shadow {
        z-index: -1;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        transform: scale(1.2);
        filter: brightness(0) blur(7px);
      }
    }

    .bonus-melting {
      z-index: 0;
      position: absolute;
      left: 15%;
      width: 25%;
      bottom: 0;
      transform-origin: bottom center;
      transform: scale(0);
      transition: transform 300ms;
      mix-blend-mode: darken;

      &.active {
        transform: scale(1);
      }

      .glow {
        z-index: -1;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        transform-origin: bottom center;
        transform: scale(1.2);
        filter: blur(6px);
      }
    }

    .completed {
      color: var(--v-success-base);
    }

    .fragments {
      z-index: 0;
      position: absolute;
      left: 15%;
      width: 50%;
      bottom: 0;
      text-shadow: -1px -1px 0.2vw #000, 1px -1px 0.2vw #000, -1px 1px 0.2vw #000, 1px 1px 0.2vw #000;
      .found {
        font-size: 3vw;
        font-weight: bold;
      }

      .required {
        font-size: 2vw;
        font-weight: bold;
      }
    }
  }
</style>

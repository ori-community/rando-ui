<template>
  <div class="skill" :class="{ active: acquired }">
    <img class="skill-image" :src="imageSource" alt="" />

    <div class="tree" :class="{ active: treeAcquired }">
      <div class="shadow"></div>
      <img src="@/assets/images/tracker/tree.png" alt="" />
    </div>
    <div class="bonus-melting" :class="{ active: bonusMeltingAcquired }">
      <div class="shadow"></div>
      <img src="@/assets/images/tracker/melting.png" alt="" />
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
        width: 100%;
        height: 100%;
        background-color: black;
        filter: blur(7px);
      }
    }
    .bonus-melting {
      z-index: 0;
      position: absolute;
      top: 60%;
      left: 15%;
      width: 25%;
      transform-origin: bottom center;
      transform: scale(0);
      transition: transform 300ms;
      filter: brightness(0.9);

      &.active {
        transform: scale(1);
      }

      .shadow {
        z-index: -1;
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: black;
        filter: blur(7px);
      }
    }
  }
</style>

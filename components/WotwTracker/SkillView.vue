<template>
  <div class='skill' :class='{active: Boolean(active)}'>
    <img class='skill-image' :src='imageSource' alt='' />

    <div class='tree' :class='{active: Boolean(tree)}'>
      <div class='shadow'></div>
      <img src='@/assets/images/tracker/tree.png' alt='' />
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
      active: {
        type: Number,
        default: 0,
      },
      tree: {
        type: Number,
        default: 0,
      }
    },
    computed: {
      imageSource() {
        return require(`@/assets/images/tracker/skills/${this.skill}.png`)
      },
    },
  }
</script>

<style lang='scss' scoped>
  .skill {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    .skill-image {
      transform: scale(0.9);
      transition: filter 200ms, opacity 200ms, transform 200ms;
      opacity: 0.35;
      filter: grayscale(0.6);
    }

    &.active {
      .skill-image {
        opacity: 1;
        filter: grayscale(0) brightness(1.0);
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
  }
</style>

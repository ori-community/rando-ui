<template>
  <div class='resource-view'>
    <div v-if='flags.length > 0' class='flags pb-2'>
      <img v-if='flags.includes("Force Trees")' src='@/assets/images/tracker/tree.png'>
      <img v-if='flags.includes("Force Wisps")' src='@/assets/images/tracker/wisp.png'>
      <img v-if='flags.includes("Force Quests")' src='@/assets/images/tracker/quest.png'>
      <img v-if='flags.includes("World Tour")' src='@/assets/images/tracker/map_stone.png'>
    </div>
    <div class='resource-line'>
      <img src='@/assets/images/tracker/spirit_light.png'>
      <div class='value'>{{ spiritLight }}</div>
    </div>
    <div class='resource-line'>
      <img src='@/assets/images/tracker/keystone.png'>
      <div class='value'>{{ keystones }}</div>
    </div>
    <div class='resource-line'>
      <img src='@/assets/images/tracker/gorlek_ore.png'>
      <div class='value'>{{ gorlekOre }}</div>
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
      keystones: {
        type: Number,
        default: 0,
      },
      flags: {
        type: Array,
        default: () => ([]),
      },
    },
  }
</script>

<style lang='scss' scoped>
  .flags {
    display: flex;
    gap: 0.5em;
    justify-content: center;
    align-items: center;

    img {
      height: 40px;
    }
  }

  .resource-view {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .resource-line {
    display: flex;
    gap: 0.5em;
    align-items: center;

    img {
      height: 40px;
    }

    .value {
      font-size: 1.2em;
      min-width: 40px;
    }
  }
</style>

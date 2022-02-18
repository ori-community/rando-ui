<template>
  <div class='resource-view'>
    <div v-if='flags.length > 0' class='flags pb-2'>
      <img v-if='flags.includes("Force Trees")' src='@/assets/images/tracker/tree.png'>
      <img v-if='flags.includes("Force Wisps")' src='@/assets/images/tracker/wisp.png'>
      <img v-if='flags.includes("Force Quests")' src='@/assets/images/tracker/quest.png'>
      <img v-if='flags.includes("World Tour")' src='@/assets/images/tracker/map_stone.png'>
    </div>
    <div class='resource-grid'>
      <div class='image'>
        <img src='@/assets/images/tracker/spirit_light.png'>
      </div>
      <div class='value'>{{ spiritLight }}</div>
      <div class='image'>
        <img src='@/assets/images/tracker/keystone.png'>
      </div>
      <div class='value'>{{ keystones }}</div>
      <div class='image'>
        <img src='@/assets/images/tracker/gorlek_ore.png'>
      </div>
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
  .resource-view {
    position: relative;
    display: grid;
    grid-template-rows: 20% 80%;

    .flags {
      display: flex;
      gap: 0.5em;
      justify-content: center;
      align-items: center;

      img {
        max-width: 100%;
        max-height: 100%;
      }
    }
  }

  .resource-grid {
    display: grid;
    grid-template-columns: 50% 50%;
    grid-template-rows: 28% 28% 28%;
    align-items: stretch;

    .image {
      min-width: 0;
      min-height: 0;
      justify-self: right;

      img {
        max-width: 100%;
        max-height: 100%;
      }
    }

    .value {
      padding-left: 0.25em;
      min-width: 0;
      min-height: 0;
      font-size: 4vw;
      display: flex;
      align-items: center;
    }
  }
</style>

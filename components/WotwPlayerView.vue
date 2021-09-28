<template>
  <div class='player-view'>
    <discord-avatar :user='user' class='mr-1' :multiverse-id='multiverseId' v-bind='$attrs' />
    {{ user.name }}
  </div>
</template>

<script>
  export default {
    name: 'WotwPlayerView',
    props: {
      user: {
        type: Object,
        required: true,
      },
      multiverseId: {
        type: Number,
        required: false,
        default: null,
      }
    },
  }
</script>

<style lang='scss' scoped>
  .player-view {

  }
</style>

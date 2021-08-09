<template>
  <div class='player-view'>
    <discord-avatar :user='user' />
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
      }
    },
  }
</script>

<style lang='scss' scoped>
  .player-view {

  }
</style>

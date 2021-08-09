<template>
  <div class='player-view'>
    <discord-avatar :user='user' class='mr-1' />
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

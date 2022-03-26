<template>
  <div class='player-view'>
    <discord-avatar :user='user' class='mr-1' :multiverse-id='multiverseId' v-bind='$attrs' />
    {{ user.name }}
    <copyable-info v-if="devtoolsEnabled" :value="user.id" />
  </div>
</template>

<script>
  import {mapState} from 'vuex'

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
    computed: {
      ...mapState('dev', ['devtoolsEnabled']),
    },
  }
</script>

<style lang='scss' scoped>
  .player-view {

  }
</style>

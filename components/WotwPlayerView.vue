<template>
  <div class='player-view'>
    <discord-avatar :user='user' class='mr-1' :multiverse-id='multiverseId' v-bind='$attrs' />
    <div>
      <div class="name-and-points">
        {{ user.name }}
        <wotw-experience-points v-if="withPoints" class="points">{{ user.points }}</wotw-experience-points>
        <copyable-info v-if="devtoolsEnabled" :value="user.id" />
      </div>
      <slot />
    </div>
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
      },
      withPoints: {
        type: Boolean,
        default: false,
      }
    },
    computed: {
      ...mapState('dev', ['devtoolsEnabled']),
    },
  }
</script>

<style lang='scss' scoped>
  .player-view {
    display: flex;
    align-items: center;
    line-height: 1;
    gap: 0.1em;

    .name-and-points {
      display: flex;
      gap: 0.5em;

      .points {
        font-size: 0.8em;
      }
    }
  }
</style>

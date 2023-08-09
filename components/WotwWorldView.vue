<template>
  <v-card ref="worldView" class="world-view" outlined color="background lighten-2">
    <v-sheet :color="world.color" class="flex-shrink-0" height="0.5em" />
    <v-card-title class="d-flex">
      <div class="world-title">
        <div>
          {{ world.name }}
          <copyable-info v-if="devtoolsEnabled" :value="world.id" />
          <span v-if="finishedAt !== null && showWorldFinishedTime" class="finished-time">{{ formatTime(finishedAt) }}</span>
        </div>
        <wotw-seed-button v-if="!!world.seedId && !isElectron" :world-seed-id="world.seedId" />
      </div>
    </v-card-title>
    <v-card-text>
      <v-scroll-x-transition leave-absolute group tag="div">
        <wotw-player-view
          v-for="player in world.members"
          :key="player.id"
          class="mb-1"
          :user="player"
          :multiverse-id="multiverseId"
        >
          <div class="player-info" title="Loading time">
            <span v-if="hasMultiplePlayers && hasOwnProperty(playerFinishedTimes, player.id)" class="finished-time" :class="{forfeited: playerFinishedTimes[player.id] === 0.0}" title="Finished time">{{
              playerFinishedTimes[player.id] !== 0.0 ? formatTime(playerFinishedTimes[player.id]) : 'DNF'
            }}</span>
            <span v-else-if="hasOwnProperty(playerLoadingTimes, player.id)" class="loading-time" title="Loading time">{{
              formatTime(-1 * playerLoadingTimes[player.id])
            }}</span>
          </div>
        </wotw-player-view>
      </v-scroll-x-transition>
    </v-card-text>
    <div class="spacer"></div>
    <v-btn v-if="canJoinInternal" :disabled="disabled" block color="accent" tile @click="$emit('join')"> Join </v-btn>
  </v-card>
</template>

<script>
  import { mapState } from 'vuex'
  import { formatTime } from '../assets/lib/formatTime'
  import { isElectron } from '~/assets/lib/isElectron'
  import { hasOwnProperty } from '~/assets/lib/hasOwnProperty'
  import { confettiFromElement } from '~/assets/lib/confettiFromElement'

  export default {
    name: 'WotwWorldView',
    props: {
      world: {
        type: Object,
        required: true,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      canJoin: {
        type: Boolean,
        default: true,
      },
      multiverseId: {
        type: Number,
        required: false,
        default: null,
      },
      playerLoadingTimes: {
        type: Object,
        required: false,
        default: () => ({}),
      },
      playerFinishedTimes: {
        type: Object,
        required: false,
        default: () => ({}),
      },
      finishedAt: {
        type: Number,
        default: null,
      },
      showWorldFinishedTime: {
        type: Boolean,
        default: true,
      },
    },
    computed: {
      ...mapState('user', ['user']),
      ...mapState('dev', ['devtoolsEnabled']),
      isElectron,
      canJoinInternal() {
        return this.canJoin && !this.world.members.some((u) => u.id === this.user?.id)
      },
      hasMultiplePlayers() {
        return this.world.members.length > 1
      },
    },
    watch: {
      finishedAt(value) {
        if (value) {
          confettiFromElement(this.$refs.worldView.$el, {
            disableForReducedMotion: true,
            zIndex: 100000,
          })
        }
      },
    },
    methods: {
      formatTime,
      hasOwnProperty,
    },
  }
</script>

<style lang="scss" scoped>
  .world-view {
    min-width: 15vw;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .spacer {
      flex-basis: 100%;
    }

    .world-title {
      flex-grow: 1;
      display: flex;
      gap: 0.5em;
      justify-content: space-between;

      .finished-time {
        font-size: 0.7em;
      }
    }
  }

  .player-info {
    font-size: 0.7em;
  }

  .loading-time {
    opacity: 0.6;
  }

  .finished-time {
    color: var(--v-success-base);

    &.forfeited {
      color: var(--v-error-base);
    }
  }
</style>

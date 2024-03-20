<template>
  <div class="universe-view-container">
    <v-fab-transition>
      <div v-if="place !== null" class="badge-container">
        <place-badge class="badge" :place="place" />
      </div>
    </v-fab-transition>
    <v-card class="universe-view">
      <v-sheet v-if="!hideColor" :color="universe.color" height="0.5em" />
      <v-card-title class="card-title">
        <div>
          {{ universe.name }}
          <copyable-info v-if="devtoolsEnabled" :value="universe.id" />
          <span v-if="finishedAt !== null" class="finished-time" :class="{forfeited: finishedAt === 0.0}">{{ finishedAt !== 0.0 ? formatTime(finishedAt) : 'DNF' }}</span>
        </div>
      </v-card-title>
      <v-card-text>
        <v-scroll-y-reverse-transition leave-absolute group tag="div" class="d-flex flex-wrap worlds">
          <wotw-world-view
            v-for="world in universe.worlds"
            :key="world.id"
            class="flex-grow-1"
            :world="world"
            :disabled="disabled"
            :can-join="canJoin"
            :race-starting-at="raceStartingAt"
            :player-in-game-times="playerInGameTimes"
            :player-finished-times="playerFinishedTimes"
            :finished-at="worldFinishedTimes[world.id] ?? null"
            :show-world-finished-time="hasMultipleWorlds"
            :seed-spoiler-downloaded-by-ids="seedSpoilerDownloadedByIds"
            :connected-user-ids="connectedUserIds"
            :race-ready-user-ids="raceReadyUserIds"
            @join="$emit('join-world', world.id)"
          />
        </v-scroll-y-reverse-transition>
      </v-card-text>
      <v-btn v-if="canJoin && canCreateWorld" :disabled="disabled" block color="accent" tile @click="$emit('new-world')">
        New World
      </v-btn>
    </v-card>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { formatTime } from '../assets/lib/formatTime'

  export default {
    name: 'WotwUniverseView',
    props: {
      universe: {
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
      canCreateWorld: {
        type: Boolean,
        default: true,
      },
      hideColor: {
        type: Boolean,
        required: false,
        default: false,
      },
      isSpectating: {
        type: Boolean,
        default: false
      },
      raceStartingAt: {
        type: Number,
        required: false,
        default: null,
      },
      playerInGameTimes: {
        type: Object,
        required: false,
        default: () => ({}),
      },
      playerFinishedTimes: {
        type: Object,
        required: false,
        default: () => ({}),
      },
      worldFinishedTimes: {
        type: Object,
        required: false,
        default: () => ({}),
      },
      finishedAt: {
        type: Number,
        default: null,
      },
      place: {
        type: Number,
        default: null,
      },
      seedSpoilerDownloadedByIds: {
        type: Array,
        default: () => ([]),
      },
      connectedUserIds: {
        type: Array,
        default: () => ([]),
      },
      raceReadyUserIds: {
        type: Array,
        default: () => ([]),
      },
    },
    computed: {
      ...mapState('user', ['user']),
      ...mapState('dev', ['devtoolsEnabled']),
      hasMultipleWorlds() {
        return this.universe.worlds.length > 1
      }
    },
    methods: { formatTime },
  }
</script>

<style lang="scss" scoped>
  .universe-view-container {
    position: relative;
    overflow: visible !important;

    .badge-container {
      position: absolute;
      top: 0;
      right: 0;
      height: 0;

      .badge {
        position: absolute;
        top: 0;
        right: 0;
        transform: translateX(33%) translateY(-33%);
        z-index: 1;
      }
    }
  }

  .universe-view {
    min-width: 15vw;
    overflow: hidden;
  }

  .worlds {
    gap: 1em;
  }

  .finished-time {
    color: var(--v-success-base);
    font-size: 0.7em;
    line-height: 1;
    padding-right: 2em;

    &.forfeited {
      color: var(--v-error-base);
    }
  }
</style>

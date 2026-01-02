<template>
  <div class="universe-view-container">
    <v-fab-transition>
      <div v-if="place !== null" class="badge-container">
        <place-badge class="badge" :place="place"/>
      </div>
    </v-fab-transition>
    <v-card class="universe-view">
      <v-sheet v-if="!hideColor" :color="universe.color" height="0.5em"/>
      <v-card-title class="card-title">
        <div>
          {{ universe.name }}
          <copyable-info v-if="devtoolsEnabled" :value="universe.id"/>
          <span v-if="finishedAt !== null" class="finished-time" :class="{forfeited: finishedAt === 0.0}">{{
              finishedAt !== 0.0 ? formatTime(finishedAt) : 'DNF'
            }}</span>
        </div>
      </v-card-title>
      <v-card-text>
        <v-scroll-y-reverse-transition leave-absolute group tag="div" class="d-flex flex-wrap worlds">
          <wotw-multiverse-world-view
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
      <v-btn v-if="canJoin && canCreateWorld" :disabled="disabled" block color="accent" tile
             @click="$emit('new-world')">
        New World
      </v-btn>
    </v-card>
  </div>
</template>

<script lang="ts" setup>

  import type {UniverseInfo} from "@shared/proto/messages"
  import {formatTime} from "assets/utils/formatTime"
  
  const props = withDefaults(defineProps<{
    canCreateWorld?: boolean,
    canJoin?: boolean,
    connectedUserIds?: number[],
    disabled?: boolean,
    finishedAt?: number | null,
    hideColor?: boolean,
    isSpectating?: boolean,
    place?: number | null,
    playerFinishedTimes?: { [key: number]: number },
    playerInGameTimes?: { [key: number]: number },
    raceReadyUserIds?: number[],
    raceStartingAt?: number | null,
    seedSpoilerDownloadedByIds?: number[],
    universe: UniverseInfo,
    worldFinishedTimes?: { [key: number]: number },
  }>(), {
    canCreateWorld: true,
    canJoin: true,
    connectedUserIds: () => ([]),
    disabled: false,
    finishedAt: null,
    hideColor: false,
    isSpectating: false,
    place: null,
    playerFinishedTimes: () => ({}),
    playerInGameTimes: () => ({}),
    raceReadyUserIds: () => ([]),
    raceStartingAt: null,
    seedSpoilerDownloadedByIds: () => ([]),
    worldFinishedTimes: () => ({}),
  })

  const hasMultipleWorlds = computed(() => {
    return props.universe.worlds.length > 1
  })
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

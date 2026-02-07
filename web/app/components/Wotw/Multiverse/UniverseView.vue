<template>
  <div class="universe-view-container">
    <v-fab-transition>
      <div v-if="rank !== null" class="badge-container">
        <rando-place-badge class="badge" :place="rank"/>
      </div>
    </v-fab-transition>
    <v-card class="universe-view">
      <v-sheet v-if="!hideColor" :color="universe.color" height="0.5em"/>
      <v-card-title class="card-title">
        <div>
          {{ universe.name }}
          <rando-copyable-info v-if="devtoolsEnabled" :value="universe.id.toString()"/>
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
            @join="emits('join-world', world.id)"
          />
        </v-scroll-y-reverse-transition>
      </v-card-text>
      <v-btn
        v-if="canJoin && canCreateWorld"
        :disabled="disabled"
        block
        color="accent"
        tile
        @click="emits('new-world')">
        New World
      </v-btn>
    </v-card>
  </div>
</template>

<script lang="ts" setup>
  import type {UniverseInfo} from "@shared/types/http-api"
  import {formatTime} from "@web/app/assets/utils/formatTime"
  import {useDevtoolsStore} from "~/stores/devtools"

  const props = withDefaults(defineProps<{
    canCreateWorld?: boolean,
    canJoin?: boolean,
    connectedUserIds?: string[],
    disabled?: boolean,
    finishedAt?: number | null,
    hideColor?: boolean,
    isSpectating?: boolean,
    rank?: number | string | null,
    playerFinishedTimes?: { [key: number]: number },
    playerInGameTimes?: { [key: number]: number },
    raceReadyUserIds?: string[],
    raceStartingAt?: number | null,
    seedSpoilerDownloadedByIds?: string[],
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
    rank: null,
    playerFinishedTimes: () => ({}),
    playerInGameTimes: () => ({}),
    raceReadyUserIds: () => ([]),
    raceStartingAt: null,
    seedSpoilerDownloadedByIds: () => ([]),
    worldFinishedTimes: () => ({}),
  })

  const emits = defineEmits(["join-world", "new-world"])

  const {devtoolsEnabled} = storeToRefs(useDevtoolsStore())
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
    color: rgb(var(--v-theme-success));
    font-size: 0.7em;
    line-height: 1;
    padding-right: 2em;

    &.forfeited {
      color: rgb(var(--v-theme-error));
    }
  }
</style>

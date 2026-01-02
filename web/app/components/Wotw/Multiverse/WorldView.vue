<template>
  <v-card ref="worldView" class="world-view" outlined color="background lighten-2">
    <v-sheet :color="world.color" class="flex-shrink-0" height="0.5em"/>
    <v-card-title class="d-flex">
      <div class="world-title">
        <div>
          {{ world.name }}
          <copyable-info v-if="devtoolsEnabled" :value="world.id"/>
          <span v-if="finishedAt !== null && showWorldFinishedTime" class="finished-time">{{
              formatTime(finishedAt)
            }}</span>
        </div>
        <wotw-seed-button v-if="!!world.seedId && !isElectron" :world-seed-id="world.seedId"/>
      </div>
    </v-card-title>
    <v-card-text>
      <v-scroll-x-transition leave-absolute group tag="div">
        <wotw-multiverse-player-view
          v-for="membership in world.memberships"
          :key="membership.id"
          class="mb-1"
          :user="membership.user"
          :connected="connectedUserIds.includes(membership.user.id)"
          :race-ready="raceReadyUserIds.includes(membership.user.id)"
        >
          <div class="player-info" title="Loading time">
            <v-tooltip v-if="seedSpoilerDownloadedByIds.includes(membership.user.id)" bottom>
              <template #activator="{on}">
                <v-icon x-small v-on="on">mdi-eye-outline</v-icon>
              </template>
              <span>Has seen spoiler</span>
            </v-tooltip>
            <span v-if="hasMultiplePlayers && hasOwnProperty(playerFinishedTimes, membership.id)" class="finished-time"
                  :class="{forfeited: playerFinishedTimes[membership.id] === 0.0}" title="Finished time">{{
                playerFinishedTimes[membership.id] !== 0.0 ? formatTime(playerFinishedTimes[membership.id]) : 'DNF'
              }}</span>
            <span
              v-else-if="raceStartingAt > 0 && hasOwnProperty(playerInGameTimes, membership.id) && !hasOwnProperty(playerFinishedTimes, membership.id)"
              class="loading-time" title="Loading time">{{
                formatTime(playerInGameTimes[membership.id] - (now() - raceStartingAt) / 1000.0, 1, false, true)
              }}</span>
          </div>
        </wotw-multiverse-player-view>
      </v-scroll-x-transition>
    </v-card-text>
    <div class="spacer"></div>
    <v-btn v-if="canJoinInternal" :disabled="disabled" block color="accent" tile @click="$emit('join')"> Join</v-btn>
  </v-card>
</template>

<script lang="ts" setup>

  import type {WorldInfo} from "@shared/proto/messages"
  import {formatTime} from "assets/utils/formatTime"

  const props = withDefaults(defineProps<{
    canJoin?: boolean,
    connectedUserIds?: number[],
    disabled?: boolean,
    finishedAt?: number | null,
    playerFinishedTimes?: { [key: number]: number },
    playerInGameTimes?: { [key: number]: number },
    raceReadyUserIds?: number[],
    raceStartingAt?: number | null,
    seedSpoilerDownloadedByIds?: number[],
    showWorldFinishedTime?: boolean,
    world: WorldInfo,
  }>(), {
    canJoin: true,
    connectedUserIds: () => ([]),
    disabled: false,
    finishedAt: null,
    playerFinishedTimes: () => ({}),
    playerInGameTimes: () => ({}),
    raceReadyUserIds: () => ([]),
    raceStartingAt: null,
    seedSpoilerDownloadedByIds: () => ([]),
    showWorldFinishedTime: true,
  })

  const userStore = useUserStore()

  const canJoinInternal = computed(() => {
    return props.canJoin && !props.world.memberships.some(m => m.user?.id === userStore.user?.id)
  })
  const hasMultiplePlayers = computed(() => {
    return props.world.memberships.length > 1
  })

  watch(() => props.finishedAt, (value) => {
    if (value) {
      // TODO confetti
      // confettiFromElement(this.$refs.worldView.$el, {
      //   disableForReducedMotion: true,
      //   zIndex: 100000,
      // })
    }
  })

  const now = (() => {
    return Date.now()
  })
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

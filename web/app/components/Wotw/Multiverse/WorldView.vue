<template>
  <v-card ref="worldViewRef" class="world-view" outlined color="background-lighten-2">
    <v-sheet :color="world.color" class="flex-shrink-0" height="0.5em"/>
    <v-card-title class="d-flex">
      <div class="world-title">
        <div>
          {{ world.name }}
          <rando-copyable-info v-if="devtoolsEnabled" :value="world.id.toString()"/>
          <span v-if="finishedAt !== null && showWorldFinishedTime" class="finished-time">{{
              formatTime(finishedAt)
            }}</span>
        </div>
<!--        <wotw-seed-button v-if="!!world.seedId && !isElectron" :world-seed-id="world.seedId"/>-->
      </div>
    </v-card-title>
    <v-card-text>
      <v-scroll-x-transition leave-absolute group tag="div">
        <wotw-multiverse-player-view
          v-for="membership in world.memberships"
          :key="membership.id"
          :user="membership.user"
          :connected="connectedUserIds.includes(membership.user.id)"
          :race-ready="raceReadyUserIds.includes(membership.user.id)"
        >
          <div class="player-info">
            <div v-if="seedSpoilerDownloadedByIds.includes(membership.user.id)">
              <v-icon size="x-small">mdi-eye-outline</v-icon>
              <v-tooltip
                location="bottom"
                activator="parent">
                <span>Has seen spoiler</span>
              </v-tooltip>
            </div>
            <template v-if="Object.hasOwn(playerFinishedTimes, membership.id)">
              <span
                v-if="hasMultiplePlayers"
                class="finished-time"
                :class="{forfeited: playerFinishedTimes[membership.id] === 0.0}"
                title="Finished time"
              >
                {{ playerFinishedTimes[membership.id] !== 0.0 ? formatTime(playerFinishedTimes[membership.id]!) : "DNF" }}
              </span>
              <span
                v-else-if="raceStartingAt && raceStartingAt > 0 && membership.id in playerInGameTimes && !(membership.id in playerFinishedTimes)"
                class="loading-time" title="Loading time"
              >
                {{ formatTime(playerInGameTimes[membership.id]! - (now() - raceStartingAt) / 1000.0, 1, false, true) }}
              </span>
            </template>
          </div>
        </wotw-multiverse-player-view>
      </v-scroll-x-transition>
    </v-card-text>
    <div class="spacer"/>
    <v-btn v-if="canJoinInternal" :disabled="disabled" block color="accent" tile @click="emits('join')"> Join</v-btn>
  </v-card>
</template>

<script lang="ts" setup>
  import type {WorldInfo} from "@shared/types/http-api"
  import {formatTime} from "@web/app/assets/utils/formatTime"
  import {confettiFromElement} from "~/assets/utils/confetti";
  import {useDevtoolsStore} from "~/stores/devtools"

  const props = withDefaults(defineProps<{
    canJoin?: boolean,
    connectedUserIds?: string[],
    disabled?: boolean,
    finishedAt?: number | null,
    playerFinishedTimes?: { [key: number]: number },
    playerInGameTimes?: { [key: number]: number },
    raceReadyUserIds?: string[],
    raceStartingAt?: number | null,
    seedSpoilerDownloadedByIds?: string[],
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
  const isElectron = useIsElectron()
  const worldViewRef = ref<{ $el: HTMLElement } | null>(null)
  const {devtoolsEnabled} = storeToRefs(useDevtoolsStore())

  const emits = defineEmits(["join"])

  const canJoinInternal = computed(() => {
    return props.canJoin && !props.world.memberships.some(m => m.user?.id === userStore.user?.id)
  })
  const hasMultiplePlayers = computed(() => {
    return props.world.memberships.length > 1
  })

  watch(() => props.finishedAt, (value) => {
    if (value && worldViewRef.value) {
      confettiFromElement(worldViewRef.value.$el, {
        disableForReducedMotion: true
      })
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
    color: rgb(var(--v-theme-success));

    &.forfeited {
      color: rgb(var(--v-theme-error));
    }
  }
</style>

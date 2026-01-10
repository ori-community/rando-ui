<template>
  <v-card
    class="universe-view"
    :class="{ 'universe-hidden': universeHidden }"
    @click="emits('click')"
  >
    <v-sheet :color="universeHidden ? '' : universe.color" class="color-stripe">
      <div v-if="!!bingoUniverse" class="squares px-2">
        {{ universeHidden && !isSpectating ? '?' : bingoUniverse.squares }}
      </div>
    </v-sheet>
    <div v-if="!!universe" class="pa-2 players">
      <template v-for="world in universe.worlds">
        <wotw-multiverse-player-view
          v-for="player in world.memberships.map(m => m.user)"
          :key="player?.id"
          :user="player"
          :size="24"
        />
      </template>
    </div>
    <v-spacer/>
    <div v-if="!!bingoUniverse" class="lines px-3">
      <v-icon size="16">mdi-vector-line</v-icon>
      {{ universeHidden && !isSpectating ? '?' : bingoUniverse.lines }}
    </div>
  </v-card>
</template>

<script lang="ts" setup>

  import type {UniverseInfo, BingoUniverseInfo} from "@shared/types/http-api";

  const emits = defineEmits(["click"])
  const props = withDefaults(defineProps<{
    universe: UniverseInfo,
    bingoUniverse?: BingoUniverseInfo | null,
    isSpectating?: boolean,
    universeHidden?: boolean,
  }>(), {
    bingoUniverse: null,
    isSpectating: false,
    universeHidden: false,
  })
</script>

<style lang="scss" scoped>
  .universe-view {
    overflow: hidden;
    display: flex;
    flex-direction: row;
    position: relative;

    &.universe-hidden {
      .squares {
        opacity: 0.5;
      }
    }

    .color-stripe {
      border-radius: 0 !important;
      position: relative;
      flex-shrink: 0;

      .squares {
        width: 2.5em;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        font-size: 1.75em;
        font-weight: bold;
        transform: translateY(0.05em);
      }
    }

    .players {
      display: flex;
      flex-direction: column;
      gap: 0.2em;
      justify-content: center;
    }

    .lines {
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 0.3em;
    }
  }
</style>

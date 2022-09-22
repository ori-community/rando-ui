<template>
  <v-card
    class="universe-view"
    :class="{ 'universe-hidden': universeHidden }"
    @click="$emit('click')"
  >
    <v-sheet :color="universeHidden ? '' : universe.color" class="color-stripe">
      <div v-if="!!bingoUniverse" class="squares px-2">
        {{ universeHidden ? '?' : bingoUniverse.squares }}
      </div>
    </v-sheet>
    <div v-if="!!universe" class="pa-2 players">
      <template v-for="world in universe.worlds">
        <wotw-player-view
          v-for="player in world.members"
          :key="player.id"
          class="player-view"
          :user="player"
          :size="24"
        />
      </template>
    </div>
    <v-spacer />
    <div v-if="!!bingoUniverse" class="lines px-3">
      <v-icon size="16">mdi-vector-line</v-icon>
      {{ universeHidden ? '?' : bingoUniverse.lines }}
    </div>
  </v-card>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'WotwBingoUniverseView',
    props: {
      universe: {
        type: Object,
        required: true,
      },
      bingoUniverse: {
        type: Object,
        default: null,
      },
      universeHidden: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      ...mapState('user', ['user']),
    },
  }
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

    .with-gap {
      gap: 0.75em;
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

<template>
  <v-card class="game-card" :class="{'green darken-1': game.isCurrent}" :to="{name: 'league-game-gameId', params: {gameId: game.id}}">
    <div class="gradient-overlay"></div>

    <div v-if="false" class="card-tag px-2 blue darken-1">
      Upcoming
    </div>

    <div class="card-content pa-4">
      <div class="game-number">{{ game.gameNumber }}</div>

      <div class="spacer"></div>

      <div class="d-flex justify-end">
        <div>
          <v-icon small>mdi-flag-checkered</v-icon>
          {{ game.submissionCount }}
        </div>
      </div>
    </div>
  </v-card>
</template>

<script>
  import { formatsDates } from '~/assets/lib/formatsDates'

  export default {
    name: 'LeagueGameCard',
    mixins: [formatsDates],
    props: {
      game: {
        type: Object,
        required: true,
      },
    },
    data: () => ({
    }),
  }
</script>

<style scoped lang="scss">
  .game-card {
    position: relative;
    overflow: hidden;
    transition: transform 300ms;
    border: 1px solid rgba(255, 255, 255, 0.4);

    &:hover {
      transform: scale(1.02);
    }

    .gradient-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to right, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%);
    }

    .card-content {
      position: relative;
      display: flex;
      align-items: center;
      height: 100%;

      .game-number {
        font-size: 2em;
        font-weight: 900;
      }

      .spacer {
        flex-grow: 1;
      }
    }

    .card-tag {
      position: absolute;
      top: 0;
      right: 0;
      border-bottom-left-radius: 0.4em;
    }
  }
</style>

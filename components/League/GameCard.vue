<template>
  <v-card
    class="game-card"
    :class="{ accent: game.isCurrent && game.userMetadata?.canSubmit }"
    :to="{ name: 'league-game-gameId', params: { gameId: game.id } }"
  >
    <div class="gradient-overlay"></div>

    <div class="card-content pa-4">
      <img class="background-image" src="~/assets/images/ori_running.png" />
      <div class="game-number-container">
        <div>Game</div>
        <div>
          <span class="hashtag">#</span><span class="game-number">{{ game.gameNumber }}</span
          ><template v-if="gameCount"
            ><span class="game-count"> / {{ gameCount }}</span>
          </template>
        </div>
      </div>

      <div class="spacer"></div>

      <div class="d-flex flex-column align-end">
        <div>
          {{ game.submissionCount }}
          <template v-if="memberCount">/ {{ memberCount }}</template>
          <v-icon small>mdi-flag-checkered</v-icon>
        </div>
        <div v-if="game.userMetadata?.ownSubmission">
          played
          <v-icon small>mdi-check</v-icon>
        </div>
      </div>
    </div>

    <div v-if="playableUntil !== null && !game.userMetadata?.ownSubbmission" class="timer pa-2">
      <template v-if="typeof countdownTimerTextOrSecondsLeft === 'number'">
        <span class="font-weight-bold">{{ formatTime(countdownTimerTextOrSecondsLeft, 0, true) }}</span><br />
        left to finish this game!
      </template>
      <template v-else-if="typeof countdownTimerTextOrSecondsLeft === 'string'">
        {{ countdownTimerTextOrSecondsLeft }}
      </template>
      <template v-else> Finish this game until {{ formatDateEpoch(playableUntil, 'P p') }} </template>
    </div>
  </v-card>
</template>

<script>
  import { formatsDates } from '~/assets/lib/formatsDates'
  import { formatTime } from '~/assets/lib/formatTime'

  export default {
    name: 'LeagueGameCard',
    mixins: [formatsDates],
    props: {
      game: {
        type: Object,
        required: true,
      },
      gameCount: {
        type: Number,
        default: null,
      },
      playableUntil: {
        type: Number,
        default: null,
      },
      memberCount: {
        type: Number,
        default: null,
      },
    },
    data: () => ({
      countdownTimerTextOrSecondsLeft: null,
      updateIntervalId: null,
    }),
    mounted() {
      this.updateIntervalId = setInterval(() => this.updateTimerText(), 1000)
      this.updateTimerText()
    },
    beforeDestroy() {
      if (this.updateIntervalId !== null) {
        clearInterval(this.updateIntervalId)
      }
    },
    methods: {
      formatTime,
      updateTimerText() {
        if (!this.playableUntil) {
          this.countdownTimerTextOrSecondsLeft = null
          return
        }

        const secondsLeft = (this.playableUntil - Date.now()) / 1000

        // Only show countdown for <48h
        if (secondsLeft > 48 * 3600) {
          this.countdownTimerTextOrSecondsLeft = null
          return
        }

        if (secondsLeft <= 0) {
          this.countdownTimerTextOrSecondsLeft = 'Next game is coming any second...'
          return
        }

        this.countdownTimerTextOrSecondsLeft = secondsLeft
      },
    },
  }
</script>

<style scoped lang="scss">
  .game-card {
    position: relative;
    overflow: hidden;
    transition: transform 300ms;
    border: 1px solid rgba(255, 255, 255, 0.4);
    will-change: transform;

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

      .game-number-container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        line-height: 1;

        .hashtag {
          font-size: 1.5em;
          opacity: 0.75;
        }

        .game-number {
          font-size: 2.5em;
          font-weight: 900;
        }

        .game-count {
          font-size: 1.8em;
          font-weight: 500;
          opacity: 0.5;
        }
      }

      .spacer {
        flex-grow: 1;
      }

      .background-image {
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        object-fit: cover;
        width: 100%;
        height: 100%;
        opacity: 0.75;
        transform: scale(1.8);
      }
    }

    .card-tag {
      position: absolute;
      top: 0;
      right: 0;
      border-bottom-left-radius: 0.4em;
    }

    .timer {
      text-align: center;
      position: relative;
      background-color: rgba(0, 0, 0, 0.1);
      line-height: 1.2;
    }
  }
</style>

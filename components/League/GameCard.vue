<template>
  <div class="card-container">
    <div v-if="isPending" class="card-flash accent"></div>

    <v-card
      class="game-card"
      :class="{ accent: isPending }"
      :to="{ name: 'league-game-gameId', params: { gameId: game.id } }"
    >
      <div class="gradient-overlay" :class="{extreme: !!season?.backgroundImageUrl}"></div>

      <div class="card-content pa-4">
        <img v-if="!!season?.backgroundImageUrl" class="background-image behind" alt="" :src="season.backgroundImageUrl" />
        <img v-else class="background-image" alt="" src="~/assets/images/ori_running.png" />

        <div class="game-number-container">
          <div>{{ season !== null ? season.name : 'Game' }}</div>
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
            <v-icon :color="game.userMetadata?.ownSubmission ? 'green' : ''" small>mdi-flag-checkered</v-icon>
          </div>
          <div v-if="game.userMetadata?.ownSubmission">
            {{ formatTime(game.userMetadata.ownSubmission.rankingData.time) }}
            <v-icon small>mdi-timer-outline</v-icon>
          </div>
        </div>
      </div>

      <div v-if="playableUntil !== null && !game.userMetadata?.ownSubmission" class="timer pa-2">
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
  </div>
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
      season: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      countdownTimerTextOrSecondsLeft: null,
      updateIntervalId: null,
    }),
    computed: {
      isPending() {
        return this.game.isCurrent && this.game.userMetadata?.canSubmit
      }
    },
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
          this.countdownTimerTextOrSecondsLeft = 'Season will continue any second...'
          return
        }

        this.countdownTimerTextOrSecondsLeft = secondsLeft
      },
    },
  }
</script>

<style scoped lang="scss">
  .card-container {
    will-change: transform;
    transition: transform 300ms;

    &:hover {
      transform: scale(1.02);
    }

    position: relative;

    @keyframes flash {
      0% {
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        opacity: 0.8;
      }

      30% {
        opacity: 0.6;
      }

      100% {
        top: -8px;
        left: -8px;
        right: -8px;
        bottom: -8px;
        opacity: 0;
      }
    }

    .card-flash {
      position: absolute;
      opacity: 0.6;
      border-radius: 0.4em;
      animation: flash 1s forwards infinite;
      z-index: -2;
    }
  }

  .game-card {
    position: relative;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.4);
    z-index: 1;

    .gradient-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to right, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%);

      &.extreme {
        background: linear-gradient(to right, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0) 100%);
      }
    }

    .card-content {
      position: relative;
      display: flex;
      align-items: center;

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
        opacity: 1;
        transform: scale(1.8);

        &.behind {
          z-index: -1;
        }
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
      background-color: rgba(0, 0, 0, 0.4);
      line-height: 1.2;
    }
  }
</style>

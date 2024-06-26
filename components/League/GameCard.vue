<template>
  <div class="card-container">
    <div v-if="isPending" class="accent" :class="{ 'card-flash': attentionActive }"></div>

    <v-card
      class="game-card"
      :class="{ accent: isPending }"
      :to="{ name: 'league-game-gameId', params: { gameId: game.id } }"
    >
      <div class="gradient-overlay" :class="{ extreme: !!season?.backgroundImageUrl }"></div>
      <v-img
        v-if="!!season?.backgroundImageUrl"
        class="background-image behind"
        alt=""
        :src="season.backgroundImageUrl"
      />

      <div class="card-content pa-4">
        <img v-if="!season?.backgroundImageUrl" class="background-image ori-running" alt="" src="~/assets/images/ori_running.png" />

        <div class="game-number-container">
          <div>{{ season !== null ? season.name : 'Game' }}</div>
          <div>
            <span class="hashtag">#</span><span class="game-number">{{ game.gameNumber }}</span>
            <template v-if="gameCount">
              <span class="game-count"> / {{ gameCount }}</span>
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

      <div v-if="playableUntil !== null" class="timer d-flex flex-column pa-2">
        <template v-if="typeof countdownTimerTextOrSecondsLeft === 'number'">
          {{ isPending ? 'Time left to finish this game' : (isLast ? 'Season over in' : 'Next game in') }}<br />
          <span class="font-weight-bold">{{ formatTime(countdownTimerTextOrSecondsLeft, 0, true) }}</span>
        </template>
        <template v-else-if="typeof countdownTimerTextOrSecondsLeft === 'string'">
          {{ countdownTimerTextOrSecondsLeft }}
        </template>
        <template v-else>
          {{ isPending ? 'Finish this game until' : (isLast ? 'Season over at' : 'Next game at') }}<br />
          <span class="font-weight-bold">{{ formatDateEpoch(playableUntil, 'P p') }}</span>
        </template>
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
      attentionActive: false,
    }),
    computed: {
      isPending() {
        return this.game.isCurrent && this.game.userMetadata?.canSubmit
      },
      isLast() {
        return this.game.gameNumber === this.gameCount
      },
    },
    mounted() {
      this.updateIntervalId = setInterval(() => this.updateTimer(), 1000)
      this.updateTimer()
    },
    beforeDestroy() {
      if (this.updateIntervalId !== null) {
        clearInterval(this.updateIntervalId)
      }
    },
    methods: {
      formatTime,
      updateTimer() {
        if (!this.playableUntil) {
          this.countdownTimerTextOrSecondsLeft = null
          this.attentionActive = false
          return
        }

        const secondsLeft = (this.playableUntil - Date.now()) / 1000

        // Only show countdown for <48h
        if (secondsLeft > 48 * 3600) {
          this.countdownTimerTextOrSecondsLeft = null
          this.attentionActive = false
          return
        }

        this.attentionActive = true

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
      @media (prefers-reduced-motion) {
        animation: none
      }
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
    .background-image {
      display: block;
      position: absolute;
      margin: auto;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      object-fit: cover;
      width: 100%;
      height: 100%;
      opacity: 1;
      &:not(.behind) {
        transform: scale(1.8);
      }
      &.behind {
        z-index: -1;
      }
      &.ori-running{
        width:13em;
        height: 13em;
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
      min-height: 3.5em;
      justify-content: center;
    }
  }
</style>

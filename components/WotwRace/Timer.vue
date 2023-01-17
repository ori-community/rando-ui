<template>
  <span class="timer"
    >{{ mainTimerText }}<span class="fraction">{{ fractionTimerText }}</span></span
  >
</template>

<script>
  import { formatTime } from '~/assets/lib/formatTime'

  export default {
    name: 'LobbyView',
    props: {
      startingAt: {
        type: Number,
        required: true,
      },
      finishedTime: {
        type: Number,
        default: null,
      },
    },
    data: () => ({
      mainTimerText: '0',
      fractionTimerText: '.0',
      updateIntervalId: null,
    }),
    mounted() {
      this.updateIntervalId = setInterval(() => this.updateTimerText(), 100)
      this.updateTimerText()
    },
    beforeDestroy() {
      if (this.updateIntervalId !== null) {
        clearInterval(this.updateIntervalId)
      }
    },
    methods: {
      updateTimerText() {
        const parts = formatTime(this.finishedTime ? this.finishedTime : (Date.now() - this.startingAt) / 1000).split(
          '.',
          2,
        )
        this.mainTimerText = parts[0]
        this.fractionTimerText = '.' + parts[1]
      },
    },
  }
</script>

<style lang="scss" scoped>
  .timer {
    font-size: 3em;
    font-weight: 700;

    .fraction {
      font-size: 0.75em;
      font-weight: 100;
    }
  }
</style>

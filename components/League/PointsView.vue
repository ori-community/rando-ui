<template>
  <v-tooltip bottom open-delay="200" :disabled="!isDiscarded">
    <template #activator="{ on }">
      <span
        class="no-wrap"
        :class="{
          'grey--text': isDiscarded && !isDiscardedFully,
          'red--text text-decoration-line-through': isDiscardedFully,
        }"
        v-on="on"
      >
        <span>
          {{ rankingData?.points }}
        </span>
        <span v-if="isDiscarded && !isDiscardedFully" class="percentage">
          ({{ discardPercentage }})
        </span>
      </span>
    </template>
    <div v-if="discardWorstGamesCount > 1" class="text-center max-width-300">
      {{ discardWorstGamesCount }} worst races get discarded over time.
      <template v-if="rankingMultiplier > 0.0">
        {{ discardPercentage }} of points from this game currently
        count towards the leaderboard ranking.
        <template v-if="rankingMultiplier > 1.0">
          This game offsets other games that deviated
          from your average.
        </template>
      </template>
      <template v-else>
        This game does not count towards the leaderboard.
      </template>
    </div>
    <span v-else>Worst game gets discarded over time</span>
  </v-tooltip>
</template>

<script>
  export default {
    props: {
      rankingData: {
        type: Object,
        default: () => null,
      },
      discardWorstGamesCount: {
        type: Number,
        default: 0,
      },
    },
    computed: {
      rankingMultiplier() {
        return this.rankingData?.rankingMultiplier ?? 1.0
      },
      isDiscarded() {
        return this.rankingMultiplier !== 1.0
      },
      isDiscardedFully() {
        return this.rankingMultiplier === 0.0
      },
      discardPercentage() {
        return `${Math.round(this.rankingMultiplier * 100)}%`
      },
    },
  }
</script>

<style scoped lang="scss">
  .no-wrap {
    white-space: nowrap;
  }

  .max-width-300 {
    max-width: 300px;
  }

  .percentage {
    font-size: 0.75em;
  }
</style>

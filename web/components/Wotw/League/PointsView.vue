<template>
  <span
    class="no-wrap"
    :class="{
      'text-grey': isDiscarded && !isDiscardedFully,
      'text-red text-decoration-line-through': isDiscardedFully,
    }"
  >
    <span>
      {{ rankingData?.points }}
    </span>
    <span v-if="isDiscarded && !isDiscardedFully" class="percentage">
      ({{ discardPercentage }})
    </span>
    <v-tooltip location="bottom" open-delay="200" :disabled="!isDiscarded" activator="parent">
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
  </span>
</template>

<script lang="ts" setup>
  import type {LeagueGameSubmissionRankingDataInfo} from "@shared/types/league";

  const props = defineProps({
    rankingData: {
      type: Object as PropType<LeagueGameSubmissionRankingDataInfo | null>,
      default: () => null,
    },
    discardWorstGamesCount: {
      type: Number,
      default: 0,
    },
  })
  const rankingMultiplier = computed(() => {
    return props.rankingData?.rankingMultiplier ?? 1.0
  })
  const isDiscarded = computed(() => {
    return rankingMultiplier.value !== 1.0
  })
  const isDiscardedFully = computed(() => {
    return rankingMultiplier.value === 0.0
  })
  const discardPercentage = computed(() => {
    return `${Math.round(rankingMultiplier.value * 100)}%`
  })

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

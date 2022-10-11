<template>
  <v-row>
    <v-col cols="12">
      <span>
        Board size: <strong>{{ model.size }} × {{ model.size }} lines = {{ totalCardCount }} cards</strong>
      </span>
      <v-slider v-model="model.size" prepend-icon="mdi-resize" min="1" max="7" hide-details />
    </v-col>
    <v-col cols="12">
      <span>
        Initially visible cards:
        <strong>{{ discoveryCount === totalCardCount ? 'All' : discoveryCount }}</strong>
      </span>
      <v-slider
        v-model="discoveryCount"
        :disabled="model.size < 2"
        prepend-icon="mdi-table-headers-eye"
        :min="1"
        :max="totalCardCount"
        hide-details
      />
    </v-col>
    <v-col cols="12">
      <v-checkbox
        v-model="model.lockout"
        label="Lockout mode"
        messages="Each card can only be completed by one player/universe"
      />
    </v-col>
    <v-col cols="12">
      <h3 class="mb-2">Bingo Goal</h3>
      <div class="goals-grid mb-5">
        <v-card
          :color="selectedGoalType === 'cards' ? 'secondary' : 'background lighten-2'"
          class="goal-card pa-3"
          :class="{ active: selectedGoalType === 'cards' }"
          :ripple="selectedGoalType !== 'cards'"
          elevation="0"
          @click="selectedGoalType = 'cards'"
        >
          <v-text-field
            v-model="cardsCount"
            type="number"
            class="goal-amount-input mb-1"
            min="1"
            :max="totalCardCount"
            dense
            hide-details
            @blur="clampGoalCounts()"
          />
          <div class="goal-name">Card<template v-if="cardsCount !== 1">s</template></div>
          <div class="goal-name-inactive">Cards</div>
        </v-card>
        <v-card
          :color="selectedGoalType === 'lines' ? 'secondary' : 'background lighten-2'"
          class="goal-card pa-3"
          :class="{ active: selectedGoalType === 'lines' }"
          :ripple="selectedGoalType !== 'lines'"
          elevation="0"
          @click="selectedGoalType = 'lines'"
        >
          <v-text-field
            v-model="linesCount"
            type="number"
            class="goal-amount-input mb-1"
            min="1"
            :max="totalLineCount"
            dense
            hide-details
            @blur="clampGoalCounts()"
          />
          <div class="goal-name">Line<template v-if="linesCount !== 1">s</template></div>
          <div class="goal-name-inactive">Lines</div>
        </v-card>
        <v-card
          :color="selectedGoalType === 'all' ? 'secondary' : 'background lighten-2'"
          class="goal-card pa-3"
          :class="{ active: selectedGoalType === 'all' }"
          :ripple="selectedGoalType !== 'all'"
          elevation="0"
          @click="selectedGoalType = 'all'"
        >
          <div class="goal-name">All</div>
          <div class="goal-name-inactive">All</div>
        </v-card>
      </div>
    </v-col>
  </v-row>
</template>

<script lang="ts">
  import { hasModelObject } from '~/assets/lib/hasModelObject'

  export class BingoSettings {
    discovery: null | number = null
    lockout: boolean = false
    size: number = 5
    goalType: 'cards' | 'lines' | 'all' = 'lines'
    goalAmount: number = 3
  }

  export default {
    name: 'BingoSettings',
    mixins: [hasModelObject],
    data: () => ({
      discoveryCount: 25,
      selectedGoalType: 'lines',
      cardsCount: 10,
      linesCount: 3,
    }),
    computed: {
      totalCardCount() {
        return this.model.size * this.model.size
      },
      totalLineCount() {
        if (this.model.size === 1) {
          return 1
        }

        if (this.model.size === 2) {
          return 4
        }

        return this.model.size * 2 + 2
      },
    },
    watch: {
      model: {
        deep: true,
        immediate: true,
        handler(model) {
          if (model.discovery === null) {
            this.discoveryCount = model.size * model.size
          } else {
            this.discoveryCount = model.discovery
          }

          if (model.goalType === 'cards' && this.clampCardCount(this.cardsCount) !== model.goalAmount) {
            this.cardsCount = model.goalAmount
          } else if (model.goalType === 'lines' && this.clampLineCount(this.linesCount) !== model.goalAmount) {
            this.linesCount = model.goalAmount
          }

          this.selectedGoalType = model.goalType
        },
      },
      totalCardCount(totalCardCount, oldTotalCardCount) {
        if (this.discoveryCount === oldTotalCardCount) {
          this.discoveryCount = totalCardCount
        }

        this.clampGoalCounts()
      },
      discoveryCount(discoveryCount) {
        if (discoveryCount === this.totalCardCount) {
          this.model.discovery = null
          return
        }

        this.model.discovery = discoveryCount
      },
      cardsCount(cardsCount) {
        if (this.model.goalType === 'cards') {
          this.model.goalAmount = this.clampCardCount(cardsCount)
        }

        this.cardsCount = Number(this.cardsCount)
      },
      linesCount(linesCount) {
        if (this.model.goalType === 'lines') {
          this.model.goalAmount = this.clampLineCount(linesCount)
        }

        this.linesCount = Number(this.linesCount)
      },
      selectedGoalType(selectedGoalType) {
        switch (selectedGoalType) {
          case 'cards':
            this.model.goalAmount = Number(this.cardsCount)
            break
          case 'lines':
            this.model.goalAmount = Number(this.linesCount)
            break
        }

        this.model.goalType = selectedGoalType
      },
    },
    methods: {
      clampCardCount(cardCount) {
        return Math.min(this.totalCardCount, Math.max(1, Math.round(Number(cardCount))))
      },
      clampLineCount(lineCount) {
        return Math.min(this.totalLineCount, Math.max(1, Math.round(Number(lineCount))))
      },
      clampGoalCounts() {
        this.cardsCount = this.clampCardCount(this.cardsCount)
        this.linesCount = this.clampLineCount(this.linesCount)
      },
    },
  }
</script>

<style lang="scss" scoped>
  .goals-grid {
    display: grid;
    grid-gap: 1.5em;
    grid-template-columns: 1fr 1fr 1fr;

    .goal-card {
      flex-direction: column;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;

      .goal-name,
      .goal-name-inactive {
        font-size: 1.25em;
      }

      .goal-name-inactive {
        display: flex;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        align-items: center;
        justify-content: center;
      }

      &.active {
        .goal-name-inactive {
          display: none;
        }
      }

      &:not(.active) {
        .goal-amount-input {
          pointer-events: none;
          opacity: 0;
        }

        .goal-name {
          opacity: 0;
          user-select: none;
        }
      }
    }

    :deep(.goal-card) {
      .v-input {
        flex-grow: 0;
      }

      .v-input,
      input[type='number'] {
        font-size: 1.2em;
        text-align: center !important;
        -moz-appearance: textfield;
      }

      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }
  }
</style>

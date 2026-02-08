<template>
  <v-row>
    <v-col cols="12" md="6">
      <v-row>
        <v-col cols="12">
          Board size: <strong>{{ model.size }} × {{ model.size }} = {{ totalCardCount }} cards</strong>
          <v-slider v-model="model.size" prepend-icon="mdi-resize" step="1" min="1" max="7" hide-details />
        </v-col>
        <v-col cols="12">
          Initially visible cards:
          <strong>{{ model.discovery === null ? "All" : model.discovery }}</strong>
          <v-slider
            v-model="discoveryCount"
            :disabled="model.size < 2"
            prepend-icon="mdi-table-headers-eye"
            step="1"
            min="0"
            :max="totalCardCount"
            hide-details
          />
        </v-col>
        <v-col cols="12">
          Reveal first <strong>{{ model.revealFirstNCompletedGoals }}</strong> completed goals
          <v-slider
            v-model="model.revealFirstNCompletedGoals"
            step="1"
            :disabled="totalCardCount - discoveryCount <= 0"
            prepend-icon="mdi-table-headers-eye"
            :min="0"
            :max="totalCardCount - discoveryCount"
            hide-details
          />
        </v-col>
      </v-row>
    </v-col>
    <v-col cols="12" md="6">
      <v-row>
        <v-col cols="12">
          <h3 class="mb-2">Bingo Goal</h3>
          <div class="goals-grid">
            <v-card
              :color="model.goalType === 'cards' ? 'secondary' : 'surface-light'"
              class="goal-card pa-3"
              :class="{ active: model.goalType === 'cards' }"
              :ripple="model.goalType !== 'cards'"
              elevation="0"
              @click="selectGoalType('cards')"
            >
              <v-text-field
                ref="goalCardsCountInput"
                v-model="goalCardsCount"
                type="number"
                class="goal-amount-input mb-1"
                min="1"
                :max="totalCardCount"
                density="compact"
                variant="underlined"
                hide-details
                @blur="clampGoalCounts()"
              />
              <div class="goal-name">
                <span>Card<template v-if="goalCardsCount !== 1">s</template></span>
              </div>
              <div class="goal-name-inactive">Cards</div>
            </v-card>
            <v-card
              :color="model.goalType === 'lines' ? 'secondary' : 'surface-light'"
              class="goal-card pa-3"
              :class="{ active: model.goalType === 'lines' }"
              :ripple="model.goalType !== 'lines'"
              elevation="0"
              @click="selectGoalType('lines')"
            >
              <v-text-field
                ref="goalLinesCountInput"
                v-model="goalLinesCount"
                type="number"
                class="goal-amount-input mb-1"
                min="1"
                :max="totalLineCount"
                density="compact"
                variant="underlined"
                hide-details
                @blur="clampGoalCounts()"
              />
              <div class="goal-name">
                <span>Line<template v-if="goalLinesCount !== 1">s</template></span>
              </div>
              <div class="goal-name-inactive">Lines</div>
            </v-card>
            <v-card
              :color="model.goalType === 'all' ? 'secondary' : 'surface-light'"
              class="goal-card pa-3"
              :class="{ active: model.goalType === 'all' }"
              :ripple="model.goalType !== 'all'"
              elevation="0"
              @click="selectGoalType('all')"
            >
              <div class="goal-name">All</div>
              <div class="goal-name-inactive">All</div>
            </v-card>
          </div>
        </v-col>
        <v-col cols="12">
          <v-checkbox
            v-model="model.lockout"
            hide-details
            class="mb-2"
          >
            <template #label>
              <div>
                Lockout mode
                <div class="text-caption text-grey-lighten-1">Each card can only be completed by one player/universe
                </div>
              </div>
            </template>
          </v-checkbox>
        </v-col>
      </v-row>
    </v-col>
    <v-expand-transition>
      <v-col v-if="discoveryCount === 0 && model.revealFirstNCompletedGoals === 0" cols="12" class="py-0">
        <v-alert type="warning" variant="tonal" class="my-3">
          You are about to create a bingo game that will not reveal any cards ever.
        </v-alert>
      </v-col>
    </v-expand-transition>
  </v-row>
</template>

<script lang="ts" setup>
  import type {BingoSettings} from "@shared/types/http-api"
  import {useVModel} from "@vueuse/core"
  import type {VTextField} from "vuetify/components"

  const props = defineProps<{
    modelValue: BingoSettings,
  }>()

  const emits = defineEmits<{
    "update:modelValue": [BingoSettings],
  }>()

  const model = useVModel(props, "modelValue", emits)
  const goalCardsCount = ref(10)
  const goalLinesCount = ref(3)
  const goalCardsCountInput = ref<VTextField | null>(null)
  const goalLinesCountInput = ref<VTextField | null>(null)

  const totalCardCount = computed(() => model.value.size * model.value.size)
  const totalLineCount = computed(() => model.value.size * 2 + 2)

  function syncGoalCountToModel() {
    switch (model.value.goalType) {
      case "cards":
        model.value.goalAmount = goalCardsCount.value
        break
      case "lines":
        model.value.goalAmount = goalLinesCount.value
        break
      case "all":
        break
    }
  }

  function clampGoalCounts() {
    goalCardsCount.value = Math.min(totalCardCount.value, goalCardsCount.value)
    goalLinesCount.value = Math.min(totalLineCount.value, goalLinesCount.value)
  }

  watch(goalCardsCount, syncGoalCountToModel)
  watch(goalLinesCount, syncGoalCountToModel)
  watch(totalCardCount, clampGoalCounts)
  watch(totalLineCount, clampGoalCounts)
  watch(() => model.value.goalType, clampGoalCounts)

  function focusGoalAmountInput() {
    switch (model.value.goalType) {
      case "cards":
        goalCardsCountInput.value?.focus()
        break
      case "lines":
        goalLinesCountInput.value?.focus()
        break
    }
  }

  function selectGoalType(type: BingoSettings["goalType"]) {
    model.value.goalType = type
    focusGoalAmountInput()
  }

  const discoveryCount = computed({
    set(value: number) {
      if (value === totalCardCount.value) {
        model.value.discovery = null
      } else {
        model.value.discovery = value
      }
    },
    get() {
      return model.value.discovery === null
        ? totalCardCount.value
        : model.value.discovery
    },
  })
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

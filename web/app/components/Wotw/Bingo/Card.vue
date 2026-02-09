<template>
  <div class="bingo-card" @click="emit('click')">
    <div
      class="bingo-card-inner"
      :class="{
        flipped: cardShouldBeFlipped,
        marked,
        'top-marked': markedNeighborMask & 0b1000,
        'left-marked': markedNeighborMask & 0b0100,
        'right-marked': markedNeighborMask & 0b0010,
        'bottom-marked': markedNeighborMask & 0b0001,
      }"
    >
      <v-card elevation="0" class="front pa-2" :style="cardStyle" color="background-lighten-1">
        <div ref="autoTextSizeContainerElement" class="position-relative fill d-flex flex-column">
          <template v-if="!!square">
            <template v-if="hasGoals">
              <div class="pb-2 position-relative">
                <div ref="backdropElement" class="mt-n2 mx-n2 bg-background-lighten-3 backdrop"></div>
                {{ square.text }}
              </div>
              <div class="pt-2 d-flex flex-grow-1 flex-column justify-center gap-4">
                <div v-for="goal in square.goals" :key="goal.text" class="goal" :class="{ completed: goal.completed }">
                  {{ goal.text }}
                </div>
              </div>
            </template>
            <template v-else>
              <div class="flex-grow-1 d-flex align-center">{{ square.text }}</div>
            </template>
          </template>
        </div>
        <div class="attention-effect" :class="{ active: attentionEffect }"/>
      </v-card>
      <v-card elevation="0" class="back" color="background-lighten-1">
        <img alt="" src="@shared/images/ori_think.png" class="ori-think">
      </v-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import type {BingoSquare} from "@shared/types/http-api";

  const props = withDefaults(defineProps<{
    attentionEffect?: boolean,
    forceFlip?: boolean,
    hiddenUniverseIds?: number[],
    highlightedUniverseId?: number | null,
    isLockout?: boolean,
    marked?: boolean,
    markedNeighborMask?: number,
    ownUniverseId?: number | null,
    square: BingoSquare | null,
    universeColors: Array<string>,
  }>(), {
    attentionEffect: false,
    forceFlip: false,
    hiddenUniverseIds: () => [],
    highlightedUniverseId: null,
    isLockout: false,
    marked: false,
    markedNeighborMask: 0b000, // top, left, right, bottom
    ownUniverseId: null,
  })

  const emit = defineEmits(["click"])
  const autoTextSizeContainerElement = ref<HTMLElement | null>(null)
  const backdropElement = ref<HTMLElement | null>(null)
  const textFitObserver = new ResizeObserver(() => {
    updateFontSize()
  })

  onBeforeUnmount(() => {
    if (autoTextSizeContainerElement.value === null) {
      return
    }

    textFitObserver.unobserve(autoTextSizeContainerElement.value)
  })

  async function updateFontSize() {
    if (autoTextSizeContainerElement.value === null) {
      return
    }

    // Hide the backdrop element because it extends outside its boundaries
    // and would invalidate the size measurements below.
    if (backdropElement.value !== null) {
      backdropElement.value.style.display = "none"
    }

    for (let emScale = 1.5; emScale >= 0.2; emScale -= 0.1) {
      autoTextSizeContainerElement.value.style.fontSize = `${emScale}em`

      if (
        autoTextSizeContainerElement.value.scrollHeight <= autoTextSizeContainerElement.value.clientHeight &&
        autoTextSizeContainerElement.value.scrollWidth <= autoTextSizeContainerElement.value.clientWidth
      ) {
        break
      }
    }

    if (backdropElement.value !== null) {
      backdropElement.value.style.display = ""
    }
  }

  watch(autoTextSizeContainerElement, (value) => {
    if (value === null) {
      return
    }

    textFitObserver.observe(value)
  }, {immediate: true})

  const cardShouldBeFlipped = computed(() => {
    return props.forceFlip || !props.square
  })

  watch(() => props.square, () => {
    nextTick(() => {
      updateFontSize()
    })
  }, {deep: true, immediate: true})

  const hasGoals = computed(() => {
    if (!props.square) return false
    return props.square.goals.length !== 0
  })

  const cardStyle = computed(() => {
    if (props.square === null || props.square.completedBy.length === 0) {
      return {}
    }

    const highlightSplitPercentage = props.isLockout
      ? 20
      : 33

    let nonHighlightedColors: (string | undefined)[] = []

    if (props.isLockout) {
      if (props.square.completedBy.length >= 2) {
        nonHighlightedColors = props.square.completedBy.slice(1)
          .map((universeId) => props.universeColors[universeId])
      }
    } else {
      nonHighlightedColors = props.square.completedBy
        .filter((universeId) => (!props.hiddenUniverseIds.includes(universeId) && universeId !== props.highlightedUniverseId))
        .sort((a, b) => b - a)
        .map((universeId) => props.universeColors[universeId])
    }

    const stops = []

    const shouldHighlight = (!!props.highlightedUniverseId && !props.hiddenUniverseIds.includes(props.highlightedUniverseId)) ||
      (props.isLockout && props.square.completedBy.length >= 2)

    for (let i = 0; i < nonHighlightedColors.length; i++) {
      const stopStart = (i / nonHighlightedColors.length) * (shouldHighlight ? highlightSplitPercentage : 100)
      const stopEnd = ((i + 1) / nonHighlightedColors.length) * (shouldHighlight ? highlightSplitPercentage : 100)
      stops.push(`${nonHighlightedColors[i]} ${stopStart}% ${stopEnd}%`)
    }

    if (stops.length === 0) {
      stops.push(`transparent 0% ${highlightSplitPercentage}%`)
    }

    if (props.isLockout) {
      if (props.square.completedBy.length >= 1 && props.square.completedBy[0]) {
        stops.push(`${props.universeColors[props.square.completedBy[0]]} ${highlightSplitPercentage}% 100%`)
      } else {
        stops.push(`transparent ${highlightSplitPercentage}% 100%`)
      }
    } else if (props.highlightedUniverseId) {
      if (shouldHighlight && props.square.completedBy.includes(props.highlightedUniverseId)) {
        stops.push(`${props.universeColors[props.highlightedUniverseId]} ${highlightSplitPercentage}% 100%`)
      } else {
        stops.push(`transparent ${highlightSplitPercentage}% 100%`)
      }
    }

    if (stops.length === 0) {
      return {}
    }

    return {
      background: `linear-gradient(to bottom left, ${stops.join(', ')})`,
    }
  })
</script>

<style lang="scss" scoped>
  .bingo-card {
    perspective: 500px;
    position: relative;
    user-select: none;

    .bingo-card-inner {
      line-height: 1.1;
      text-align: center;
      transition: transform 500ms, background-color 200ms, border-radius 200ms;
      position: relative;
      transform-style: preserve-3d;
      border-radius: 8px;
      top: -0.4em;
      left: -0.4em;
      right: -0.4em;
      bottom: -0.4em;
      height: calc(100% + 0.8em);
      width: calc(100% + 0.8em);
      z-index: 0;

      &.marked {
        background-color: #dedeff;

        &.top-marked {
          border-top-left-radius: 0;
          border-top-right-radius: 0;
        }

        &.left-marked {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }

        &.right-marked {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }

        &.bottom-marked {
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        }
      }

      &.flipped {
        transform: rotateX(180deg) translateZ(5em);
      }

      .back {
        transform: rotateX(180deg);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        opacity: 0.5;

        .ori-think {
          width: 75%;
          opacity: 0.1;
        }
      }

      .front,
      .back {
        position: absolute;
        top: 0.4em;
        left: 0.4em;
        right: 0.4em;
        bottom: 0.4em;
        backface-visibility: hidden;
        overflow: hidden;
        z-index: 10;
      }

      .front {
        .fill {
          height: 100%;
          width: 100%;
          word-break: normal !important;
        }

        .backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: -1;
        }

        .attention-effect {
          @keyframes attention-effect {
            0% {
              opacity: 0.5;
            }
            100% {
              opacity: 0;
            }
          }

          z-index: 1000;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: white;
          opacity: 0;
          pointer-events: none;

          &.active {
            animation: attention-effect 500ms ease-out;
          }
        }
      }
    }
  }
</style>

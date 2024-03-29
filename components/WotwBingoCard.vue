<template>
  <div class="bingo-card" @click="$emit('click')">
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
      <v-card elevation="0" class="front" :style="cardStyle" color="background lighten-1">
        <div class="content d-flex flex-column">
          <template v-if="!!square">
            <div class="square-text pa-2" :class="{ expand: !hasGoals }">{{ square.text }}</div>
            <template v-if="hasGoals">
              <v-spacer />
              <div class="px-2 pt-1 pb-2 square-goals" :class="{ 'bigger-text': goalsShouldBeLarge }">
                <div v-for="goal in square.goals" :key="goal.text" class="goal" :class="{ completed: goal.completed }">
                  {{ goal.text }}
                </div>
              </div>
              <v-spacer />
            </template>
          </template>
        </div>
        <div class="attention-effect" :class="{ active: attentionEffectActive }"></div>
      </v-card>
      <v-card elevation="0" class="back" color="background lighten-1">
        <img alt="" src="~/assets/images/ori_think.png" class="ori-think" />
      </v-card>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'WotwBingoCard',
    props: {
      isLockout: {
        type: Boolean,
        default: false,
      },
      square: {
        type: Object,
        default: () => null,
      },
      forceFlip: {
        type: Boolean,
        default: false,
      },
      universeColors: {
        type: Object,
        required: true,
      },
      hiddenUniverses: {
        type: Array,
        default: () => [],
      },
      highlightUniverse: {
        type: Number,
        default: null,
      },
      marked: {
        type: Boolean,
        default: false,
      },
      markedNeighborMask: {
        type: Number,
        default: 0b0000, // top, left, right, bottom
      },
      ownUniverseId: {
        type: Number,
        default: null,
      },
      attentionEffect: {
        type: Boolean,
        default: false,
      },
    },
    data: () => ({
      attentionEffectActive: false,
    }),
    computed: {
      cardShouldBeFlipped() {
        return this.forceFlip || !this.square
      },
      goalsShouldBeLarge() {
        return this.square.goals.length === 1 && this.square.goals[0].text.length <= 16
      },
      hasGoals() {
        return this.square.goals.length !== 0
      },
      cardStyle() {
        if (this.square === null || this.square.completedBy.length === 0) {
          return {}
        }

        const highlightSplitPercentage = this.isLockout
          ? 20
          : 33

        let nonHighlightedColors = []

        if (this.isLockout) {
          if (this.square.completedBy.length >= 2) {
            nonHighlightedColors = this.square.completedBy.slice(1)
              .map((universeId) => this.universeColors[universeId])
          }
        } else {
          nonHighlightedColors = this.square.completedBy
            .filter((universeId) => (!this.hiddenUniverses.includes(universeId) && universeId !== this.highlightUniverse))
            .sort((a, b) => b - a)
            .map((universeId) => this.universeColors[universeId])
        }

        const stops = []

        const shouldHighlight = (!!this.highlightUniverse && !this.hiddenUniverses.includes(this.highlightUniverse)) ||
          (this.isLockout && this.square.completedBy.length >= 2)

        for (let i = 0; i < nonHighlightedColors.length; i++) {
          const stopStart = (i / nonHighlightedColors.length) * (shouldHighlight ? highlightSplitPercentage : 100)
          const stopEnd = ((i + 1) / nonHighlightedColors.length) * (shouldHighlight ? highlightSplitPercentage : 100)
          stops.push(`${nonHighlightedColors[i]} ${stopStart}% ${stopEnd}%`)
        }

        if (stops.length === 0) {
          stops.push(`transparent 0% ${highlightSplitPercentage}%`)
        }

        if (this.isLockout) {
          if (this.square.completedBy.length >= 1) {
            stops.push(`${this.universeColors[this.square.completedBy[0]]} ${highlightSplitPercentage}% 100%`)
          } else {
            stops.push(`transparent ${highlightSplitPercentage}% 100%`)
          }
        } else if (this.highlightUniverse) {
          if (shouldHighlight && this.square.completedBy.includes(this.highlightUniverse)) {
            stops.push(`${this.universeColors[this.highlightUniverse]} ${highlightSplitPercentage}% 100%`)
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
      },
      stateHash() {
        return [this.square?.goals.map((g) => (g.completed ? '+' : '-')).join(), this.square?.goals.map((g) => g.text).join()].join()
      },
    },
    watch: {
      async stateHash() {
        // Don't show the attention effect for completed goals
        if (this.ownUniverseId !== null && this.square?.completedBy.includes(this.ownUniverseId)) {
          return
        }

        if (this.attentionEffectActive) {
          this.attentionEffectActive = false
          await this.$nextTick()
          await this.$nextTick()
        }

        if (this.attentionEffect) {
          this.attentionEffectActive = true
        }

        // TODO: Do this properly
        setTimeout(() => {
          this.attentionEffectActive = false
        }, 2000)
      },
    },
  }
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
        .content {
          height: 100%;
        }

        .square-text {
          border-radius: 0 !important;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: white;
            opacity: 0.15;
          }

          &.expand {
            flex-grow: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2em;

            &::before {
              display: none;
            }
          }
        }

        .square-goals {
          display: flex;
          flex-direction: column;
          font-size: 0.8em;
          gap: 0.3em;

          &.bigger-text {
            font-size: 1.2em;
          }

          .goal {
            &.completed {
              text-decoration: line-through;
              opacity: 0.5;
            }
          }
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

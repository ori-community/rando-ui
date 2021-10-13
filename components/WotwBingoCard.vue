<template>
  <div class='bingo-card'>
    <div class='bingo-card-inner' :class='{flipped: cardShouldBeFlipped}'>
      <v-card class='front' :style='cardStyle' color='background lighten-1'>
        <div class='content d-flex flex-column'>
          <template v-if='!!square'>
            <div class='square-text pa-2' :class='{expand: !hasGoals}'>{{ square.text }}</div>
            <template v-if='hasGoals'>
              <v-spacer />
              <div class='px-2 pt-1 pb-2 square-goals' :class='{"bigger-text": goalsShouldBeLarge}'>
                <div v-for='goal in square.goals' :key='goal.text' class='goal' :class='{completed: goal.completed}'>
                  {{ goal.text }}
                </div>
              </div>
              <v-spacer />
            </template>
          </template>
        </div>
        <div class='attention-effect' :class='{active: attentionEffectActive}'></div>
      </v-card>
      <v-card class='back' color='background lighten-1'>
        <img alt='' src='~/assets/images/ori_think.png' class='ori-think'>
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
        default: () => ([]),
      },
      highlightUniverse: {
        type: Number,
        default: null,
      }
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

        const highlightSplitPercentage = 33

        const nonHighlightedColors = this.square.completedBy
          .filter(universeId => !this.hiddenUniverses.includes(universeId) && universeId !== this.highlightUniverse)
          .sort((a, b) => b - a)
          .map(universeId => this.universeColors[universeId])
        const stops = []

        const shouldHighlight =
          !!this.highlightUniverse &&
          !this.hiddenUniverses.includes(this.highlightUniverse) &&
          !this.isLockout

        for (let i = 0; i < nonHighlightedColors.length; i++) {
          const stopStart = (i / nonHighlightedColors.length) * (shouldHighlight ? highlightSplitPercentage : 100)
          const stopEnd = ((i + 1) / nonHighlightedColors.length) * (shouldHighlight ? highlightSplitPercentage : 100)
          stops.push(`${nonHighlightedColors[i]} ${stopStart}% ${stopEnd}%`)
        }

        if (stops.length === 0) {
          stops.push(`transparent 0% ${highlightSplitPercentage}%`)
        }

        if (this.highlightUniverse) {
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
        return [
          this.square?.goals.map(g => g.completed ? '+' : '-').join(),
          this.square?.goals.map(g => g.text).join(),
        ].join()
      }
    },
    watch: {
      async stateHash(value, oldValue) {
        if (this.attentionEffectActive) {
          this.attentionEffectActive = false
          await this.$nextTick()
          await this.$nextTick()
        }

        this.attentionEffectActive = true

        // TODO: Do this properly
        setTimeout(() => {
          this.attentionEffectActive = false
        }, 2000)
      }
    }
  }
</script>

<style lang='scss' scoped>
  .bingo-card {
    perspective: 500px;
    position: relative;

    .bingo-card-inner {
      line-height: 1.1;
      text-align: center;
      transition: transform 500ms;
      position: relative;
      transform-style: preserve-3d;
      height: 100%;
      width: 100%;

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
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        backface-visibility: hidden;
        overflow: hidden;
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

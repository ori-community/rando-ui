<template>
  <div class="bingo-grid py-1" :style="gridStyle">
    <template v-if="edgeLabels">
      <wotw-bingo-board-edge-label label="X" @click="selectLine(1, 1, 1, 1)" />
      <wotw-bingo-board-edge-label
        v-for="x in multiverse.bingoBoard.size"
        :key="`${x}-top`"
        :label="alphabet[x - 1]"
        @click="selectLine(x, 1, 0, 1)"
      />
      <wotw-bingo-board-edge-label label="Y" @click="selectLine(1, multiverse.bingoBoard.size, 1, -1)" />
    </template>

    <template v-for="y in multiverse.bingoBoard.size">
      <template v-if="edgeLabels">
        <wotw-bingo-board-edge-label :key="`${y}-left`" :label="y.toString()" @click="selectLine(1, y, 1, 0)" />
      </template>

      <template v-for="x in multiverse.bingoBoard.size">
        <wotw-bingo-card
          :key="`${x}${y}`"
          :force-flip="x + y > unveilProgress"
          :square="hasSquare(x, y) ? squaresByPosition?.[x]?.[y]?.square : null"
          :universe-colors="universeColors"
          :hidden-universes="hiddenUniverses"
          :highlight-universe="highlightUniverse"
          :is-lockout="multiverse.bingoBoard.lockout"
          :marked="isSquareMarked(x, y)"
          :marked-neighbor-mask="getMarkedNeighborMask(x, y)"
          :own-universe-id="ownUniverseId"
          :attention-effect="cardAttentionEffect"
          @click='$store.commit("multiverseState/toggleBingoGoalMarked", {multiverseId: multiverse.id, x, y})'
        />
      </template>

      <template v-if="edgeLabels">
        <wotw-bingo-board-edge-label :key="`${y}-right`" :label="y.toString()" @click="selectLine(1, y, 1, 0)" />
      </template>
    </template>

    <template v-if="edgeLabels">
      <wotw-bingo-board-edge-label label="Y" @click="selectLine(1, multiverse.bingoBoard.size, 1, -1)" />
      <wotw-bingo-board-edge-label
        v-for="x in multiverse.bingoBoard.size"
        :key="`${x}-bottom`"
        :label="alphabet[x - 1]"
        @click="selectLine(x, 1, 0, 1)"
      />
      <wotw-bingo-board-edge-label label="X" @click="selectLine(1, 1, 1, 1)" />
    </template>
  </div>
</template>

<script>
  import { hasOwnProperty } from '~/assets/lib/hasOwnProperty'

  export default {
    name: 'WotwBingoBoard',
    props: {
      isSpectating: {
        type: Boolean,
        default: false,
      },
      multiverse: {
        type: Object,
        required: true,
      },
      cardAttentionEffect: {
        type: Boolean,
        required: true,
      },
      hiddenUniverses: {
        type: Array,
        default: () => ([]),
      },
      edgeLabels: {
        type: Boolean,
        default: false,
      },
      highlightUniverse: {
        type: Number,
        default: null,
      },
      spectatorDisplayAll: {
        type: Boolean,
        default: false,
      },
      ownUniverseId: {
        type: Number,
        default: null,
      },
    },
    data: () => ({
      unveilProgress: 0,
    }),
    computed: {
      alphabet() {
        return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      },
      gridStyle() {
        if (this.edgeLabels) {
          return {
            gridTemplateColumns: `auto repeat(${this.multiverse.bingoBoard.size}, minmax(0, 1fr)) auto`,
            gridTemplateRows: `auto repeat(${this.multiverse.bingoBoard.size}, minmax(0, 1fr)) auto`,
          }
        } else {
          return {
            gridTemplateColumns: `repeat(${this.multiverse.bingoBoard.size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${this.multiverse.bingoBoard.size}, minmax(0, 1fr))`,
          }
        }
      },
      squaresByPosition() { // 2D array of squares by [x][y]
        const squares = {}

        for (const square of this.multiverse.bingoBoard.squares) {
          if (!hasOwnProperty(squares, square.position.x)) {
            squares[square.position.x] = {}
          }

          squares[square.position.x][square.position.y] = square
        }

        return squares
      },
      universeColors() {
        const colorMap = {}
        for (const universe of this.multiverse.universes) {
          colorMap[universe.id] = universe.color
        }
        return colorMap
      },
    },
    mounted() {
      const intervalId = setInterval(() => {
        this.unveilProgress++

        if (this.unveilProgress >= this.multiverse.bingoBoard.size * 2) {
          clearInterval(intervalId)
        }
      }, 100)
    },
    methods: {
      hasSquare(x, y) {
        if (!this.isSpectating) {
          return hasOwnProperty(this.squaresByPosition, x) && hasOwnProperty(this.squaresByPosition?.[x], y)
        }

        if (this.spectatorDisplayAll) {
          return true
        }

        const square = this.squaresByPosition?.[x]?.[y]?.square
        return square?.visibleFor?.some(universeId => (!this.hiddenUniverses.includes(universeId)))

      },
      isSquareMarked(x, y) {
        return this.multiverse.markedBingoGoals.some(m => m.x === x && m.y === y)
      },
      getMarkedNeighborMask(x, y) {
        let mask = 0b0000
        mask += this.isSquareMarked(x, y - 1) ? 0b1000 : 0
        mask += this.isSquareMarked(x - 1, y) ? 0b0100 : 0
        mask += this.isSquareMarked(x + 1, y) ? 0b0010 : 0
        mask += this.isSquareMarked(x, y + 1) ? 0b0001 : 0
        return mask
      },
      selectLine(x, y, dX, dY) {
        const squares = []
        for (let a = x, b = y; a <= this.multiverse.bingoBoard.size && b <= this.multiverse.bingoBoard.size; a += dX, b += dY) {
          squares.push({ x: a, y: b })
        }
        this.$store.commit('multiverseState/toggleMultipleBingoGoalMarked', {
          multiverseId: this.multiverse.id,
          goals: squares,
        })
      },
    },
  }
</script>

<style lang="scss" scoped>
  .bingo-grid {
    display: grid;
    flex-grow: 1;
    grid-gap: 0.4em;

    .edge-label {
      display: flex;
      justify-content: center;
      align-items: center;
      line-height: 1;
    }
  }
</style>

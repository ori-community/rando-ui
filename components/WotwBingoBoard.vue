<template>
  <div class='bingo-grid py-1' :style='gridStyle'>
    <template v-if='edgeLabels'>
      <div></div>
      <div v-for='x in game.bingoBoard.size' :key='`${x}-top`' class='edge-label'>
        {{ alphabet[x - 1] }}
      </div>
      <div></div>
    </template>

    <template v-for='y in game.bingoBoard.size'>
      <div v-if='edgeLabels' :key='`${y}-left`' class='edge-label'>
        {{ y }}
      </div>

      <template v-for='x in game.bingoBoard.size'>
        <wotw-bingo-card
          :key='`${x}${y}`'
          :force-flip='x + y > unveilProgress'
          :square='hasSquare(x, y) ? squaresByPosition[x][y].square : null'
          :team-colors='teamColors'
          :hidden-teams='hiddenTeams'
          :highlight-team='highlightTeam'
        />
      </template>

      <div v-if='edgeLabels' :key='`${y}-right`' class='edge-label'>
        {{ y }}
      </div>
    </template>

    <template v-if='edgeLabels'>
      <div></div>
      <div v-for='x in game.bingoBoard.size' :key='`${x}-bottom`' class='edge-label'>
        {{ alphabet[x - 1] }}
      </div>
      <div></div>
    </template>
  </div>
</template>

<script>
  import { hasOwnProperty } from '~/assets/lib/hasOwnProperty'

  export default {
    name: 'WotwBingoBoard',
    props: {
      game: {
        type: Object,
        required: true,
      },
      teamColors: {
        type: Object,
        required: true,
      },
      hiddenTeams: {
        type: Array,
        default: () => ([]),
      },
      edgeLabels: {
        type: Boolean,
        default: false,
      },
      highlightTeam: {
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
            gridTemplateColumns: `auto repeat(${this.game.bingoBoard.size}, minmax(0, 1fr)) auto`,
            gridTemplateRows: `auto repeat(${this.game.bingoBoard.size}, minmax(0, 1fr)) auto`,
          }
        } else {
          return {
            gridTemplateColumns: `repeat(${this.game.bingoBoard.size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${this.game.bingoBoard.size}, minmax(0, 1fr))`,
          }
        }
      },
      squaresByPosition() { // 2D array of squares by [x][y]
        const squares = {}

        for (const square of this.game.bingoBoard.squares) {
          if (!hasOwnProperty(squares, square.position.x)) {
            squares[square.position.x] = {}
          }

          squares[square.position.x][square.position.y] = square
        }

        return squares
      },
    },
    mounted() {
      const intervalId = setInterval(() => {
        this.unveilProgress++

        if (this.unveilProgress >= this.game.bingoBoard.size * 2) {
          clearInterval(intervalId)
        }
      }, 100)
    },
    methods: {
      hasSquare(x, y) {
        return hasOwnProperty(this.squaresByPosition, x) && hasOwnProperty(this.squaresByPosition[x], y)
      }
    }
  }
</script>

<style lang='scss' scoped>
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

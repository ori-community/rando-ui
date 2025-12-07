<template>
  <div v-if="bingoBoard" class="bingo-grid py-1" :style="gridStyle">
    <template v-if="edgeLabels">
      <wotw-bingo-edge-label label="X" @click="selectLine(1, 1, 1, 1)"/>
      <wotw-bingo-edge-label
        v-for="x in bingoBoard.size"
        :key="`${x}-top`"
        :label="alphabet[x - 1]"
        @click="selectLine(x, 1, 0, 1)"
      />
      <wotw-bingo-edge-label label="Y" @click="selectLine(1, multiverse.bingoBoard.size, 1, -1)"/>
    </template>

    <template v-for="y in bingoBoard.size">
      <template v-if="edgeLabels">
        <wotw-bingo-edge-label :key="`${y}-left`" :label="y.toString()" @click="selectLine(1, y, 1, 0)"/>
      </template>
      <template v-for="x in bingoBoard.size" :key="`${x}${y}`">
        <wotw-bingo-card
          :force-flip="x + y > unveilProgress"
          :square="cardVisible(x, y) ? cardTable?.[x]?.[y] : null"
          :universe-colors="universeColors"
          :hidden-universes="hiddenUniverses"
          :highlight-universe="highlightUniverse"
          :is-lockout="bingoBoard.lockout"
          :marked="isCardMarked(x, y)"
          :marked-neighbor-mask="getMarkedNeighborMask(x, y)"
          :own-universe-id="ownUniverseId"
          :attention-effect="cardAttentionEffect"
          @click='$store.commit("multiverseState/toggleBingoGoalMarked", {multiverseId: multiverse.id, x, y})'
        />
      </template>

      <template v-if="edgeLabels">
        <wotw-bingo-edge-label :key="`${y}-right`" :label="y.toString()" @click="selectLine(1, y, 1, 0)"/>
      </template>
    </template>

    <template v-if="edgeLabels">
      <wotw-bingo-edge-label label="Y" @click="selectLine(1, multiverse.bingoBoard.size, 1, -1)"/>
      <wotw-bingo-edge-label
        v-for="x in bingoBoard.size"
        :key="`${x}-bottom`"
        :label="alphabet[x - 1]"
        @click="selectLine(x, 1, 0, 1)"
      />
      <wotw-bingo-edge-label label="X" @click="selectLine(1, 1, 1, 1)"/>
    </template>
  </div>
</template>

<script lang="ts" setup>

  import type {BingoSquare} from "@shared/types/http-api";

  const markedCards = ref<string[]>([])

  const props = defineProps<{
    edgeLabels: boolean,
    isSpectating: boolean,
    multiverseId: number,
    hiddenUniverses: number[],
    highlightedUniverse: number,
    ownUniverseId: number,
    cardAttentionEffect: boolean,
    spectatorDisplayAll: boolean,
  }>()

  const {multiverse, bingoBoard} = await useMultiverse(props.multiverseId)

  const alphabet = computed(() => {
    return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  })
  const gridStyle = computed(() => {
    if (props.edgeLabels) {
      return {
        gridTemplateColumns: `auto repeat(${bingoBoard.value.size}, minmax(0, 1fr)) auto`,
        gridTemplateRows: `auto repeat(${bingoBoard.value.size}, minmax(0, 1fr)) auto`,
      }
    } else {
      return {
        gridTemplateColumns: `repeat(${bingoBoard.value.size}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${bingoBoard.value.size}, minmax(0, 1fr))`,
      }
    }
  })
  const cardTable = computed(() => {
    if (!bingoBoard.value) {
      return null
    }
    const boardSize = bingoBoard.value.size + 1
    const squares: (BingoSquare | null)[][] =
      Array.from({length: boardSize}, () =>
        Array.from({length: boardSize}, () => null)
      )
    for (const positionedSquare of bingoBoard.value.squares) {
      if (!positionedSquare.position) {
        continue
      }
      squares[positionedSquare.position.x]![positionedSquare.position.y] = positionedSquare.square
    }
    return squares
  })
  const universeColors = computed(() => {
    const colorMap = {}
    for (const universe of multiverse.value.universes) {
      colorMap[universe.id] = universe.color
    }
    return colorMap
  })


  const cardVisible = ((x: number, y: number) => {
    if (!props.isSpectating) {
      return cardTable.value?.[x]?.[y] != null
    }

    if (props.spectatorDisplayAll) {
      return true
    }

    const square = cardTable.value?.[x]?.[y]
    return square?.visibleFor?.some(universeId => (!this.hiddenUniverses.includes(universeId)))

  })

  const isCardMarked = (x: number, y: number) => {
    const address = `${y}${alphabet.value[x - 1]}`
    return markedCards.value.includes(address)
  }

  const getMarkedNeighborMask = ((x: number, y: number) => {
    let mask = 0b0000
    mask += isCardMarked(x, y - 1) ? 0b1000 : 0
    mask += isCardMarked(x - 1, y) ? 0b0100 : 0
    mask += isCardMarked(x + 1, y) ? 0b0010 : 0
    mask += isCardMarked(x, y + 1) ? 0b0001 : 0
    return mask
  })

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

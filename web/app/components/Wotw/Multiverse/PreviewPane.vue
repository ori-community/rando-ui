<template>
  <div class="d-flex justify-center align-center mb-6">
    <h1 class="text-center mx-4">Game <small>#</small>{{ multiverse.id }}</h1>
    <v-btn icon variant="text" :to="{ name: 'game-multiverseId', params: { multiverseId: multiverse.id } }">
      <v-icon>mdi-chevron-right</v-icon>
    </v-btn>
  </div>
  <div class="multiverse-view text-center">
    <wotw-multiverse-view
      v-if="multiverse"
      :multiverse="multiverse"
      :is-spectating="true"
      :show-spectating-warning="false"
    />
  </div>
  <div v-if="multiverse.hasBingoBoard" class="board-container">
    <div class="d-flex justify-center">
      <v-btn variant="text" class="mb-3" @click="centerBoard">
        <v-icon start>mdi-image-filter-center-focus-strong-outline</v-icon>
        Center on screen
      </v-btn>
    </div>
    <div ref="boardRef">
      <wotw-bingo-board
        class="board"
        :edge-labels="false"
        :is-spectating="false"
        :multiverse-id="multiverse.id"
        :highlighted-universe-id="null"
        :own-universe-id="null"
        :card-attention-effect="false"
        :spectator-display-all="false"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
  const props = defineProps<{
    multiverseId: number,
  }>()

  const idAsNumber = computed(() => Number(props.multiverseId))

  const {multiverse, seed, bingoBoard, bingoUniverses} = await useMultiverse(idAsNumber)
</script>

<style lang="scss" scoped>

</style>

<template>
  <v-scroll-x-reverse-transition leave-absolute>
    <div :key="multiverseId">
      <div class="d-flex justify-center align-center mb-6">
        <h1 class="text-center mx-4">Game <small>#</small>{{ multiverse.id }}</h1>
        <v-btn icon variant="text" :to="{ name: 'game-multiverseId', params: { multiverseId: multiverse.id } }">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </div>
      <div class="multiverse-view text-center">
        <wotw-multiverse-view
          v-if="multiverse"
          :key="multiverse.id"
          :multiverse="multiverse"
          preview
        />
      </div>
      <div v-if="bingoBoard !== null" class="board-container">
        <wotw-bingo-board
          class="board"
          :edge-labels="false"
          :is-spectating="false"
          :multiverse="multiverse"
          :bingo-board="bingoBoard"
          :highlighted-universe-id="null"
          :own-universe-id="null"
          :card-attention-effect="false"
          :spectator-display-all="false"
        />
      </div>
    </div>
  </v-scroll-x-reverse-transition>
</template>

<script lang="ts" setup>
  const props = defineProps<{
    multiverseId: number,
  }>()

  const {multiverse, bingoBoard} = await useMultiverse(() => props.multiverseId)
</script>

<style lang="scss" scoped>
  .board {
    max-height: 100vh;
    margin: 0 auto;
  }
</style>

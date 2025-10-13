<template>
  <v-container>
    Hi bitte Injector.exe doppelklick und so warnungen ignorieren have fun!

    <v-text-field v-model="id" label="m ID" />
    <h2>Multiverse</h2>
    <div>{{ multiverse }}</div>

    <h2>Seed</h2>
    <div>{{ seed }}</div>

    <h2>Bingo Board</h2>
    <div>{{ bingoBoard }}</div>

    <h2>Bingo Universes</h2>
    <div>{{ bingoUniverses }}</div>
  </v-container>
</template>

<script lang="ts" setup>
  const id = ref("3453")
  const idAsNumber = computed(() => {
    return Number(id.value)
  })

  const {multiverse, seed, bingoBoard, bingoUniverses} = await useMultiverse(idAsNumber)
</script>

<style lang="scss" scoped>

</style>
